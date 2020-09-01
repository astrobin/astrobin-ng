import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponent } from "@shared/components/base.component";
import { JsonApiService } from "@shared/services/api/classic/json/json-api.service";
import { AppContextService } from "@shared/services/app-context/app-context.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { TitleService } from "@shared/services/title/title.service";
import { UploadDataService } from "@shared/services/upload-metadata/upload-data.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { UploadState, UploadxService } from "ngx-uploadx";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-uploader-page",
  templateUrl: "./uploader-page.component.html",
  styleUrls: ["./uploader-page.component.scss"]
})
export class UploaderPageComponent extends BaseComponent implements OnInit {
  form = new FormGroup({});
  uploadState: UploadState;

  model = {
    title: "",
    image_file: "",
    is_wip: false,
    skip_notifications: false
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
      }
    },
    {
      key: "is_wip",
      id: "is_wip",
      type: "checkbox",
      templateOptions: {
        label: this.translate.instant("Upload to your Staging area"),
        description: this.translate.instant(
          "This will upload this image to your staging area, making it unlisted. The " +
            "image will be accessible by anyone with a direct link."
        ),
        change: this._onIsWipChange.bind(this)
      }
    },
    {
      key: "skip_notifications",
      id: "skip_notifications",
      type: "checkbox",
      templateOptions: {
        label: this.translate.instant("Skip notifications"),
        description: this.translate.instant("Do not notify your followers about this revision."),
        change: this._onSkipNotificationsChange.bind(this)
      },
      expressionProperties: {
        "templateOptions.disabled": "model.is_wip"
      }
    }
  ];

  appContext$ = this.appContext.context$;

  backendConfig$ = this.jsonApiService.getBackendConfig$();

  constructor(
    public appContext: AppContextService,
    public jsonApiService: JsonApiService,
    public translate: TranslateService,
    public uploaderService: UploadxService,
    public uploadDataService: UploadDataService,
    public popNotificationsService: PopNotificationsService,
    public windowRef: WindowRefService,
    public classicRoutesService: ClassicRoutesService,
    public titleService: TitleService
  ) {
    super();
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.translate.instant("Uploader") + " (beta)");

    this.uploaderService.events.pipe(takeUntil(this.destroyed$)).subscribe(uploadState => {
      this.uploadState = uploadState;

      if (uploadState.status === "error") {
        this.popNotificationsService.error(`Error: ${uploadState.responseStatus}`);
      } else if (uploadState.status === "complete") {
        const response = JSON.parse(uploadState.response);
        const pk = response.pk;
        const hash = response.hash;
        this.windowRef.nativeWindow.location.assign(`${this.classicRoutesService.IMAGE(hash || pk)}?upload`);
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

  private _onIsWipChange() {
    this.form.patchValue({ skip_notifications: true });
    this.uploadDataService.setMetadata("image-upload", { is_wip: this.model.is_wip });
  }

  private _onSkipNotificationsChange() {
    this.uploadDataService.setMetadata("image-upload", { skip_notifications: this.model.skip_notifications });
  }
}
