import {
  ChangeDetectorRef,
  NgZone,
  OnDestroy,
  OnInit,
  ChangeDetectionStrategy,
  Component,
  Inject,
  PLATFORM_ID,
  Renderer2
} from "@angular/core";
import { selectBackendConfig } from "@app/store/selectors/app/app.selectors";
import { MainState } from "@app/store/state";
import { AuthService } from "@core/services/auth.service";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { UploadDataService } from "@core/services/upload-metadata/upload-data.service";
import { UserSubscriptionService } from "@core/services/user-subscription/user-subscription.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { Store } from "@ngrx/store";
import { FieldType } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { fadeInOut } from "@shared/animations";
import { FileUpload } from "@shared/components/misc/formly-field-chunked-file/file-upload";
import { Constants } from "@shared/constants";
import { UploadState, UploadxOptions, UploadxService, Tus } from "ngx-uploadx";
import { Subscription, forkJoin, Observable, of, switchMap } from "rxjs";
import { filter, map, take } from "rxjs/operators";

// PLEASE NOTE: due to the usage of the UploadDataService, there can be only one chunked file upload field on a page
// at any given time.

export class TusPost extends Tus {
  usePOST = false;

  override async sendFileContent(): Promise<number | undefined> {
    const uploadUsingPost = async (): Promise<number | undefined> => {
      const { body, start, end } = this.getChunk();
      const headers = {
        "X-HTTP-Method-Override": "PATCH",
        "Content-Type": "application/offset+octet-stream",
        "Upload-Offset": start
      };
      await this.request({ method: "POST", body, headers });
      return this.getOffsetFromResponse() || end;
    };

    if (this.usePOST) {
      return await uploadUsingPost();
    }

    try {
      // First try with PATCH (native Tus).
      return await super.sendFileContent();
    } catch (error) {
      // If PATCH fails, fallback to POST from now on.
      this.usePOST = true;
      return await uploadUsingPost();
    }
  }
}

