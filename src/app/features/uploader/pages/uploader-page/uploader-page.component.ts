import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { selectBackendConfig } from "@app/store/selectors/app/app.selectors";
import { State } from "@app/store/state";
import { environment } from "@env/environment";
import { Store } from "@ngrx/store";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { TitleService } from "@shared/services/title/title.service";
import { UploadDataService } from "@shared/services/upload-metadata/upload-data.service";
import { UserSubscriptionService } from "@shared/services/user-subscription/user-subscription.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { SubscriptionName } from "@shared/types/subscription-name.type";
import { UploadState, UploadxService } from "ngx-uploadx";
import { take, takeUntil } from "rxjs/operators";
import { selectCurrentUserProfile } from "@features/account/store/auth.selectors";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "astrobin-uploader-page",
  templateUrl: "./uploader-page.component.html",
  styleUrls: ["./uploader-page.component.scss"]
})
export class UploaderPageComponent extends BaseComponentDirective implements OnInit {
  form = new FormGroup({});
  uploadState: UploadState;
  SubscriptionName: typeof SubscriptionName = SubscriptionName;
  pageTitle = this.translate.instant("Uploader");

  model = {
    title: "",
    image_file: ""
  };

  fields: FormlyFieldConfig[] = [
    {
      key: "title",
      wrappers: ["default-wrapper"],
      id: "title",
      type: "input",
      templateOptions: {
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
      templateOptions: {
        required: true,
        experimentalTiffSupportWarning: true,
        veryLargeSizeWarning: true
      },
      validators: {
        validation: [{ name: "file-size", options: { max: 0 } }]
      }
    }
  ];

  uploadAllowed$ = this.userSubscriptionService.uploadAllowed$();

  constructor(
    public readonly store$: Store<State>,
    public readonly translate: TranslateService,
    public readonly uploaderService: UploadxService,
    public readonly uploadDataService: UploadDataService,
    public readonly windowRef: WindowRefService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly titleService: TitleService,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly router: Router,
    public readonly route: ActivatedRoute
  ) {
    super(store$);
  }

  get imageRevisionEtiquetteMessage(): string {
    return (
      `<strong>${this.translate.instant("Please note")}</strong>: ` +
      this.translate.instant("there is an etiquette regarding uploading a new image versus an image revision.") +
      " <a href='https://welcome.astrobin.com/features/image-revisions' target='_blank'>" +
      this.translate.instant("Learn more") +
      ".</a>"
    );
  }

  subscriptionWithYearlySlotsMessage(name: string, counter: number, slots: number): string {
    return this.translate.instant(
      "You have a <strong>{{0}}</strong> subscription. You have used <strong>{{1}}</strong> of " +
        "your <strong>{{2}}</strong> yearly upload slots.",
      {
        0: name,
        1: counter,
        2: slots
      }
    );
  }

  subscriptionWithTotalImagesMessage(name: string, counter: number, images: number): string {
    return this.translate.instant(
      "You have a <strong>{{0}}</strong> subscription. You have used <strong>{{1}}</strong> of " +
        "the <strong>{{2}}</strong> images allowed in your plan.",
      {
        0: name,
        1: counter,
        2: images
      }
    );
  }

  subscriptionWithTotalSlotsMessage(name: string, counter: number, slots: number): string {
    return this.translate.instant(
      "You have a <strong>{{0}}</strong> subscription. You have used <strong>{{1}}</strong> of " +
        "your <strong>{{2}}</strong> upload slots.",
      {
        0: name,
        1: counter,
        2: slots
      }
    );
  }

  subscriptionWithUnlimitedSlotsMessage(name: string): string {
    return this.translate.instant("You have a <strong>{{0}}</strong> subscription. Enjoy your unlimited uploads!", {
      0: name
    });
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.pageTitle);
    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [{ label: this.pageTitle }]
      })
    );

    this.store$.select(selectBackendConfig).subscribe(backendConfig => {
      this.uploadDataService.setEndpoint(`${environment.classicBaseUrl}${backendConfig.IMAGE_UPLOAD_ENDPOINT}`);
    });

    this.uploadDataService.setMetadata("image-upload", {
      is_wip: true,
      skip_notifications: true
    });

    this.userSubscriptionService.fileSizeAllowed(0).subscribe(result => {
      const field = this.fields.filter(x => x.key === "image_file")[0];
      const validator = field.validators.validation.filter(x => x.name === "file-size")[0];
      validator.options.max = result.max;
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
          this.router.navigate([`/i/${hash}/edit`]);
        }
      }
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
}
