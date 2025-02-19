import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding, Inject, Input, OnChanges, OnDestroy, OnInit, Output, PLATFORM_ID, Renderer2, SimpleChanges, ViewChild } from "@angular/core";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { ForceCheckImageAutoLoad, LoadImage, LoadImages } from "@app/store/actions/image.actions";
import { LoadThumbnail, LoadThumbnailCancel } from "@app/store/actions/thumbnail.actions";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { selectThumbnail } from "@app/store/selectors/app/thumbnail.selectors";
import { MainState } from "@app/store/state";
import { select, Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageAlias } from "@core/enums/image-alias.enum";
import { FINAL_REVISION_LABEL, ImageInterface, ImageRevisionInterface } from "@core/interfaces/image.interface";
import { ImageService } from "@core/services/image/image.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { delay, filter, first, map, switchMap, take, takeUntil, tap } from "rxjs/operators";
import { fromEvent, interval, merge, Observable, of, Subject, Subscription, throttleTime } from "rxjs";
import { Actions, ofType } from "@ngrx/effects";
import { isPlatformBrowser } from "@angular/common";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { ImageApiService } from "@core/services/api/classic/images/image/image-api.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { TranslateService } from "@ngx-translate/core";

declare const videojs: any;

@Component({
  selector: "astrobin-image",
  templateUrl: "./image.component.html",
  styleUrls: ["./image.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageComponent extends BaseComponentDirective implements OnInit, OnChanges, OnDestroy {
  @Input()
  @HostBinding("attr.data-id")
  id: ImageInterface["pk"];

  @Input()
  image: ImageInterface;

  @Input()
  revisionLabel = FINAL_REVISION_LABEL;

  @Input()
  alias: ImageAlias;

  @Input()
  autoHeight = true;

  @Input()
  forceLoad = false;

  @Output()
  loaded = new EventEmitter();

  @Output()
  imageClick = new EventEmitter<MouseEvent>();

  @Output()
  imageTouchstart = new EventEmitter<TouchEvent>();

  @Output()
  imageMouseEnter = new EventEmitter<MouseEvent>();

  @Output()
  imageMouseLeave = new EventEmitter<MouseEvent>();

  @HostBinding("class.loading")
  loading = false;

  @HostBinding('style.--height')
  get videoHeight(): string {
    return this.revision?.videoFile && this.height ? `${this.height}px` : 'auto';
  }

  @ViewChild("videoPlayerElement", { static: false })
  videoPlayerElement: ElementRef;

  thumbnailUrl: SafeUrl;

  protected naturalWidth: number;
  protected width: number;
  protected height: number;
  protected imageLoadingProgress = 0;
  protected videoEncodingProgress = 0;
  protected videoJsReady = false;
  protected revision: ImageInterface | ImageRevisionInterface;

  private readonly _isBrowser: boolean;
  private _videoJsPlayer: any;
  private _autoLoadSubscription: Subscription;
  private _pollingVideEncoderProgress = false;
  private _stopPollingVideoEncoderProgress = new Subject<void>();
  private _retrySetWidthAndHeight = new Subject<void>();

  private _previousThumbnailUrl: string;
  private _previousVideoFile: string;

  private _dimensionsRetryCount = 0;
  private readonly MAX_RETRIES = 5;
  private readonly RETRY_DELAY = 300;
  private _dimensionsInterval: any;
  private _loadImageFileSubscription: Subscription;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly imageService: ImageService,
    public readonly elementRef: ElementRef,
    public readonly utilsService: UtilsService,
    public readonly windowRefService: WindowRefService,
    public readonly domSanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    public readonly renderer: Renderer2,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly imageApiService: ImageApiService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translateService: TranslateService
  ) {
    super(store$);

    this._isBrowser = isPlatformBrowser(this.platformId);

    this._retrySetWidthAndHeight.pipe(
      delay(this.RETRY_DELAY),
      takeUntil(this.destroyed$)
    ).subscribe(() => {
      if (this.revision) {
        this._setWidthAndHeight(this.revision.w, this.revision.h);
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  get videoSetup(): string {
    const setup = {
      fluid: false,
      liveui: true,
      loop: this.revision?.loopVideo || false
    };
    return JSON.stringify(setup);
  }

  ngOnInit() {
    super.ngOnInit();

    if (!this.id && !this.image) {
      throw new Error("Attribute 'id' or 'image' is required");
    }

    if (!this.alias) {
      throw new Error("Attribute 'alias' is required");
    }

    this._setupAutoLoad();
  }

  ngOnChanges(changes: SimpleChanges) {
    const imageChanged = changes.image && !!changes.image.currentValue;
    const revisionLabelChanged = changes.revisionLabel && !!changes.revisionLabel.currentValue;

    if (imageChanged) {
      this.id = this.image.pk;
    }

    if (imageChanged || revisionLabelChanged) {
      this.revisionLabel = this.imageService.validateRevisionLabel(this.image, this.revisionLabel);
      this.revision = this.imageService.getRevision(this.image, this.revisionLabel);
    }

    const previousThumbnailUrl = this._previousThumbnailUrl;
    const previousVideoFile = this._previousVideoFile;

    const newThumbnailUrl = this.revision && this._getRevisionThumbnailUrl();
    const newVideoFile = this.revision?.videoFile;

    const thumbnailUrlChanged = (newThumbnailUrl || "") !== (previousThumbnailUrl || "");
    const videoFileChanged = (newVideoFile || "") !== (previousVideoFile || "");
    const isInitialLoad = previousThumbnailUrl === undefined && previousVideoFile === undefined;

    if (thumbnailUrlChanged || videoFileChanged || isInitialLoad) {
      this.thumbnailUrl = null;
      this.loading = false;
      this._stopPollingVideoEncoderProgress.next();
      this._disposeVideoJsPlayer();

      // Delay this because there might be the fullscreen viewer in front that cause the image not to be in the
      // visible viewport. A delay of a few ms causes the fullscreen viewer to have time to auto-hide.
      this.utilsService.delay(10).subscribe(() => {
        this.load();
        this.changeDetectorRef.markForCheck();
      });
    }

    this._previousThumbnailUrl = newThumbnailUrl;
    this._previousVideoFile = newVideoFile;
  }


  ngOnDestroy(): void {
    if (this._loadImageFileSubscription) {
      this._loadImageFileSubscription.unsubscribe();
      this._loadImageFileSubscription = null;
    }

    if (this._dimensionsInterval) {
      clearInterval(this._dimensionsInterval);
      this._dimensionsInterval = null;
    }

    if (this.thumbnailUrl && this._isBrowser) {
      (this.windowRefService.nativeWindow as any).URL.revokeObjectURL(this.thumbnailUrl as string);
    }

    this.store$.dispatch(
      new LoadThumbnailCancel({
        thumbnail: {
          id: this.id,
          revision: this.revisionLabel,
          alias: this.alias
        }
      })
    );

    if (this._autoLoadSubscription) {
      this._autoLoadSubscription.unsubscribe();
      this._autoLoadSubscription = null;
    }

    this._disposeVideoJsPlayer();

    super.ngOnDestroy();
  }

  load() {
    const noNeedToLoad = () =>
      !this.utilsService.isNearOrInViewport(this.elementRef.nativeElement) ||
      this.loading ||
      !this._isBrowser;

    if (!this.forceLoad && noNeedToLoad()) {
      return;
    }

    this.loading = true;

    this._getImageObject()
      .pipe(
        filter(image => !!image),
        take(1)
      )
      .subscribe(image => {
        this.revision = this.imageService.getRevision(image, this.revisionLabel);
        this.changeDetectorRef.markForCheck();

        if (this.thumbnailUrl && !this.revision.videoFile) {
          this.loaded.emit();
          return;
        }

        this.image = image;
        this.id = image.pk;
        this._loadThumbnail();

        if (this.revision.videoFile && !this.revision.encodedVideoFile) {
          this._pollingVideoEncodingProgress();
        }

        if (!this.revision.videoFile) {
          this._setWidthAndHeight(this.revision.w, this.revision.h);
        }

        this.changeDetectorRef.markForCheck();
      });

    this.store$.dispatch(new LoadImage({ imageId: this.id }));
  }

  onLoad(event) {
    if (this._autoLoadSubscription) {
      this._autoLoadSubscription.unsubscribe();
      this._autoLoadSubscription = null;
    }

    if (!this.revision.videoFile) {
      this.loaded.emit();
    }
  }

  onClick(event: MouseEvent) {
    event.preventDefault();
    this.imageClick.emit(event);
  }

  onTouchstart(event: TouchEvent) {
    event.preventDefault();
    this.imageTouchstart.emit(event);
  }

  private _getImageObject(): Observable<ImageInterface> {
    if (this.image) {
      return of(this.image);
    }

    return new Observable<ImageInterface>(observer => {
      this.store$
        .select(selectImage, this.id)
        .pipe(
          filter(image => !!image),
          take(1)
        )
        .subscribe(image => {
          observer.next(image);
          observer.complete();
        });

      this.store$.dispatch(new LoadImage({ imageId: this.id }));
    });
  }

  private _loadThumbnail() {
    if (this._loadImageFileSubscription) {
      this._loadImageFileSubscription.unsubscribe();
    }

    const url = this._getRevisionThumbnailUrl();

    if (url && !url.includes("placeholder")) {
      this._loadImageFileSubscription = this.imageService
        .loadImageFile(url, (progress: number) => {
          this.imageLoadingProgress = progress;
          this.changeDetectorRef.markForCheck();
        })
        .subscribe(loadedUrl => {
          this.thumbnailUrl = this.domSanitizer.bypassSecurityTrustUrl(loadedUrl);
          this.loading = false;

          if (this.revision.videoFile) {
            this._insertVideoJs();
          } else {
            this.loaded.emit();
          }

          this.changeDetectorRef.markForCheck();
        });

      return;
    }

    this.store$
      .select(selectThumbnail, {
        id: this.id,
        revision: this.revisionLabel,
        alias: this.alias
      })
      .pipe(
        filter(thumbnail => !!thumbnail && !!thumbnail.url && !thumbnail.url.includes("placeholder")),
        take(1),
        switchMap(thumbnail =>
          this.imageService.loadImageFile(thumbnail.url, (progress: number) => {
            this.imageLoadingProgress = progress;
            this.changeDetectorRef.markForCheck();
          })
        ),
        map(loadedUrl => this.domSanitizer.bypassSecurityTrustUrl(loadedUrl))
      )
      .subscribe(loadedUrl => {
        this.thumbnailUrl = loadedUrl;
        this.loading = false;

        if (this.revision.videoFile) {
          this._insertVideoJs();
        } else {
          this.loaded.emit();
        }

        this.changeDetectorRef.markForCheck();
      });

    this.store$.dispatch(
      new LoadThumbnail({ data: { id: this.id, revision: this.revisionLabel, alias: this.alias }, bustCache: false })
    );
  }

  private _setWidthAndHeight(imageWidth: number, imageHeight: number) {
    if (!this._isBrowser) {
      return;
    }

    const containerWidth = this.elementRef.nativeElement.offsetWidth;

    if (!containerWidth) {
      if (this._dimensionsRetryCount < this.MAX_RETRIES) {
        this._dimensionsRetryCount++;
        this._retrySetWidthAndHeight.next();
      } else {
        if (!this._dimensionsInterval) {
          this._dimensionsInterval = setInterval(() => {
            const width = this.elementRef.nativeElement.offsetWidth;
            if (width) {
              this._dimensionsRetryCount = 0;
              clearInterval(this._dimensionsInterval);
              this._dimensionsInterval = null;
              this._setWidthAndHeight(imageWidth, imageHeight);
              this.changeDetectorRef.markForCheck();
            }
          }, 1000);
        }
      }
      return;
    }

    // Clear any existing interval if we successfully got the width
    if (this._dimensionsInterval) {
      clearInterval(this._dimensionsInterval);
      this._dimensionsInterval = null;
    }

    if (imageWidth > containerWidth) {
      if (this.autoHeight) {
        this.width = containerWidth;
        this.height = (imageHeight / imageWidth) * containerWidth;
      } else {
        this.width = containerWidth;
        this.height = undefined;
      }
    } else {
      this.width = imageWidth;
      this.height = imageHeight;
    }
  }

  private _setupAutoLoad() {
    if (this._isBrowser) {
      const scroll$ = fromEvent(this.windowRefService.nativeWindow, "scroll").pipe(throttleTime(250));
      const resize$ = fromEvent(this.windowRefService.nativeWindow, "resize").pipe(throttleTime(250));
      const forceCheck$ = this.actions$.pipe(
        ofType(AppActionTypes.FORCE_CHECK_IMAGE_AUTO_LOAD),
        map((action: ForceCheckImageAutoLoad) => action.payload),
        filter(payload => payload.imageId === this.id || (payload.imageId as string) === this.image?.hash),
        tap(() => {
          this.forceLoad = true;
          this.changeDetectorRef.markForCheck();
        })
      );

      this._autoLoadSubscription = merge(scroll$, resize$, forceCheck$)
        .pipe(takeUntil(this.destroyed$))
        .subscribe(() => {
          this.load();
          this.changeDetectorRef.markForCheck();
        });
    }
  }

  private _insertVideoJs() {
    if (this._isBrowser) {
      this.utilsService.insertStylesheet("https://vjs.zencdn.net/8.3.0/video-js.min.css", this.renderer, () => {
        this.utilsService.insertScript("https://vjs.zencdn.net/8.3.0/video.min.js", this.renderer, () => {
          this.videoJsReady = true;
          this.loaded.emit();
          this.loading = false;
          this.changeDetectorRef.markForCheck();

          this._waitForVideoElementReady().subscribe(() => {
            this._createVideoJsPlayer();
            this.changeDetectorRef.markForCheck();
          });
        });
      });
    }
  }

  private _waitForVideoElementReady(): Observable<boolean> {
    const checkInterval = 100; // Poll every 100ms
    const maxRetries = 50; // Maximum number of checks

    return interval(checkInterval).pipe(
      take(maxRetries), // Limit the number of retries
      filter(() => !!this.videoPlayerElement && !!this.videoPlayerElement.nativeElement), // Filter when the element is available
      map(() => true), // Map to boolean true when the element is found
      first() // Complete after the first success
    );
  }

  private _createVideoJsPlayer() {
    if (typeof videojs === "undefined") {
      this.popNotificationsService.error(this.translateService.instant("Video player could not be loaded."));
      return;
    }

    this._videoJsPlayer = videojs(this.videoPlayerElement.nativeElement, {}, () => {
      this.utilsService.delay(1).subscribe(() => {
        requestAnimationFrame(() => {
          this._setWidthAndHeight(this.revision.w, this.revision.h);
          this.changeDetectorRef.markForCheck();
        });
      });

      this._videoJsPlayer.on("fullscreenchange", () => {
        const isFullscreen = this._videoJsPlayer.isFullscreen();
        const el = this._videoJsPlayer.el().firstChild;

        if (isFullscreen) {
          el.style.maxWidth = `${this._videoJsPlayer.videoWidth()}px`;
          el.style.maxHeight = `${this._videoJsPlayer.videoHeight()}px`;
          el.style.top = `50%`;
          el.style.left = `50%`;
          el.style.transform = `translate(-50%, -50%)`;
          el.style.margin = "auto";
        } else {
          el.style.maxWidth = "";
          el.style.maxHeight = "";
          el.style.top = "";
          el.style.left = "";
          el.style.transform = "";
          el.style.margin = "";
        }
      });
    });
  }

  private _disposeVideoJsPlayer() {
    if (this._videoJsPlayer) {
      this._videoJsPlayer.dispose();
      this._videoJsPlayer = null;
    }
  }

  private _pollingVideoEncodingProgress() {
    if (this._pollingVideEncoderProgress || !this._isBrowser) {
      return;
    }

    this._pollingVideEncoderProgress = true;

    const apiCall = this.revision.hasOwnProperty("label")
      ? this.imageApiService.getRevisionVideoEncodingProgress
      : this.imageApiService.getVideoEncodingProgress;

    interval(1000)
      .pipe(
        takeUntil(this._stopPollingVideoEncoderProgress),
        takeUntil(this.destroyed$),
        switchMap(() => apiCall.bind(this.imageApiService)(this.revision.pk))
      )
      .subscribe((progress: number) => {
        this.videoEncodingProgress = progress;
        if (progress >= 100) {
          this._stopPollingVideoEncoderProgress.next();
          this.store$.dispatch(new LoadImages([this.id]));
          this.store$
            .pipe(
              select(selectImage, this.id),
              filter(image => !!image),
              take(1)
            )
            .subscribe(image => {
              this.load();
              this.changeDetectorRef.markForCheck();
            });
        }
        this.changeDetectorRef.markForCheck();
      });
  }

  private _getRevisionThumbnailUrl(): string {
    let url: string;

    if (this.revision?.imageFile && this.revision.imageFile.toLowerCase().endsWith(".gif")) {
      url = this.revision.imageFile;
    } else {
      if (!this.image.thumbnails) {
        return null;
      }

      const allAvailableThumbnails: {
        revisionLabel: ImageRevisionInterface["label"];
        url: string;
      }[] = [
        ...this.image.thumbnails
          .filter(thumbnail => thumbnail.alias === this.alias)
          .map(thumbnail => ({
            revisionLabel: thumbnail.revision,
            url: thumbnail.url
          })),
        ...this.image.revisions
          .filter(revision => revision.thumbnails.find(thumbnail => thumbnail.alias === this.alias))
          .map(revision => ({
            revisionLabel: revision.label,
            url: revision.thumbnails.find(thumbnail => thumbnail.alias === this.alias).url
          }))
      ];

      if (allAvailableThumbnails.length === 1) {
        url = allAvailableThumbnails[0].url;
      } else {
        url = allAvailableThumbnails.find(thumbnail => thumbnail.revisionLabel === this.revisionLabel)?.url;
        if (!url) {
          url = allAvailableThumbnails.find(thumbnail => thumbnail.revisionLabel === FINAL_REVISION_LABEL)?.url;
        }
      }
    }

    return url;
  }
}
