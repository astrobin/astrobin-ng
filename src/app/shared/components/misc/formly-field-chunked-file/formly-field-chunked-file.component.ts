import { Component, OnDestroy, OnInit } from "@angular/core";
import { FieldType } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { FileUpload } from "@shared/components/misc/formly-field-chunked-file/file-upload";
import { Constants } from "@shared/constants";
import { AuthService } from "@shared/services/auth.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { UploadDataService } from "@shared/services/upload-metadata/upload-data.service";
import { UserSubscriptionService } from "@shared/services/user-subscription/user-subscription.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { Tus, UploadState, UploadxOptions, UploadxService } from "ngx-uploadx";
import { Subscription } from "rxjs";
import { filter } from "rxjs/operators";

// PLEASE NOTE: due to the usage of the UploaderDataService, there can be only one chunked file upload field on a page
// at any given time.

@Component({
  selector: "astrobin-formly-field-chunked-file",
  templateUrl: "./formly-field-chunked-file.component.html",
  styleUrls: ["./formly-field-chunked-file.component.scss"]
})
export class FormlyFieldChunkedFileComponent extends FieldType implements OnInit, OnDestroy {
  upload: FileUpload;
  uploadState: UploadState;
  uploadOptions: UploadxOptions = {
    allowedTypes: Constants.ALLOWED_UPLOAD_EXTENSIONS.join(","),
    uploaderClass: Tus,
    chunkSize: 1024 * 1024,
    multiple: false,
    autoUpload: false,
    authorize: req => {
      const token = this.authService.getClassicApiToken();
      req.headers.Authorization = `Token ${token}`;
      return req;
    },
    metadata: {
      filename: new UtilsService().uuid()
    }
  };

  private _metadataChangesSubscription: Subscription;
  private _endpointChangesSubscription: Subscription;
  private _allowedTypesChangesSubscription: Subscription;

  constructor(
    public authService: AuthService,
    public uploaderService: UploadxService,
    public uploadDataService: UploadDataService,
    public utilsService: UtilsService,
    public popNotificationsService: PopNotificationsService,
    public translateService: TranslateService,
    public userSubscriptionService: UserSubscriptionService,
    public classicRoutesService: ClassicRoutesService
  ) {
    super();
  }

  ngOnInit() {
    this.uploaderService.init(this.uploadOptions);
    this.uploaderService.events.subscribe((state: UploadState) => {
      this.uploadState = state;

      if (state.responseStatus === 401) {
        this.popNotificationsService.error(
          this.translateService.instant("Authentication error. Please log out and in again.")
        );
        return;
      }

      if (state.status === "added") {
        this.uploaderService.queue = this.uploaderService.queue.slice(-1);

        const extension = this.utilsService.fileExtension(state.name);

        if (this.uploadOptions.allowedTypes.indexOf(`.${extension}`) > -1) {
          this.userSubscriptionService.fileSizeAllowed(state.size).subscribe(result => {
            if (result.allowed) {
              this.upload = new FileUpload(state);
            } else {
              const message =
                "Sorry, but this image is too large. Under your current subscription plan, the maximum allowed image size is {{max}}.";
              this.popNotificationsService.error(
                this.translateService.instant(message, {
                  max: result.max / 1024 / 1024 + " MB"
                })
              );
            }
          });
        } else {
          this.popNotificationsService.error(
            this.translateService.instant("File type not supported") + `: ${extension}`
          );
        }
      }
    });

    this._metadataChangesSubscription = this.uploadDataService.metadataChanges$
      .pipe(filter(event => !!event))
      .subscribe(event => {
        this.uploadOptions.metadata = {
          ...this.uploadOptions.metadata,
          ...event.metadata
        };
        this.uploaderService.queue.forEach(
          queue => (queue.metadata = { ...queue.metadata, ...this.uploadOptions.metadata })
        );
      });

    this._endpointChangesSubscription = this.uploadDataService.endpointChanges$.subscribe(endpoint => {
      this.uploadOptions.endpoint = endpoint;
    });

    this._allowedTypesChangesSubscription = this.uploadDataService.allowedTypesChanges$.subscribe(allowedTypes => {
      this.uploadOptions.allowedTypes = allowedTypes;
    });
  }

  getStatus(): string | null {
    if (!this.uploadState) {
      return null;
    }

    if (this.isInitializingUpload()) {
      return "Initializing upload, please wait...";
    } else if (this.isUploading()) {
      return "Uploading...";
    } else if (this.isFinalizingUpload() || this.isComplete()) {
      return "Finalizing upload, please wait...";
    }

    return null;
  }

  isActive(): boolean {
    return !this.uploadState || ["queue", "uploading", "paused", "complete"].indexOf(this.uploadState.status) === -1;
  }

  isInitializingUpload(): boolean {
    return this.uploadState && this.uploadState.status === "uploading" && !this.uploadState.progress;
  }

  isUploading(): boolean {
    return (
      this.uploadState &&
      ["uploading", "retry"].indexOf(this.uploadState.status) > -1 &&
      this.uploadState.progress &&
      this.uploadState.progress > 0
    );
  }

  isFinalizingUpload(): boolean {
    return this.uploadState && this.uploadState.status === "uploading" && this.uploadState.progress === 100;
  }

  isComplete(): boolean {
    return this.uploadState && this.uploadState.status === "complete";
  }

  ngOnDestroy(): void {
    if (this._metadataChangesSubscription) {
      this._metadataChangesSubscription.unsubscribe();
    }

    if (this._endpointChangesSubscription) {
      this._endpointChangesSubscription.unsubscribe();
    }

    if (this._allowedTypesChangesSubscription) {
      this._allowedTypesChangesSubscription.unsubscribe();
    }
  }
}
