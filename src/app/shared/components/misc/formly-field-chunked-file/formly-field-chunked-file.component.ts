import { Component, OnDestroy } from "@angular/core";
import { CustomTus } from "@features/uploader/custom-tus";
import { FieldType } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { FileUpload } from "@shared/components/misc/formly-field-chunked-file/file-upload";
import { Constants } from "@shared/constants";
import { AuthService } from "@shared/services/auth.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { UploadDataService } from "@shared/services/upload-metadata/upload-data.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { UploadState, UploadxOptions, UploadxService } from "ngx-uploadx";
import { Observable, Subscription } from "rxjs";
import { filter } from "rxjs/operators";

@Component({
  selector: "astrobin-formly-field-chunked-file",
  templateUrl: "./formly-field-chunked-file.component.html",
  styleUrls: ["./formly-field-chunked-file.component.scss"]
})
export class FormlyFieldChunkedFileComponent extends FieldType implements OnDestroy {
  upload: FileUpload;
  uploadState: UploadState;
  uploadOptions: UploadxOptions = {
    allowedTypes: "image/jpeg,image/png,image/gif",
    uploaderClass: CustomTus,
    chunkSize: 1024 * 1024,
    multiple: false,
    autoUpload: false,
    token: this.authService.getClassicApiToken(),
    metadata: {
      filename: new UtilsService().uuid()
    }
  };

  private readonly _metadataChangesSubscription: Subscription;
  private readonly _endpointChangesSubscription: Subscription;
  private _uploadEventsSubscription: Subscription;

  constructor(
    public authService: AuthService,
    public uploaderService: UploadxService,
    public uploadDataService: UploadDataService,
    public utilsService: UtilsService,
    public popNotificationsService: PopNotificationsService,
    public translateService: TranslateService
  ) {
    super();

    this.uploaderService.init(this.uploadOptions);

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
  }

  onUpload(state$: Observable<UploadState>) {
    this._uploadEventsSubscription = state$.subscribe((state: UploadState) => {
      this.uploadState = state;
      if (state.status === "added") {
        const extension = this.utilsService.fileExtension(state.name);
        if (Constants.ALLOWED_UPLOAD_EXTENSIONS.indexOf(extension) > -1) {
          this.upload = new FileUpload(state);
        } else {
          this.popNotificationsService.error(
            this.translateService.instant("File type not supported") + `: ${extension}`
          );
        }
      }
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
      this.uploadState.status === "uploading" &&
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

    if (this._uploadEventsSubscription) {
      this._uploadEventsSubscription.unsubscribe();
    }
  }
}