@Component({
  selector: "astrobin-formly-field-chunked-file",
  templateUrl: "./formly-field-chunked-file.component.html",
  styleUrls: ["./formly-field-chunked-file.component.scss"],
  animations: [fadeInOut],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldChunkedFileComponent extends FieldType implements OnInit, OnDestroy {
  upload: FileUpload;
  uploadSize: number;
  uploadState: UploadState;
  uploadOptions: UploadxOptions;

  protected uploadLabel: string;

  private _uploaderServiceEventsSubscription: Subscription;
  private _metadataChangesSubscription: Subscription;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly authService: AuthService,
    public readonly uploaderService: UploadxService,
    public readonly uploadDataService: UploadDataService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translateService: TranslateService,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly windowRefService: WindowRefService,
    public readonly changeDetectorRef: ChangeDetectorRef,
    private readonly ngZone: NgZone
  ) {
    super();
  }

  get status$(): Observable<string> {
    if (!this.uploadState) {
      return of("");
    }

    if (this.isInitializingUpload()) {
      return this.translateService.stream("Uploading...");
    } else if (this.isUploading()) {
      return this.translateService.stream("Uploading...");
    } else if (this.isFinalizingUpload() || this.isComplete()) {
      return this.translateService.stream("Finalizing upload, please wait...");
    }

    return of("");
  }

  ngOnInit() {
    this.uploadLabel = this.field.props.uploadLabel || this.translateService.instant("Upload");
    this.uploadOptions = {
      endpoint: this.field.props.endpoint,
      allowedTypes: this.field.props.allowedTypes || Constants.ALLOWED_IMAGE_UPLOAD_EXTENSIONS.join(","),
      uploaderClass: TusPost,
      maxChunkSize: 2 * 1024 * 1024,
      multiple: typeof this.field.props.multile !== "undefined" ? this.field.props.multiple : false,
      autoUpload: typeof this.field.props.autoUpload !== "undefined" ? this.field.props.autoUpload : false,
      storeIncompleteHours: 0,
      retryConfig: {
        shouldRetry: (code, attempts) => {
          const retryCodes = [423, 503, 504, 520];
          return retryCodes.indexOf(code) !== -1 && attempts < 5;
        }
      },
      authorize: req => {
        const token = this.authService.getClassicApiToken();
        req.headers.Authorization = `Token ${token}`;
        return req;
      },
      metadata: {
        filename: UtilsService.uuid()
      }
    };

    this.store$
      .select(selectBackendConfig)
      .pipe(
        filter(backendConfig => !!backendConfig),
        take(1)
      )
      .subscribe(backendConfig => {
        this.uploadOptions = {
          ...this.uploadOptions,
          maxChunkSize: Math.min(this.uploadOptions.maxChunkSize, backendConfig.DATA_UPLOAD_MAX_MEMORY_SIZE)
        };
        this._initUploader();
        this.changeDetectorRef.markForCheck();
      });

    if (!!this.field.props.autoUpload) {
      this.uploadOptions = {
        ...this.uploadOptions,
        autoUpload: this.field.props.autoUpload
      };
    }
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

  /**
   * Handle files dropped through the drag-drop area component
   */
  handleFilesDrop(files: FileList | File[]): void {
    // Run inside NgZone to ensure change detection works properly
    this.ngZone.run(() => {
      if (files && files.length) {
        // Handle the files through the uploader service
        this.uploaderService.handleFiles(files, this.uploadOptions);
      }
    });
  }

  ngOnDestroy(): void {
    if (this._uploaderServiceEventsSubscription) {
      this._uploaderServiceEventsSubscription.unsubscribe();
    }

    if (this._metadataChangesSubscription) {
      this._metadataChangesSubscription.unsubscribe();
    }
  }

  private _initUploader(): void {
    this.uploaderService.init(this.uploadOptions);
    this._uploaderServiceEventsSubscription = this.uploaderService.events.subscribe((state: UploadState) => {
      if (state.status === "error") {
        let message: string;

        switch (state.responseStatus) {
          case 401:
            message = this.translateService.instant("Authentication error. Please log out and in again.");
            break;
          case 400:
            message = this.translateService.instant("Invalid data, please refresh the page and try again.");
            break;
          case 403:
            message = this.translateService.instant(
              "Permission denied. You don't have the required subscription level to perform this operation."
            );
            break;
          case 413:
            message = this.translateService.instant(
              "File too large. If you just upgraded your subscription, please try again in a few minutes. Thanks!"
            );
            break;
          case 415:
            message = this.translateService.instant(
              "AstroBin could not read your file as an image. Please try a different format."
            );
            break;
          case 423:
            message = this.translateService.instant(
              "Oops! Your request fell in between two AstroBin servers. Please clear your cache and try again."
            );
            break;
          case 500:
            message = this.translateService.instant(
              "AstroBin encountered an internal error. Please try again and contact us if the problem persists!"
            );
            break;
          case 0:
            message = this.translateService.instant(
              "AstroBin could not connect to the server. Often this is caused by an anti-virus or privacy " +
                "extension that blocks the connection. Please try disabling them and try again. If the problem " +
                "persists, please contact us."
            );
            break;
          default:
            message = this.translateService.instant(
              `Unhandled error (code: ${state.responseStatus}), please refresh the page and try again.`
            );
            break;
        }

        this.popNotificationsService.error(message, null, {
          disableTimeOut: true
        });
      } else if (state.status === "added") {
        // We only allow one upload at a time.
        this.uploaderService.queue = this.uploaderService.queue.slice(-1);

        this.popNotificationsService.clear();

        forkJoin([
          this._checkFileExtension(state.name),
          this._checkFileSize(state.name, state.size),
          this._checkImageDimensions(state.file)
        ]).subscribe(result => {
          if (result[0] && result[1] && result[2]) {
            this.upload = new FileUpload(state);
            this.uploadSize = state.size;
            this.formControl.setValue(state.file);
          } else {
            this.formControl.setValue(null);
          }
          this.changeDetectorRef.markForCheck();
        });
      }

      this.changeDetectorRef.markForCheck();
    });

    this._metadataChangesSubscription = this.uploadDataService.metadataChanges$
      .pipe(filter(event => !!event))
      .subscribe(event => {
        this.uploadOptions = {
          ...this.uploadOptions,
          metadata: {
            ...this.uploadOptions.metadata,
            ...event.metadata
          }
        };
        this.uploaderService.queue.forEach(
          queue => (queue.metadata = { ...queue.metadata, ...this.uploadOptions.metadata })
        );
        this.changeDetectorRef.markForCheck();
      });
  }

  private _checkFileExtension(filename: string): Observable<boolean> {
    const extension = UtilsService.fileExtension(filename).toLowerCase();

    if (this.uploadOptions.allowedTypes.indexOf(`.${extension}`) > -1) {
      this._warnAbout16BitTiff(filename);
      return of(true);
    }

    this.popNotificationsService.error(this.translateService.instant("File type not supported") + `: ${extension}`);

    return of(false);
  }

  private _checkFileSize(filename: string, size: number): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.store$
        .select(selectBackendConfig)
        .pipe(
          filter(backendConfig => !!backendConfig),
          take(1),
          switchMap(backendConfig => {
            if (!!backendConfig.MAX_FILE_SIZE && size > backendConfig.MAX_FILE_SIZE) {
              this.popNotificationsService.error(
                this.translateService.instant(
                  "Sorry, but this file is too large. For technical reasons, the largest size that's possible on " +
                    "AstroBin is {{max}}.",
                  {
                    max: UtilsService.humanFileSize(backendConfig.MAX_FILE_SIZE)
                  }
                )
              );
              observer.next(false);
              observer.complete();
            } else {
              return this.userSubscriptionService.fileSizeAllowed(size).pipe(
                map(result => {
                  if (result.allowed) {
                    this._warnAboutVeryLargeFile(filename, size);
                    observer.next(true);
                  } else {
                    this.popNotificationsService.error(
                      this.translateService.instant(
                        "Sorry, but this image is too large. Under your current subscription plan, the maximum " +
                          "allowed image size is {{max}}.",
                        {
                          max: UtilsService.humanFileSize(result.max)
                        }
                      )
                    );
                    observer.next(false);
                  }

                  observer.complete();
                })
              );
            }
          })
        )
        .subscribe();
    });
  }

  private _checkImageDimensions(file: File): Observable<boolean> {
    if (UtilsService.isImage(file.name)) {
      return new Observable<boolean>(observer => {
        // @ts-ignore
        const image = new Image();

        image.onerror = () => {
          const message =
            "Sorry, but we couldn't detect this file as an image. Are you sure it's a supported image type?";
          this.popNotificationsService.error(this.translateService.instant(message));
          observer.next(false);
          observer.complete();
        };

        image.onload = () => {
          this.store$
            .pipe(
              take(1),
              map(state => state.app.backendConfig)
            )
            .subscribe(backendConfig => {
              let width = image.naturalWidth || image.width;
              let height = image.naturalHeight || image.height;

              if (width === this.windowRefService.nativeWindow.innerWidth) {
                width = height = 0;
              }

              if (width * height > backendConfig.MAX_IMAGE_PIXELS) {
                const message =
                  "Sorry, but this image is too large. The maximum allowed total number of pixels is {{max}}.";
                this.popNotificationsService.error(
                  this.translateService.instant(message, {
                    max: +backendConfig.MAX_IMAGE_PIXELS
                  })
                );
                observer.next(false);
              } else {
                this.uploadDataService.patchMetadata("image-upload", {
                  width,
                  height
                });
                observer.next(true);
              }
              observer.complete();
            });
        };

        image.src = URL.createObjectURL(file);
      });
    } else if (UtilsService.isVideo(file.name)) {
      return new Observable<boolean>(observer => {
        const video = document.createElement("video");

        const handleCompletion = () => {
          URL.revokeObjectURL(video.src);
          observer.next(true);
          observer.complete();
        };

        video.onerror = () => {
          // We will let the backend verify the video and get the width and height.
          handleCompletion();
        };

        video.onloadedmetadata = () => {
          this.uploadDataService.patchMetadata("image-upload", {
            width: video.videoWidth,
            height: video.videoHeight
          });

          handleCompletion();
        };

        video.src = URL.createObjectURL(file);
      });
    }

    return of(true);
  }

  private _warnAboutVeryLargeFile(filename: string, size: number): void {
    const MB = 1024 * 1024;
    let message;

    if (!this.field.props.veryLargeSizeWarning) {
      return;
    }

    if (UtilsService.isImage(filename)) {
      if (size > 300 * MB) {
        message =
          this.translateService.instant(
            "Warning! That's a large file you got there! AstroBin does not impose artificial limitation in the file " +
              "size you can upload with an Ultimate subscription, but we cannot guarantee that all images above 500 MB or " +
              "~16000x16000 pixels will work. Feel free to give it a shot tho!"
          ) +
          " <a class='d-block mt-2' target='_blank' href='https://welcome.astrobin.com/faq#image-limits'>" +
          this.translateService.instant("Learn more") +
          "</a>";
      } else if (size > 100 * MB) {
        message =
          this.translateService.instant(
            "Heads up! Are you sure you want to upload such a large file? It's okay to do so but probably not many " +
              "people will want to see it at its full resolution, if it will take too long for them to download it."
          ) +
          " <a class='d-block mt-2' target='_blank' href='https://welcome.astrobin.com/faq#image-limits'>" +
          this.translateService.instant("Learn more") +
          "</a>";
      }

      if (!!message) {
        this.popNotificationsService.warning(message, null, {
          enableHtml: true,
          timeOut: 30000,
          closeButton: true
        });
      }
    }
  }

  private _warnAbout16BitTiff(filename: string): void {
    if (!this.field.props.experimentalTiffSupportWarning) {
      return;
    }

    const extension = UtilsService.fileExtension(filename).toLowerCase();

    if (extension === "tif" || extension === "tiff") {
      const message =
        this.translateService.instant("TIFF support on AstroBin is experimental.") +
        " <a class='d-block mt-2' target='_blank' href='https://welcome.astrobin.com/faq#image-formats'>" +
        this.translateService.instant("Learn more") +
        "</a>";

      this.popNotificationsService.warning(message, null, {
        enableHtml: true,
        timeOut: 30000,
        closeButton: true
      });
    }
  }
}
