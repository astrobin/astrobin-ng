import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
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
import { GroupApiService } from "@shared/services/api/classic/groups/group-api.service";
import { RemoteSourceAffiliateApiService } from "@shared/services/api/classic/remote-source-affiliation/remote-source-affiliate-api.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { LoadingService } from "@shared/services/loading.service";
import { TitleService } from "@shared/services/title/title.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ImageEditBasicFieldsService } from "@features/image/services/image-edit-basic-fields.service";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { ImageEditContentFieldsService } from "@features/image/services/image-edit-content-fields.service";
import { ImageEditWatermarkFieldsService } from "@features/image/services/image-edit-watermark-fields.service";
import { ImageEditThumbnailFieldsService } from "@features/image/services/image-edit-thumbnail-fields.service";
import { ImageEditSettingsFieldsService } from "@features/image/services/image-edit-settings-fields.service";
import { ImageEditEquipmentFieldsService } from "@features/image/services/image-edit-equipment-fields.service";

@Component({
  selector: "astrobin-image-edit-page",
  templateUrl: "./image-edit-page.component.html",
  styleUrls: ["./image-edit-page.component.scss"]
})
export class ImageEditPageComponent extends BaseComponentDirective implements OnInit {
  ImageAlias = ImageAlias;

  @ViewChild("stepperButtonsTemplate")
  stepperButtonsTemplate: TemplateRef<any>;

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
    public readonly imageEditSettingsFieldsService: ImageEditSettingsFieldsService
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

  ngOnInit(): void {
    this.imageEditService.image = this.route.snapshot.data.image;
    this.imageEditService.model = { ...this.imageEditService.image };
    this.imageEditService.groups = this.route.snapshot.data.groups;
    this.imageEditService.locations = this.route.snapshot.data.locations;

    this.titleService.setTitle("Edit image");

    this._initBreadcrumb();
    this.imageEditWatermarkFieldsService.initWatermarkSettings();

    this.store$.dispatch(
      new LoadThumbnail({ id: this.imageEditService.image.pk, revision: "0", alias: ImageAlias.HD })
    );

    this.route.fragment.subscribe((fragment: string) => {
      if (!fragment) {
        this.router.navigate([`/i/${this.imageEditService.image.hash || this.imageEditService.image.pk}/edit`], {
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

  onReturnToClassicEditor() {
    this.loadingService.setLoading(true);
    UtilsService.openLink(
      this.windowRefService.nativeWindow.document,
      this.classicRoutesService.EDIT_IMAGE_THUMBNAILS(
        this.imageEditService.image.hash || "" + this.imageEditService.image.pk
      ) + "?upload"
    );
  }

  onSave(event: Event, next: string) {
    if (event) {
      event.preventDefault();
    }

    if (!this.imageEditService.form.valid) {
      this.popNotificationsService.error(
        this.translateService.instant("Please check that all required fields have been filled at every step."),
        "The form is incomplete or has errors.",
        {
          timeOut: 10000
        }
      );
      return;
    }

    this.store$.dispatch(
      new SaveImage({
        pk: this.imageEditService.image.pk,
        data: { ...this.imageEditService.image, ...this.imageEditService.form.value }
      })
    );
    this.actions$.pipe(ofType(AppActionTypes.SAVE_IMAGE_SUCCESS)).subscribe(() => {
      this.loadingService.setLoading(true);
      UtilsService.openLink(this.windowRefService.nativeWindow.document, next);
    });
  }

  private _initFields(): void {
    this.imageEditService.fields = [
      {
        type: "stepper",
        id: "image-stepper-field",
        templateOptions: {
          image: this.imageEditService.image,
          buttonsTemplate: this.stepperButtonsTemplate,
          fixed: true
        },
        fieldGroup: [
          {
            id: "image-stepper-basic-information",
            templateOptions: { label: this.translateService.instant("Basic information") },
            fieldGroup: [
              this.imageEditBasicFieldsService.getTitleField(),
              this.imageEditBasicFieldsService.getDescriptionField(),
              this.imageEditBasicFieldsService.getLinkField(),
              this.imageEditBasicFieldsService.getLinkToFitsField()
            ]
          },
          {
            id: "image-stepper-content",
            templateOptions: { label: this.translateService.instant("Content") },
            fieldGroup: [
              this.imageEditContentFieldsService.getAcquisitionTypeField(),
              this.imageEditContentFieldsService.getSubjectTypeField(),
              this.imageEditContentFieldsService.getSolarSystemMainSubjectField(),
              this.imageEditContentFieldsService.getDataSourceField(),
              this.imageEditContentFieldsService.getRemoteSourceField(),
              this.imageEditContentFieldsService.getLocationsField(),
              this.imageEditContentFieldsService.getGroupsField()
            ]
          },
          {
            id: "image-stepper-thumbnail",
            templateOptions: { label: this.translateService.instant("Thumbnail") },
            fieldGroup: [
              this.imageEditThumbnailFieldsService.getThumbnailField(),
              this.imageEditThumbnailFieldsService.getSharpenThumbnailsField()
            ]
          },
          {
            id: "image-stepper-watermark",
            templateOptions: { label: this.translateService.instant("Watermark") },
            fieldGroup: [
              this.imageEditWatermarkFieldsService.getWatermarkCheckboxField(),
              this.imageEditWatermarkFieldsService.getWatermarkTextField(),
              this.imageEditWatermarkFieldsService.getWatermarkPosition(),
              this.imageEditWatermarkFieldsService.getWatermarkTextSize(),
              this.imageEditWatermarkFieldsService.getWatermarkTextOpacity()
            ]
          },
          {
            id: "image-stepper-equipment",
            templateOptions: { label: this.translateService.instant("Equipment") },
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
          },
          {
            id: "image-stepper-settings",
            templateOptions: { label: this.translateService.instant("Settings") },
            fieldGroup: [
              this.imageEditSettingsFieldsService.getLicenseField(),
              this.imageEditSettingsFieldsService.getMouseHoverImageField(),
              this.imageEditSettingsFieldsService.getKeyValueTagsField(),
              this.imageEditSettingsFieldsService.getFullSizeDisplayLimitationField(),
              this.imageEditSettingsFieldsService.getDownloadLimitationField(),
              this.imageEditSettingsFieldsService.getAllowCommentsField()
            ]
          }
        ]
      }
    ];
  }

  private _initBreadcrumb(): void {
    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [
          {
            label: this.translateService.instant("Image")
          },
          {
            label: this.imageEditService.image.title
          },
          {
            label: this.translateService.instant("Edit")
          }
        ]
      })
    );
  }
}
