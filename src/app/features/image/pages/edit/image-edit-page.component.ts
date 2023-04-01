import { AfterViewInit, Component, HostListener, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { SaveImage } from "@app/store/actions/image.actions";
import { LoadThumbnail } from "@app/store/actions/thumbnail.actions";
import { State } from "@app/store/state";
import { ImageEditorSetCropperShown } from "@features/image/store/image.actions";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { RemoteSourceAffiliateApiService } from "@shared/services/api/classic/remote-source-affiliation/remote-source-affiliate-api.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { LoadingService } from "@shared/services/loading.service";
import { TitleService } from "@shared/services/title/title.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { ImageEditBasicFieldsService } from "@features/image/services/image-edit-basic-fields.service";
import { ImageEditModelInterface, ImageEditService } from "@features/image/services/image-edit.service";
import { ImageEditContentFieldsService } from "@features/image/services/image-edit-content-fields.service";
import { ImageEditWatermarkFieldsService } from "@features/image/services/image-edit-watermark-fields.service";
import { ImageEditThumbnailFieldsService } from "@features/image/services/image-edit-thumbnail-fields.service";
import { ImageEditSettingsFieldsService } from "@features/image/services/image-edit-settings-fields.service";
import { ImageEditEquipmentFieldsService } from "@features/image/services/image-edit-equipment-fields.service";
import { Observable } from "rxjs";
import { EquipmentPresetInterface } from "@features/equipment/types/equipment-preset.interface";
import { selectEquipmentPresets } from "@features/equipment/store/equipment.selectors";
import { filter, take, takeUntil } from "rxjs/operators";
import { FindEquipmentPresets, ItemBrowserSet } from "@features/equipment/store/equipment.actions";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { EquipmentItemType, EquipmentItemUsageType } from "@features/equipment/types/equipment-item-base.interface";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { SaveEquipmentPresetModalComponent } from "@features/image/components/save-equipment-preset-modal/save-equipment-preset-modal.component";
import { LoadEquipmentPresetModalComponent } from "@features/image/components/load-equipment-preset-modal/load-equipment-preset-modal.component";
import { UserService } from "@shared/services/user.service";
import { JsonApiService } from "@shared/services/api/classic/json/json-api.service";
import { CookieService } from "ngx-cookie";
import { ComponentCanDeactivate } from "@shared/services/guards/pending-changes-guard.service";
import { ImageEditAcquisitionFieldsService } from "@features/image/services/image-edit-acquisition-fields.service";
import { Constants } from "@shared/constants";
import { CopyAcquisitionSessionsFromAnotherImageModalComponent } from "@features/image/components/copy-acquisition-sessions-from-another-image-modal/copy-acquisition-sessions-from-another-image-modal.component";

@Component({
  selector: "astrobin-image-edit-page",
  templateUrl: "./image-edit-page.component.html",
  styleUrls: ["./image-edit-page.component.scss"]
})
export class ImageEditPageComponent
  extends BaseComponentDirective
  implements OnInit, ComponentCanDeactivate, AfterViewInit {
  readonly Constants = Constants;

  ImageAlias = ImageAlias;

  @ViewChild("stepperButtonsTemplate")
  stepperButtonsTemplate: TemplateRef<any>;

  @ViewChild("equipmentStepButtonsTemplate")
  equipmentStepButtonsTemplate: TemplateRef<any>;

  @ViewChild("acquisitionFilterSelectFooterTemplateExtra")
  acquisitionFilterSelectFooterTemplateExtra: TemplateRef<any>;

  @ViewChild("acquisitionAdditionalButtonsTemplate")
  acquisitionAdditionalButtonsTemplate: TemplateRef<any>;

  editingExistingImage: boolean;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly route: ActivatedRoute,
    public readonly router: Router,
    public readonly translateService: TranslateService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly titleService: TitleService,
    public readonly remoteSourceAffiliateApiService: RemoteSourceAffiliateApiService,
    public readonly loadingService: LoadingService,
    public readonly windowRefService: WindowRefService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly imageEditService: ImageEditService,
    public readonly imageEditBasicFieldsService: ImageEditBasicFieldsService,
    public readonly imageEditContentFieldsService: ImageEditContentFieldsService,
    public readonly imageEditWatermarkFieldsService: ImageEditWatermarkFieldsService,
    public readonly imageEditThumbnailFieldsService: ImageEditThumbnailFieldsService,
    public readonly imageEditEquipmentFieldsService: ImageEditEquipmentFieldsService,
    public readonly imageEditAcquisitionFieldsService: ImageEditAcquisitionFieldsService,
    public readonly imageEditSettingsFieldsService: ImageEditSettingsFieldsService,
    public readonly modalService: NgbModal,
    public readonly userService: UserService,
    public readonly jsonApiService: JsonApiService,
    public readonly cookieService: CookieService,
    public readonly utilsService: UtilsService
  ) {
    super(store$);
  }

  @ViewChild("remoteSourceLabelTemplate")
  set remoteSourceLabelTemplate(template: TemplateRef<any>) {
    this.imageEditService.remoteSourceLabelTemplate = template;
  }

  @ViewChild("remoteSourceOptionTemplate")
  set remoteSourceOptionTemplate(template: TemplateRef<any>) {
    this.imageEditService.remoteSourceOptionTemplate = template;
  }

  get presets$(): Observable<EquipmentPresetInterface[]> {
    return this.store$.select(selectEquipmentPresets).pipe(takeUntil(this.destroyed$));
  }

  @HostListener("window:beforeunload")
  canDeactivate(): Observable<boolean> | boolean {
    return this.imageEditService.form.pristine;
  }

  ngOnInit(): void {
    super.ngOnInit();

    const image = this.route.snapshot.data.image;
    this.imageEditService.model = image;
    this.imageEditService.model = {
      ...image,
      ...{
        imagingTelescopes2: image.imagingTelescopes2.map(x => x.id),
        imagingCameras2: image.imagingCameras2.map(x => x.id),
        mounts2: image.mounts2.map(x => x.id),
        filters2: image.filters2.map(x => x.id),
        accessories2: image.accessories2.map(x => x.id),
        software2: image.software2.map(x => x.id),
        guidingTelescopes2: image.guidingTelescopes2.map(x => x.id),
        guidingCameras2: image.guidingCameras2.map(x => x.id)
      }
    };
    this.imageEditService.groups = this.route.snapshot.data.groups;
    this.imageEditService.locations = this.route.snapshot.data.locations;

    this.editingExistingImage = !!this.imageEditService.model.subjectType;

    this.titleService.setTitle("Edit image");

    this._initBreadcrumb();

    this.store$.dispatch(
      new LoadThumbnail({
        data: { id: this.imageEditService.model.pk, revision: "0", alias: ImageAlias.HD },
        bustCache: false
      })
    );

    this.store$.dispatch(new FindEquipmentPresets());

    this.route.fragment.subscribe((fragment: string) => {
      if (!fragment) {
        this.router.navigate([`/i/${this.imageEditService.model.hash || this.imageEditService.model.pk}/edit`], {
          fragment: "1"
        });
      } else if (fragment === "3") {
        this.store$.dispatch(new ImageEditorSetCropperShown(true));
      }
    });

    this.remoteSourceAffiliateApiService.getAll().subscribe(remoteSourceAffiliates => {
      this.imageEditService.remoteSourceAffiliates = remoteSourceAffiliates;
      this._initFields();
    });
  }

  ngAfterViewInit(): void {
    this.imageEditAcquisitionFieldsService.acquisitionFilterSelectFooterTemplateExtra =
      this.acquisitionFilterSelectFooterTemplateExtra;
    this.imageEditAcquisitionFieldsService.acquisitionAdditionalButtonsTemplate =
      this.acquisitionAdditionalButtonsTemplate;
  }

  clearEquipment() {
    this.store$.dispatch(
      new ItemBrowserSet({
        type: EquipmentItemType.TELESCOPE,
        usageType: EquipmentItemUsageType.IMAGING,
        items: []
      })
    );

    this.store$.dispatch(
      new ItemBrowserSet({
        type: EquipmentItemType.CAMERA,
        usageType: EquipmentItemUsageType.IMAGING,
        items: []
      })
    );

    this.store$.dispatch(
      new ItemBrowserSet({
        type: EquipmentItemType.MOUNT,
        items: []
      })
    );

    this.store$.dispatch(
      new ItemBrowserSet({
        type: EquipmentItemType.FILTER,
        items: []
      })
    );

    this.store$.dispatch(
      new ItemBrowserSet({
        type: EquipmentItemType.ACCESSORY,
        items: []
      })
    );

    this.store$.dispatch(
      new ItemBrowserSet({
        type: EquipmentItemType.SOFTWARE,
        items: []
      })
    );

    this.store$.dispatch(
      new ItemBrowserSet({
        type: EquipmentItemType.TELESCOPE,
        usageType: EquipmentItemUsageType.GUIDING,
        items: []
      })
    );

    this.store$.dispatch(
      new ItemBrowserSet({
        type: EquipmentItemType.CAMERA,
        usageType: EquipmentItemUsageType.GUIDING,
        items: []
      })
    );
  }

  onClearEquipmentClicked() {
    if (this.imageEditService.hasEquipmentItems()) {
      this.modalService
        .open(ConfirmationDialogComponent)
        .closed.pipe(take(1))
        .subscribe(() => {
          this.clearEquipment();
        });
    }
  }

  onLoadEquipmentPresetClicked() {
    const modalRef: NgbModalRef = this.modalService.open(LoadEquipmentPresetModalComponent);
    const componentInstance: LoadEquipmentPresetModalComponent = modalRef.componentInstance;

    componentInstance.alreadyHasEquipment = this.imageEditService.hasEquipmentItems();
  }

  onSaveEquipmentPresetClicked() {
    if (this.imageEditService.hasEquipmentItems()) {
      this.imageEditService
        .currentEquipmentPreset$()
        .pipe(take(1))
        .subscribe(currentEquipmentPreset => {
          const modalRef: NgbModalRef = this.modalService.open(SaveEquipmentPresetModalComponent);
          const componentInstance: SaveEquipmentPresetModalComponent = modalRef.componentInstance;

          componentInstance.initialPreset = {
            name: !!currentEquipmentPreset ? currentEquipmentPreset.name : "",
            imagingTelescopes: this.imageEditService.model.imagingTelescopes2,
            guidingTelescopes: this.imageEditService.model.guidingTelescopes2,
            imagingCameras: this.imageEditService.model.imagingCameras2,
            guidingCameras: this.imageEditService.model.guidingCameras2,
            mounts: this.imageEditService.model.mounts2,
            filters: this.imageEditService.model.filters2,
            accessories: this.imageEditService.model.accessories2,
            software: this.imageEditService.model.software2
          };

          if (!!currentEquipmentPreset) {
            componentInstance.model.name = currentEquipmentPreset.name;
          }
        });
    }
  }

  onCopyAcquisitionSessionsFromAnotherImageClicked(event: Event) {
    if (event) {
      event.preventDefault();
    }

    const modalRef: NgbModalRef = this.modalService.open(CopyAcquisitionSessionsFromAnotherImageModalComponent);
    const componentInstance: CopyAcquisitionSessionsFromAnotherImageModalComponent = modalRef.componentInstance;

    componentInstance.alreadyHasAcquisitions =
      this.imageEditService.hasDeepSkyAcquisitions() || this.imageEditService.hasSolarSystemAcquisitions();
  }

  onSave(event: Event, next?: string) {
    if (event) {
      event.preventDefault();
    }

    if (this.imageEditEquipmentFieldsService.creationMode) {
      this.popNotificationsService.error(
        this.translateService.instant(
          "It looks like you are in the process of creating an equipment item, please complete or cancel that " +
          "operation before saving the entire form."
        ),
        null,
        {
          timeOut: 10000
        }
      );
      return;
    }

    if (!this.imageEditService.form.valid) {
      this.imageEditService.form.markAllAsTouched();

      const errorList: string[] = [];

      this.imageEditService.fields.forEach(topLevelField => {
        topLevelField.fieldGroup.forEach(stepField => {
          stepField.fieldGroup.forEach(field => {
            if (field.formControl.errors !== null) {
              errorList.push(`<li><strong>${stepField.props.label}:</strong> ${field.props.label}</li>`);
            }
          });
        });
      });

      this.popNotificationsService.error(
        `
        <p>
          ${this.translateService.instant("The following form fields have errors, please correct them and try again:")}
        </p>
        <ul>
          ${errorList.join("\n")}
        </ul>
        `,
        null,
        {
          enableHtml: true
        }
      );

      return;
    }

    this.store$.dispatch(
      new SaveImage({
        pk: this.imageEditService.model.pk,
        image: { ...this.imageEditService.model, ...this.imageEditService.form.value } as ImageEditModelInterface
      })
    );

    this.actions$.pipe(ofType(AppActionTypes.SAVE_IMAGE_SUCCESS)).subscribe(() => {
      this.imageEditService.form.markAsPristine();

      if (!!next) {
        this.loadingService.setLoading(true);
        UtilsService.openLink(this.windowRefService.nativeWindow.document, next);
      } else {
        this.popNotificationsService.success(this.translateService.instant("Image saved."));
      }
    });
  }

  private _initFields(): void {
    this.currentUser$
      .pipe(
        filter(user => !!user),
        take(1)
      )
      .subscribe(user => {
        const basic = {
          id: "image-stepper-basic-information",
          props: { label: this.translateService.instant("Basic information") },
          fieldGroup: [
            this.imageEditBasicFieldsService.getTitleField(),
            this.imageEditBasicFieldsService.getDescriptionField(),
            this.imageEditBasicFieldsService.getCollaboratorsField(),
            this.imageEditBasicFieldsService.getLinkField(),
            this.imageEditBasicFieldsService.getLinkToFitsField()
          ]
        };

        const content = {
          id: "image-stepper-content",
          props: { label: this.translateService.instant("Content") },
          fieldGroup: [
            this.imageEditContentFieldsService.getAcquisitionTypeField(),
            this.imageEditContentFieldsService.getSubjectTypeField(),
            this.imageEditContentFieldsService.getSolarSystemMainSubjectField(),
            this.imageEditContentFieldsService.getDataSourceField(),
            this.imageEditContentFieldsService.getRemoteSourceField(),
            this.imageEditContentFieldsService.getLocationsField(),
            this.imageEditContentFieldsService.getGroupsField()
          ]
        };

        const thumbnail = {
          id: "image-stepper-thumbnail",
          props: { label: this.translateService.instant("Thumbnail") },
          fieldGroup: [
            this.imageEditThumbnailFieldsService.getThumbnailField(),
            this.imageEditThumbnailFieldsService.getSharpenThumbnailsField()
          ]
        };

        const watermark = {
          id: "image-stepper-watermark",
          props: { label: this.translateService.instant("Watermark") },
          fieldGroup: [
            this.imageEditWatermarkFieldsService.getWatermarkCheckboxField(),
            this.imageEditWatermarkFieldsService.getWatermarkTextField(),
            this.imageEditWatermarkFieldsService.getWatermarkPosition(),
            this.imageEditWatermarkFieldsService.getWatermarkTextSize(),
            this.imageEditWatermarkFieldsService.getWatermarkTextOpacity()
          ]
        };

        const equipment = {
          id: "image-stepper-equipment",
          props: {
            label: this.translateService.instant("Equipment"),
            stepActionsTemplate: this.equipmentStepButtonsTemplate
          },
          fieldGroup: [
            this.imageEditEquipmentFieldsService.getImagingTelescopes(),
            this.imageEditEquipmentFieldsService.getImagingCameras(),
            this.imageEditEquipmentFieldsService.getMounts(),
            this.imageEditEquipmentFieldsService.getFilters(),
            this.imageEditEquipmentFieldsService.getAccessories(),
            this.imageEditEquipmentFieldsService.getSoftware(),
            this.imageEditEquipmentFieldsService.getShowGuidingEquipment(),
            this.imageEditEquipmentFieldsService.getGuidingTelescopes(),
            this.imageEditEquipmentFieldsService.getGuidingCameras()
          ]
        };

        const acquisition = {
          id: "image-stepper-acquisition",
          props: {
            label: this.translateService.instant("Acquisition")
          },
          fieldGroup: this.imageEditAcquisitionFieldsService.getFields()
        };

        const settings = {
          id: "image-stepper-settings",
          props: { label: this.translateService.instant("Settings") },
          fieldGroup: [
            this.imageEditSettingsFieldsService.getLicenseField(),
            this.imageEditSettingsFieldsService.getMouseHoverImageField(),
            this.imageEditSettingsFieldsService.getKeyValueTagsField(),
            this.imageEditSettingsFieldsService.getFullSizeDisplayLimitationField(),
            this.imageEditSettingsFieldsService.getDownloadLimitationField(),
            this.imageEditSettingsFieldsService.getAllowCommentsField()
          ]
        };

        const fieldGroup = [basic, content, thumbnail, watermark];

        if (this.userService.isInGroup(user, Constants.OWN_EQUIPMENT_MIGRATORS_GROUP)) {
          fieldGroup.push(equipment);
        }

        fieldGroup.push(acquisition);
        fieldGroup.push(settings);

        this.imageEditService.fields = [
          {
            type: "stepper",
            id: "image-stepper-field",
            props: {
              buttonsTemplate: this.stepperButtonsTemplate,
              fixed: true
            },
            fieldGroup
          }
        ];

        this.utilsService.delay(1).subscribe(() => {
          this.imageEditBasicFieldsService.onFieldsInitialized();
          this.imageEditContentFieldsService.onFieldsInitialized();
          this.imageEditWatermarkFieldsService.onFieldsInitialized();
          this.imageEditThumbnailFieldsService.onFieldsInitialized();
          this.imageEditEquipmentFieldsService.onFieldsInitialized();
          this.imageEditAcquisitionFieldsService.onFieldsInitialized();
          this.imageEditSettingsFieldsService.onFieldsInitialized();
        });
      });
  }

  private _initBreadcrumb(): void {
    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [
          {
            label: this.translateService.instant("Image")
          },
          {
            label: this.imageEditService.model.title
          },
          {
            label: this.translateService.instant("Edit")
          }
        ]
      })
    );
  }
}
