import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { JsonApiService } from "@shared/services/api/classic/json/json-api.service";
import { AppContextService } from "@shared/services/app-context/app-context.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { TitleService } from "@shared/services/title/title.service";
import { UploadDataService } from "@shared/services/upload-metadata/upload-data.service";
import { UserSubscriptionService } from "@shared/services/user-subscription/user-subscription.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { SubscriptionName } from "@shared/types/subscription-name.type";
import { UploadState, UploadxService } from "ngx-uploadx";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-uploader-page",
  templateUrl: "./uploader-page.component.html",
  styleUrls: ["./uploader-page.component.scss"]
})
export class UploaderPageComponent extends BaseComponentDirective implements OnInit {
  form = new FormGroup({});
  uploadState: UploadState;
  SubscriptionName: typeof SubscriptionName = SubscriptionName;

  model = {
    title: "",
    image_file: ""
  };

  fields: FormlyFieldConfig[] = [
    {
      key: "title",
      id: "title",
      type: "input",
      templateOptions: {
        label: this.translate.instant("Title"),
        required: true,
        change: this._onTitleChange.bind(this)
      }
    },
    {
      key: "image_file",
      id: "image_file",
      type: "chunked-file",
      templateOptions: {
        required: true
      },
      validators: {
        validation: [{ name: "file-size", options: { max: 0 } }]
      }
    }
  ];

  appContext$ = this.appContext.context$;

  backendConfig$ = this.jsonApiService.getBackendConfig$();

  uploadAllowed$ = this.userSubscriptionService.uploadAllowed();

  constructor(
    public appContext: AppContextService,
    public jsonApiService: JsonApiService,
    public translate: TranslateService,
    public uploaderService: UploadxService,
    public uploadDataService: UploadDataService,
    public popNotificationsService: PopNotificationsService,
    public windowRef: WindowRefService,
    public classicRoutesService: ClassicRoutesService,
    public titleService: TitleService,
    public userSubscriptionService: UserSubscriptionService
  ) {
    super();
  }

  get liteMessage(): string {
    return (
      "You have an <strong>AstroBin Lite</strong> subscription. You have used <strong>{{counter}}</strong> of " +
      "your <strong>{{slots}}</strong> yearly upload slots."
    );
  }

  get lite2020Message(): string {
    return (
      "You have an <strong>AstroBin Lite</strong> subscription. You have used <strong>{{counter}}</strong> of " +
      "your <strong>{{slots}}</strong> upload slots."
    );
  }

  get freeMessage(): string {
    return (
      "You have an <strong>AstroBin Free</strong> membership. You have used <strong>{{counter}}</strong> of " +
      "your <strong>{{slots}}</strong> upload slots."
    );
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.translate.instant("Uploader") + " (beta)");

    this.uploadDataService.setMetadata("image-upload", { is_wip: true });
    this.uploadDataService.setMetadata("image-upload", { skip_notifications: true });

    this.userSubscriptionService.fileSizeAllowed(0).subscribe(result => {
      const field = this.fields.filter(x => x.key === "image_file")[0];
      const validator = field.validators.validation.filter(x => x.name === "file-size")[0];
      validator.options.max = result.max;
    });

    this.uploaderService.events.pipe(takeUntil(this.destroyed$)).subscribe(uploadState => {
      this.uploadState = uploadState;

      if (uploadState.status === "error") {
        this.popNotificationsService.error(`Error: ${uploadState.responseStatus}`);
      } else if (uploadState.status === "complete") {
        const response = JSON.parse(uploadState.response as string);
        const hash = response.hash;
        this.windowRef.nativeWindow.location.assign(`${this.classicRoutesService.EDIT_IMAGE_THUMBNAILS(hash)}?upload`);
      }
    });
  }

  onSubmit() {
    this.uploaderService.control({ action: "upload" });
  }

  uploadButtonDisabled(): boolean {
    return (
      !this.form.valid ||
      !this.uploadState ||
      ["queue", "uploading", "paused", "retry"].indexOf(this.uploadState.status) > -1
    );
  }

  uploadButtonLoading(): boolean {
    return (
      this.form.valid && this.uploadState && ["queue", "uploading", "complete"].indexOf(this.uploadState.status) > -1
    );
  }

  private _onTitleChange() {
    this.uploadDataService.setMetadata("image-upload", { title: this.model.title });
  }
}
