import {
  AfterViewInit,
  ChangeDetectorRef,
  OnInit,
  TemplateRef,
  ChangeDetectionStrategy,
  Component,
  ViewChild
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { selectBackendConfig } from "@app/store/selectors/app/app.selectors";
import { MainState } from "@app/store/state";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { TitleService } from "@core/services/title/title.service";
import { UploadDataService } from "@core/services/upload-metadata/upload-data.service";
import { UserSubscriptionService } from "@core/services/user-subscription/user-subscription.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { SubscriptionName } from "@core/types/subscription-name.type";
import { environment } from "@env/environment";
import { Store } from "@ngrx/store";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Constants } from "@shared/constants";
import { UploadState, UploadxService } from "ngx-uploadx";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-uploader-page",
  templateUrl: "./uploader-page.component.html",
  styleUrls: ["./uploader-page.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploaderPageComponent extends BaseComponentDirective implements OnInit, AfterViewInit {
  @ViewChild("additionalInfoTemplate") additionalInfoTemplate: TemplateRef<any>;

  form = new FormGroup({});
  uploadState: UploadState;
  SubscriptionName: typeof SubscriptionName = SubscriptionName;
  pageTitle = this.translate.instant("Uploader");
  imageRevisionEtiquetteMessage =
    this.translate.instant("Different take on existing data? Consider uploading as a revision.") +
    " <a href='https://welcome.astrobin.com/features/image-revisions' target='_blank'>" +
    this.translate.instant("Learn more") +
    ".</a>";

  model = {
    title: "",
    image_file: ""
  };

  fields: FormlyFieldConfig[];

  uploadAllowed$ = this.userSubscriptionService.uploadAllowed$();

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translate: TranslateService,
    public readonly uploaderService: UploadxService,
    public readonly uploadDataService: UploadDataService,
    public readonly windowRef: WindowRefService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly titleService: TitleService,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly router: Router,
    public readonly route: ActivatedRoute,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super(store$);
  }

  subscriptionWithYearlySlotsMessage(counter: number, slots: number): string {
    return this.translate.instant(
      "You have used <strong>{{1}}</strong> of your <strong>{{2}}</strong> yearly upload slots.",
      {
        1: counter,
        2: slots
      }
    );
  }

  subscriptionWithTotalImagesMessage(counter: number, images: number): string {
    return this.translate.instant(
      "You have used <strong>{{1}}</strong> of the <strong>{{2}}</strong> images allowed in your plan.",
      {
        1: counter,
        2: images
      }
    );
  }

  subscriptionWithTotalSlotsMessage(counter: number, slots: number): string {
    return (
      this.translate.instant("You have used <strong>{{1}}</strong> of your <strong>{{2}}</strong> upload slots.", {
        1: counter,
        2: slots
      }) +
      " " +
      this.translate.instant("Learn more about the {{1}}subscription plans{{2}}.", {
        1: "<a href='" + this.classicRoutesService.PRICING + "' target='_blank'>",
        2: "</a>"
      })
    );
  }

  subscriptionWithUnlimitedSlotsMessage(): string {
    return this.translate.instant("Enjoy your unlimited uploads!");
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.titleService.setTitle(this.pageTitle);
    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [{ label: this.pageTitle }]
      })
    );

    this.uploadDataService.setMetadata("image-upload", {
      is_wip: true,
      skip_notifications: true
    });

    this.uploaderService.events.pipe(takeUntil(this.destroyed$)).subscribe(uploadState => {
      this.uploadState = uploadState;

      if (uploadState.status === "complete") {
        const response = JSON.parse(uploadState.response as string);
        const hash = response.hash;
        const forceClassicEditor = this.route.snapshot.queryParams["forceClassicEditor"] !== undefined;

        if (forceClassicEditor) {
          this.windowRef.nativeWindow.location.assign(
            `${this.classicRoutesService.EDIT_IMAGE_THUMBNAILS(hash)}?upload`
          );
        } else {
          void this.router.navigate([`/i/${hash}/edit`]);
        }
      }

      this.changeDetectorRef.markForCheck();
    });
  }

  ngAfterViewInit() {
    this._initFields();

    this.userSubscriptionService.fileSizeAllowed(0).subscribe(result => {
      if (!this.fields) {
        return false;
      }

      const field = this.fields.filter(x => x.key === "image_file")[0];
      const validator = field.validators.validation.filter(x => x.name === "file-size")[0];
      validator.options.max = result.max;
      this.changeDetectorRef.markForCheck();
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.uploaderService.control({ action: "upload" });
    }
  }

  uploadButtonLoading(): boolean {
    return (
      this.form.valid &&
      this.uploadState &&
      ["queue", "uploading", "retry", "complete"].indexOf(this.uploadState.status) > -1
    );
  }

  private _onTitleChange() {
    const dangerWords = [
      // English
      "crop",
      "wider",
      "rework",
      "redux",
      "reprocess",
      "zoom",

      // Italian
      "rielaborat"
    ];
    if (new RegExp(dangerWords.join("|")).test(this.model.title.toLowerCase())) {
      this.popNotificationsService.warning(
        this.translate.instant(
          "If this file is a different take on the same data as in another image you already published on " +
            "AstroBin, the common practice would be to upload it as a new revision. For more info, please " +
            "{{0}}click here{{1}}.",
          {
            0: "<a href='https://welcome.astrobin.com/features/image-revisions' target='_blank'>",
            1: "</a>"
          }
        ),
        null,
        {
          enableHtml: true,
          closeButton: true,
          timeOut: 0
        }
      );
    }

    this.uploadDataService.setMetadata("image-upload", { title: this.model.title });
  }

  private _initFields(): void {
    this.fields = [
      {
        key: "title",
        wrappers: ["default-wrapper"],
        id: "title",
        type: "input",
        props: {
          label: this.translate.instant("Title"),
          required: true,
          maxLength: 128,
          change: this._onTitleChange.bind(this)
        }
      },
      {
        key: "image_file",
        id: "image_file",
        type: "chunked-file",
        props: {
          required: true,
          endpoint: `${environment.classicApiUrl}/api/v2/images/image-upload/`,
          allowedTypes:
            Constants.ALLOWED_IMAGE_UPLOAD_EXTENSIONS.join(",") +
            "," +
            Constants.ALLOWED_VIDEO_UPLOAD_EXTENSIONS.join(","),
          uploadLabel: this.uploadDataService.getUploadLabel(
            Constants.ALLOWED_IMAGE_UPLOAD_EXTENSIONS.concat(Constants.ALLOWED_VIDEO_UPLOAD_EXTENSIONS).join(",")
          ),
          experimentalTiffSupportWarning: true,
          veryLargeSizeWarning: true,
          additionalInfoTemplate: this.additionalInfoTemplate
        },
        validators: {
          validation: [{ name: "file-size", options: { max: 0 } }]
        }
      }
    ];
  }
}
