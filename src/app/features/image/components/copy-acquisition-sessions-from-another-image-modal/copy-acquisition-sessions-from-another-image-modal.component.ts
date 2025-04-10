import { ChangeDetectorRef, OnInit, TemplateRef, Component, Input, ViewChild } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MainState } from "@app/store/state";
import { ImageAlias } from "@core/enums/image-alias.enum";
import { ImageInterface } from "@core/interfaces/image.interface";
import { ImageApiService } from "@core/services/api/classic/images/image/image-api.service";
import { LoadingService } from "@core/services/loading.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { selectUser } from "@features/account/store/auth.selectors";
import { ItemBrowserAdd, LoadEquipmentItem } from "@features/equipment/store/equipment.actions";
import { selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { Observable, of, switchMap } from "rxjs";
import { filter, map, take } from "rxjs/operators";

@Component({
  selector: "astrobin-copy-acquisition-sessions-from-another-image-modal",
  templateUrl: "./copy-acquisition-sessions-from-another-image-modal.component.html",
  styleUrls: ["./copy-acquisition-sessions-from-another-image-modal.component.scss"]
})
export class CopyAcquisitionSessionsFromAnotherImageModalComponent extends BaseComponentDirective implements OnInit {
  fields: FormlyFieldConfig[];
  form: FormGroup = new FormGroup({});
  model: {
    image: ImageInterface | null;
    copyDatesAndTimesToo: boolean;
    copyLocalConditionsToo: boolean;
  } = {
    image: null,
    copyDatesAndTimesToo: false,
    copyLocalConditionsToo: false
  };

  @Input()
  alreadyHasAcquisitions = false;

  // Used to update the form with the selected filter.
  @Input()
  editPageComponentId: string;

  @ViewChild("imageOptionTemplate")
  imageOptionTemplate: TemplateRef<any>;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly modal: NgbActiveModal,
    public readonly modalService: NgbModal,
    public readonly imageApiService: ImageApiService,
    public readonly utilsService: UtilsService,
    public readonly imageEditService: ImageEditService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.utilsService.delay(1).subscribe(() => {
      this._setFields();
    });
  }

  getGalleryThumbnail(image: ImageInterface): string {
    return image.thumbnails.find(thumbnail => thumbnail.alias === ImageAlias.GALLERY).url;
  }

  onCopyClicked() {
    if (this.alreadyHasAcquisitions) {
      const modalRef = this.modalService.open(ConfirmationDialogComponent, { size: "sm" });
      const componentInstance: ConfirmationDialogComponent = modalRef.componentInstance;

      componentInstance.message = this.translateService.instant(
        "This operation will overwrite the current acquisition sessions."
      );

      modalRef.closed.pipe(take(1)).subscribe(() => {
        this.load(this.model.image);
      });

      return;
    }

    this.load(this.model.image);
  }

  load(image: ImageInterface) {
    const newModel = {
      ...this.imageEditService.model,
      ...{
        deepSkyAcquisitions: image.deepSkyAcquisitions.map(acquisition => ({
          ...acquisition,
          ...{
            id: null,
            savedOn: null
          }
        })),
        solarSystemAcquisitions: image.solarSystemAcquisitions.map(acquisition => ({
          ...acquisition,
          ...{
            id: null,
            saveOn: null
          }
        }))
      }
    };

    if (!this.model.copyDatesAndTimesToo) {
      newModel.deepSkyAcquisitions = newModel.deepSkyAcquisitions.map(acquisition => ({
        ...acquisition,
        ...{
          date: null
        }
      }));

      newModel.solarSystemAcquisitions = newModel.solarSystemAcquisitions.map(acquisition => ({
        ...acquisition,
        ...{
          id: null,
          date: null,
          time: null
        }
      }));
    }

    if (!this.model.copyLocalConditionsToo) {
      newModel.deepSkyAcquisitions = newModel.deepSkyAcquisitions.map(acquisition => ({
        ...acquisition,
        ...{
          bortle: null,
          meanSqm: null,
          meanFwhm: null,
          temperature: null
        }
      }));

      newModel.solarSystemAcquisitions = newModel.solarSystemAcquisitions.map(acquisition => ({
        ...acquisition,
        ...{
          id: null,
          cmi: null,
          cmii: null,
          cmiii: null,
          seeing: null,
          transparency: null
        }
      }));
    }

    this.imageEditService.model = {
      ...this.imageEditService.model,
      ...newModel
    };

    this.imageEditService.form.patchValue({ deepSkyAcquisitions: newModel.deepSkyAcquisitions });
    this.imageEditService.form.patchValue({ solarSystemAcquisitions: newModel.solarSystemAcquisitions });

    const acquisitionWithFilters = image.deepSkyAcquisitions.filter(acquisition => !!acquisition.filter2);
    let processedAcquisitions = 0;

    if (acquisitionWithFilters.length > 0) {
      this.loadingService.setLoading(true);

      acquisitionWithFilters.forEach(acquisition => {
        const storeData = { id: acquisition.filter2, type: EquipmentItemType.FILTER };
        this.store$.dispatch(new LoadEquipmentItem(storeData));
        this.store$
          .select(selectEquipmentItem, storeData)
          .pipe(
            filter(item => !!item),
            take(1)
          )
          .subscribe(item => {
            this.store$.dispatch(
              new ItemBrowserAdd({
                type: EquipmentItemType.FILTER,
                usageType: undefined,
                item,
                componentId: this.editPageComponentId
              })
            );
            processedAcquisitions++;

            if (processedAcquisitions === acquisitionWithFilters.length) {
              this.loadingService.setLoading(false);
              this.modal.close();
            }
          });
      });
    } else {
      this.modal.close();
    }
  }

  _getImageFieldDescription() {
    let description = "";

    if (this.imageEditService.isDeepSky()) {
      description += ` ${this.translateService.instant(
        "This field only searches images with deep sky acquisitions filled in."
      )}`;
    } else if (this.imageEditService.isSolarSystem()) {
      description += ` ${this.translateService.instant(
        "This field only searches images with solar system acquisitions filled in."
      )}`;
    }

    return description;
  }

  _getCopyDatesAndTimesTooFieldLabel() {
    let label = "";

    if (this.imageEditService.isDeepSky()) {
      label += ` ${this.translateService.instant("Copy dates too")}`;
    } else if (this.imageEditService.isSolarSystem()) {
      label += ` ${this.translateService.instant("Copy dates and times too")}`;
    }

    return label;
  }

  _getCopyLocalConditionsTooFieldDescription() {
    let description = "";

    if (this.imageEditService.isDeepSky()) {
      description += ` ${this.translateService.instant(
        "This includes: Bortle scale, mean SQM, mean FWMW, and temperature."
      )}`;
    } else if (this.imageEditService.isSolarSystem()) {
      description += ` ${this.translateService.instant("This includes: CMI/CMII/CMIII, seeing, and transparency.")}`;
    }

    return description;
  }

  _setFields() {
    this.fields = [
      {
        key: "image",
        type: "ng-select",
        wrappers: ["default-wrapper"],
        props: {
          required: true,
          optionTemplate: this.imageOptionTemplate,
          label: this.translateService.instant("Image"),
          description: this._getImageFieldDescription(),
          options: of([]),
          onSearch: (q: string): Observable<any[]> => {
            return new Observable<any[]>(observer => {
              if (!q) {
                observer.next();
                observer.complete();
                return;
              }

              const field = this.fields.find(f => f.key === "image");

              this.store$
                .select(selectUser, this.imageEditService.model.user)
                .pipe(
                  take(1),
                  switchMap(user =>
                    this.imageApiService.findImages({
                      userId: user.id,
                      q,
                      hasDeepSkyAcquisitions: this.imageEditService.isDeepSky(),
                      hasSolarSystemAcquisitions: this.imageEditService.isSolarSystem()
                    })
                  ),
                  map(response => response.results),
                  map(images => {
                    return images.map(image => ({
                      value: image,
                      label: image.title
                    }));
                  })
                )
                .subscribe(options => {
                  field.props = {
                    ...field.props,
                    options: of(options)
                  };
                  observer.next(options);
                  observer.complete();
                });
            });
          }
        }
      },
      {
        key: "copyDatesAndTimesToo",
        type: "checkbox",
        wrappers: ["default-wrapper"],
        props: {
          required: true,
          label: this._getCopyDatesAndTimesTooFieldLabel()
        }
      },
      {
        key: "copyLocalConditionsToo",
        type: "checkbox",
        wrappers: ["default-wrapper"],
        props: {
          required: true,
          label: this.translateService.instant("Copy local conditions too"),
          description: this._getCopyLocalConditionsTooFieldDescription()
        }
      }
    ];
  }
}
