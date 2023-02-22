import { ChangeDetectorRef, Component, Input, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { FormGroup } from "@angular/forms";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { Actions } from "@ngrx/effects";
import { LoadingService } from "@shared/services/loading.service";
import { TranslateService } from "@ngx-translate/core";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { Observable, of, switchMap } from "rxjs";
import { ImageApiService } from "@shared/services/api/classic/images/image/image-api.service";
import { filter, map, take } from "rxjs/operators";
import { UtilsService } from "@shared/services/utils/utils.service";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { ItemBrowserAdd, LoadEquipmentItem } from "@features/equipment/store/equipment.actions";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { selectEquipmentItem } from "@features/equipment/store/equipment.selectors";

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
  } = {
    image: null
  };

  @Input()
  alreadyHasAcquisitions = false;

  @ViewChild("imageOptionTemplate")
  imageOptionTemplate: TemplateRef<any>;

  constructor(
    public readonly store$: Store<State>,
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
    this.imageEditService.model = {
      ...this.imageEditService.model,
      ...{
        deepSkyAcquisitions: image.deepSkyAcquisitions.map(acquisition => ({
          ...acquisition,
          ...{
            id: null,
            date: null,
            bortle: null,
            meanSqm: null,
            meanFwhm: null,
            temperature: null,
            savedOn: null
          }
        })),
        solarSystemAcquisitions: image.solarSystemAcquisitions.map(acquisition => ({
          ...acquisition,
          ...{
            id: null,
            date: null,
            time: null,
            cmi: null,
            cmii: null,
            cmiii: null,
            seeing: null,
            transparency: null,
            saveOn: null
          }
        }))
      }
    };

    const acquisitionWithFilters = image.deepSkyAcquisitions.filter(acquisition => !!acquisition.filter2);
    let processedAcquisitions = 0;

    if (acquisitionWithFilters.length > 0) {
      this.loadingService.setLoading(true);

      acquisitionWithFilters.forEach(acquisition => {
        const storeData = { id: acquisition.filter2, type: EquipmentItemType.FILTER };
        this.store$.dispatch(new LoadEquipmentItem(storeData));
        this.store$.select(selectEquipmentItem, storeData).pipe(
          filter(item => !!item),
          take(1)
        ).subscribe(item => {
          this.store$.dispatch(new ItemBrowserAdd({ type: EquipmentItemType.FILTER, usageType: undefined, item }));
          processedAcquisitions++;

          if (processedAcquisitions == acquisitionWithFilters.length) {
            this.loadingService.setLoading(false);
            this.modal.close();
          }
        });
      });
    } else {
      this.modal.close();
    }
  }

  _setFields() {
    let description = this.translateService.instant(
      "All acquisition details will be copied except dates, times, and local conditions."
    );

    if (this.imageEditService.isDeepSky()) {
      description += ` ${this.translateService.instant(
        "This field only searches images with deep sky acquisitions filled in."
      )}`;
    } else if (this.imageEditService.isSolarSystem()) {
      description += ` ${this.translateService.instant(
        "This field only searches images with solar system acquisitions filled in."
      )}`;
    }

    this.fields = [
      {
        key: "image",
        type: "ng-select",
        wrappers: ["default-wrapper"],
        props: {
          required: true,
          optionTemplate: this.imageOptionTemplate,
          label: this.translateService.instant("Image"),
          description,
          options: of([]),
          onSearch: (q: string): Observable<any[]> => {
            return new Observable<any[]>(observer => {
              if (!q) {
                observer.next();
                observer.complete();
                return;
              }

              const field = this.fields.find(f => f.key === "image");

              this.currentUser$
                .pipe(
                  take(1),
                  switchMap(user => this.imageApiService.findImages({
                    userId: user.id,
                    q,
                    hasDeepSkyAcquisitions: this.imageEditService.isDeepSky(),
                    hasSolarSystemAcquisitions: this.imageEditService.isSolarSystem()
                  })),
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
      }
    ];
  }
}
