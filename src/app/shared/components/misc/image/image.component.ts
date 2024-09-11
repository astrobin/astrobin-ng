import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding, Inject, Input, OnChanges, OnDestroy, OnInit, Output, PLATFORM_ID, Renderer2, SimpleChanges, ViewChild } from "@angular/core";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { LoadImage, LoadImages } from "@app/store/actions/image.actions";
import { LoadThumbnail, LoadThumbnailCancel } from "@app/store/actions/thumbnail.actions";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { selectThumbnail } from "@app/store/selectors/app/thumbnail.selectors";
import { MainState } from "@app/store/state";
import { select, Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { FINAL_REVISION_LABEL, ImageInterface, ImageRevisionInterface } from "@shared/interfaces/image.interface";
import { ImageService } from "@shared/services/image/image.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { filter, first, map, switchMap, take, takeUntil, takeWhile } from "rxjs/operators";
import { fromEvent, interval, merge, Observable, of, Subject, Subscription, throttleTime } from "rxjs";
import { Actions, ofType } from "@ngrx/effects";
import { isPlatformBrowser, isPlatformServer } from "@angular/common";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { ImageApiService } from "@shared/services/api/classic/images/image/image-api.service";

declare const videojs: any;

@Component({
  selector: "astrobin-image",
  templateUrl: "./image.component.html",
  styleUrls: ["./image.component.scss"]
})
export class ImageComponent extends BaseComponentDirective implements OnInit, OnChanges, OnDestroy {
  @Input()
  @HostBinding("attr.data-id")
  id: number;

  @Input()
  image: ImageInterface;

  @Input()
  revisionLabel = FINAL_REVISION_LABEL;

  @Input()
  alias: ImageAlias;

  @Input()
  autoHeight = true;

  @Output()
  loaded = new EventEmitter();

  @Output()
  imageClick = new EventEmitter<MouseEvent>();

  @Output()
  imageMouseEnter = new EventEmitter<MouseEvent>();

  @Output()
  imageMouseLeave = new EventEmitter<MouseEvent>();

  @HostBinding("class.loading")
  loading = false;

  @ViewChild("videoPlayerElement", { static: false })
  videoPlayerElement: ElementRef;

  thumbnailUrl: SafeUrl;

  protected width: number;
  protected height: number;
  protected imageLoadingProgress = 0;
  protected videoEncodingProgress = 0;
  protected videoJsReady = false;
  protected revision: ImageInterface | ImageRevisionInterface;

  private _videoJsPlayer: any;
  private _autoLoadSubscription: Subscription;
  private _pollingVideEncoderProgress = false;
  private _stopPollingVideoEncoderProgress = new Subject<void>();


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
    public readonly imageApiService: ImageApiService
  ) {
    super(store$);
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
    const imageChanged = changes.image && changes.image.currentValue;
    const revisionLabelChanged = changes.revisionLabel && changes.revisionLabel.currentValue;

    if (imageChanged) {
      this.id = this.image.pk;
    }

    if (imageChanged || revisionLabelChanged) {
        this.revision = this.imageService.getRevision(this.image, this.revisionLabel);
    }

    this.thumbnailUrl = null;
    this.loading = false;
    this._stopPollingVideoEncoderProgress.next();
    this._disposeVideoJsPlayer();

    this.load(0);
  }

  ngOnDestroy(): void {
    if (this.thumbnailUrl) {
      (this.windowRefService.nativeWindow as any).URL.revokeObjectURL(this.thumbnailUrl as string);
    }

    this.store$.dispatch(new LoadThumbnailCancel({
      thumbnail: {
        id: this.id,
        revision: this.revisionLabel,
        alias: this.alias
      }
    }));

    if (this._autoLoadSubscription) {
      this._autoLoadSubscription.unsubscribe();
      this._autoLoadSubscription = null;
    }

    this._disposeVideoJsPlayer();

    super.ngOnDestroy();
  }

  load(delay = null) {
    const noNeedToLoad = () =>
      !this.utilsService.isNearBelowViewport(this.elementRef.nativeElement) ||
      this.loading;

    if (noNeedToLoad()) {
      return;
    }

    // 0-100 ms
    this.utilsService
      .delay(delay !== null ? delay : Math.floor(Math.random() * 100))
      .pipe(take(1))
      .subscribe(() => {
        if (noNeedToLoad()) {
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

            if (this.thumbnailUrl && !this.revision.videoFile) {
              this.loaded.emit();
              return;
            }

            this.image = image;
            this.id = image.pk;
            this._setWidthAndHeight(this.revision.w, this.revision.h);
            this._loadThumbnail();

            if (this.revision.videoFile && !this.revision.encodedVideoFile) {
              this._pollingVideoEncodingProgress();
            }
          });

        this.store$.dispatch(new LoadImage({ imageId: this.id }));
      });
  }

  onLoad(event) {
    if (this._autoLoadSubscription) {
      this._autoLoadSubscription.unsubscribe();
      this._autoLoadSubscription = null;
    }

    this.loaded.emit();
  }

  onClick(event: MouseEvent) {
    event.preventDefault();
    this.imageClick.emit(event);
  }

  private _getImageObject(): Observable<ImageInterface> {
    if (this.image) {
      return of(this.image);
    }

    return new Observable<ImageInterface>(observer => {
      this.store$.select(selectImage, this.id).pipe(
        filter(image => !!image),
        take(1)
      ).subscribe(image => {
        observer.next(image);
        observer.complete();
      });

      this.store$.dispatch(new LoadImage({ imageId: this.id }));
    });
  }

  private _loadThumbnail() {
    const allAvailableThumbnails: {
      revisionLabel: ImageRevisionInterface["label"];
      url: string;
    }[] = [
      ...this.image.thumbnails.filter(thumbnail => thumbnail.alias === this.alias).map(thumbnail => ({
        revisionLabel: FINAL_REVISION_LABEL,
        url: thumbnail.url
      })),
      ...this.image.revisions.filter(
        revision => revision.thumbnails.find(thumbnail => thumbnail.alias === this.alias)
      ).map(revision => ({
        revisionLabel: revision.label,
        url: revision.thumbnails.find(thumbnail => thumbnail.alias === this.alias).url
      }))
    ];

    let url: string;

    if (this.revision.imageFile && this.revision.imageFile.toLowerCase().endsWith(".gif")) {
      url = this.revision.imageFile;
    } else {
      url = allAvailableThumbnails.find(thumbnail => thumbnail.revisionLabel === this.revisionLabel)?.url;
    }

    if (url && !url.includes("placeholder")) {
      this.imageService
        .loadImageFile(url, (progress: number) => {
          this.imageLoadingProgress = progress;
        })
        .subscribe(url => {
          this.thumbnailUrl = this.domSanitizer.bypassSecurityTrustUrl(url);
          this.loading = false;
        });

      if (this.revision.videoFile) {
        this._insertVideoJs();
      }

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
          })
        ),
        map(url => this.domSanitizer.bypassSecurityTrustUrl(url))
      )
      .subscribe(url => {
        this.thumbnailUrl = url;
        this.loading = false;

        if (this.revision.videoFile) {
          this._insertVideoJs();
        }
      });

    this.store$.dispatch(
      new LoadThumbnail({ data: { id: this.id, revision: this.revisionLabel, alias: this.alias }, bustCache: false })
    );
  }

  private _setWidthAndHeight(imageWidth: number, imageHeight: number) {
    const containerWidth = this.elementRef.nativeElement.offsetWidth;

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
    if (isPlatformBrowser(this.platformId)) {
      const scroll$ = fromEvent(this.windowRefService.nativeWindow, "scroll");
      const resize$ = fromEvent(this.windowRefService.nativeWindow, "resize");
      const forceCheck$ = this.actions$.pipe(ofType(AppActionTypes.FORCE_CHECK_IMAGE_AUTO_LOAD));

      this._autoLoadSubscription = merge(scroll$, resize$, forceCheck$)
        .pipe(takeUntil(this.destroyed$), throttleTime(100))
        .subscribe(() => this.load());
    }
  }

  private _insertVideoJs() {
    if (isPlatformBrowser(this.platformId)) {
      this.utilsService.insertStylesheet("https://vjs.zencdn.net/8.3.0/video-js.min.css", this.renderer, () => {
        this.utilsService.insertScript("https://vjs.zencdn.net/8.3.0/video.min.js", this.renderer, () => {
          this.videoJsReady = true;
          this.loaded.emit();
          this.loading = false;
          this.changeDetectorRef.detectChanges();

          this._waitForVideoElementReady().subscribe(() => {
            this._createVideoJsPlayer();
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
    this._videoJsPlayer = videojs(this.videoPlayerElement.nativeElement, {}, () => {
      console.log("Video.js player is ready!");

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
    if (this._pollingVideEncoderProgress || isPlatformServer(this.platformId)) {
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
          this.store$.pipe(
            select(selectImage, this.id),
            filter(image => !!image),
            take(1)
          ).subscribe(image => {
            this.load(0);
          });
        }
      });
  }
}
