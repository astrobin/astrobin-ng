import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding, HostListener, Inject, Input, OnChanges, OnDestroy, OnInit, Output, PLATFORM_ID, Renderer2, SimpleChanges, ViewChild } from "@angular/core";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { HideFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import { LoadThumbnail, LoadThumbnailCancel } from "@app/store/actions/thumbnail.actions";
import { selectCurrentFullscreenImage } from "@app/store/selectors/app/app.selectors";
import { selectThumbnail } from "@app/store/selectors/app/thumbnail.selectors";
import { MainState } from "@app/store/state";
import { select, Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { ImageService } from "@shared/services/image/image.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { Coord, NgxImageZoomComponent } from "ngx-image-zoom";
import { BehaviorSubject, combineLatest, merge, Observable, scan, Subscription } from "rxjs";
import { distinctUntilChanged, filter, map, startWith, switchMap, take, tap } from "rxjs/operators";
import { ImageThumbnailInterface } from "@shared/interfaces/image-thumbnail.interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { isPlatformBrowser } from "@angular/common";
import { DeviceService } from "@shared/services/device.service";
import { CookieService } from "ngx-cookie";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { FINAL_REVISION_LABEL, FullSizeLimitationDisplayOptions, ImageInterface, ImageRevisionInterface } from "@shared/interfaces/image.interface";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { TitleService } from "@shared/services/title/title.service";
import { fadeInOut } from "@shared/animations";

declare type HammerInput = any;

@Component({
  selector: "astrobin-fullscreen-image-viewer",
  templateUrl: "./fullscreen-image-viewer.component.html",
  styleUrls: ["./fullscreen-image-viewer.component.scss"],
  animations: [fadeInOut],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FullscreenImageViewerComponent extends BaseComponentDirective implements OnInit, OnChanges, OnDestroy {
  @Input()
  id: ImageInterface["pk"];

  @Input()
  revisionLabel = FINAL_REVISION_LABEL;

  @Input()
  anonymized = false;

  @Input()
  respectFullSizeDisplayLimitation = true;

  // We use `standalone = true` when opening a fullscreen image viewer from a standalone image viewer, i.e. an image
  // viewer that comes from an image page and not a slideshow that's opened dynamically.
  @Input()
  standalone = false;

  @Input()
  eagerLoading = false;

  @Output()
  enterFullscreen = new EventEmitter<void>();

  @Output()
  exitFullscreen = new EventEmitter<void>();

  @ViewChild("ngxImageZoom", { static: false, read: NgxImageZoomComponent })
  ngxImageZoom: NgxImageZoomComponent;

  @ViewChild("ngxImageZoom", { static: false, read: ElementRef })
  ngxImageZoomEl: ElementRef;

  @ViewChild("touchRealContainer", { static: false })
  touchRealContainer: ElementRef;

  @ViewChild("touchRealCanvas")
  touchRealCanvas: ElementRef<HTMLCanvasElement>;

  @ViewChild("touchRealWrapper", { static: false })
  touchRealWrapper: ElementRef;

  @HostBinding("class.show")
  show: boolean = false;

  protected readonly Math = Math;

  protected touchMode?: boolean = undefined;
  protected enableLens = true;
  protected zoomLensSize: number;
  protected showZoomIndicator = false;
  protected isHybridPC = false;
  protected isTouchDevice = false;
  protected isLargeEnough = false;
  protected hdThumbnail: SafeUrl;
  protected realThumbnail: SafeUrl;
  protected realThumbnailUnsafeUrl: string;
  protected hdImageLoadingProgress$: Observable<number>;
  protected realImageLoadingProgress$: Observable<number>;
  protected loadingProgress$: Observable<number>;
  protected hdThumbnailLoading = false;
  protected realThumbnailLoading = false;
  protected ready = false;
  protected allowReal = false;
  protected touchScale = 1;
  protected actualTouchZoom: number = null;
  protected isTransforming = false;
  protected naturalWidth: number;
  protected naturalHeight: number;
  protected maxZoom = 8;
  protected canvasLoading = false;

  private _revision: ImageInterface | ImageRevisionInterface;

  private _lastTransform: string = null;
  private _imageBitmap: ImageBitmap = null;
  private _canvasImage: HTMLImageElement;
  private _canvasContext: CanvasRenderingContext2D;
  private _canvasContainerDimensions: { width: number; height: number; centerX: number; centerY: number };
  private _canvasImageDimensions: { width: number; height: number };
  private _rafId: number;
  private _lastTouchScale = 1;
  private _touchScaleOffset = { x: 0, y: 0 };
  private _lastTouchScaleOffset = { x: 0, y: 0 };
  private _touchScaleStartPoint = { x: 0, y: 0 };
  private _baseTouchScale: number;
  private _panVelocity = { x: 0, y: 0 };
  private _panLastPosition = { x: 0, y: 0 };
  private _panLastTime: number = 0;
  private _pinchLastTime: number = 0;
  private _animationFrame: number = null;

  private _imageSubscription: Subscription;
  private _hdThumbnailSubscription: Subscription;
  private _realThumbnailSubscription: Subscription;
  private _currentFullscreenImageSubscription: Subscription;
  private _zoomScroll = 1;
  private _zoomIndicatorTimeout: number;
  private _zoomIndicatorTimeoutDuration = 1000;
  private _hdLoadingProgressSubject = new BehaviorSubject<number>(0);
  private _realLoadingProgressSubject = new BehaviorSubject<number>(0);
  private _eagerLoadingSubscription: Subscription;
  private _firstRenderSubject = new BehaviorSubject<boolean>(false);

  private readonly LENS_ENABLED_COOKIE_NAME = "astrobin-fullscreen-lens-enabled";
  private readonly TOUCH_OR_MOUSE_MODE_COOKIE_NAME = "astrobin-fullscreen-touch-or-mouse";
  private readonly PIXEL_THRESHOLD = 8192 * 8192;
  private readonly FRAME_INTERVAL = 1000 / 120; // 120 FPS

  readonly firstRender$ = this._firstRenderSubject.asObservable().pipe(
    filter(rendered => rendered)
  );

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly windowRef: WindowRefService,
    public readonly translateService: TranslateService,
    public readonly imageService: ImageService,
    public readonly domSanitizer: DomSanitizer,
    public readonly utilsService: UtilsService,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly deviceService: DeviceService,
    public readonly cookieService: CookieService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly windowRefService: WindowRefService,
    public readonly titleService: TitleService,
    public readonly renderer: Renderer2,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super(store$);

    this.isHybridPC = this.deviceService.isHybridPC();
    this.isTouchDevice = this.deviceService.isTouchEnabled();
    this.touchMode = this.cookieService.get(this.TOUCH_OR_MOUSE_MODE_COOKIE_NAME) === "touch";
    this.enableLens = this.cookieService.get(this.LENS_ENABLED_COOKIE_NAME) === "true";
    this.hdImageLoadingProgress$ = this._hdLoadingProgressSubject.asObservable();
    this.realImageLoadingProgress$ = this._realLoadingProgressSubject.asObservable();
    this.loadingProgress$ = combineLatest([
      this.hdImageLoadingProgress$.pipe(startWith(0)),
      this.realImageLoadingProgress$.pipe(startWith(0))
    ]).pipe(
      // First 50% is HD, second 50% is REAL
      map(([hdProgress, realProgress]) => {
        if (this.hdThumbnailLoading) {
          return hdProgress * 0.5;
        }
        if (this.realThumbnailLoading) {
          return 50 + (realProgress * 0.5);
        }
        if (this.canvasLoading) {
          return 100;  // Keep full progress during canvas init
        }
        return null;
      }),
      distinctUntilChanged()
    );
  }

  @HostBinding("class.disable-zoom")
  get disableZoomClass() {
    return this.realThumbnailLoading || this.hdThumbnailLoading;
  }

  @HostBinding("class.standalone")
  get standaloneClass() {
    return this.standalone;
  }

  get zoomingEnabled(): boolean {
    return !!this.ngxImageZoom && (this.ngxImageZoom as any).zoomingEnabled;
  }

  protected get isVeryLargeImage(): boolean {
    return this.naturalWidth * (this.naturalHeight || this.naturalWidth) > this.PIXEL_THRESHOLD;
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this._setZoomLensSize();
    this._updateCanvasDimensions();
    this._drawCanvas();
  }

  ngOnInit() {
    this._setZoomLensSize();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.id === undefined) {
      throw new Error("Attribute 'id' is required");
    }

    if (changes.eagerLoading || changes.id) {
      // Clean up previous subscriptions
      if (this._eagerLoadingSubscription) {
        this._eagerLoadingSubscription.unsubscribe();
        this._eagerLoadingSubscription = null;
      }

      this.hdThumbnail = null;
      this.realThumbnail = null;

      // Set up eager loading if enabled
      if (this.eagerLoading && !this._eagerLoadingSubscription) {
        this.utilsService.delay(2500).subscribe(() => {
          // Double check in case user clicked during timeout
          if (!this._eagerLoadingSubscription && !this.hdThumbnail && !this.realThumbnail) {
            this._eagerLoadingSubscription = this._initThumbnailSubscriptions();
            this.changeDetectorRef.markForCheck();
          }
        });
      }
    }

    if (this._currentFullscreenImageSubscription) {
      this._currentFullscreenImageSubscription.unsubscribe();
    }

    this._currentFullscreenImageSubscription = this.store$.pipe(
      select(selectCurrentFullscreenImage),
      distinctUntilChanged(),
      filter(currentFullscreenImage => currentFullscreenImage === this.id)
    ).subscribe(() => {
      this.actions$.pipe(
        ofType(AppActionTypes.HIDE_FULLSCREEN_IMAGE),
        take(1)
      ).subscribe(() => {
        this._resetThumbnailSubscriptions();
        this.show = false;
        this.hdThumbnail = null;
        this.realThumbnail = null;
        this._resetTouchZoom();
        this.titleService.enablePageZoom();

        this._lastTransform = null;
        if (this._imageBitmap) {
          this._imageBitmap.close();
          this._imageBitmap = null;
        }

        this._canvasContext = null;
        this._canvasImage = null;
        this._firstRenderSubject.next(false);
        this.canvasLoading = false;
        this._canvasContainerDimensions = null;
        this._canvasImageDimensions = null;

        cancelAnimationFrame(this._animationFrame);
        this.exitFullscreen.emit();
        this.changeDetectorRef.markForCheck();
      });

      this.show = true;
      this.titleService.disablePageZoom();
      this.enterFullscreen.emit();

      // Only initialize thumbnails if not already eagerly loading
      if (!this._eagerLoadingSubscription && !this.hdThumbnail && !this.realThumbnail) {
        this._initThumbnailSubscriptions();
      }

      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();

    if (this._imageBitmap) {
      this._imageBitmap.close();
    }
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
    }

    if (this._eagerLoadingSubscription) {
      this._eagerLoadingSubscription.unsubscribe();
      this._eagerLoadingSubscription = null;
    }

    if (this._imageSubscription) {
      this._imageSubscription.unsubscribe();
      this._imageSubscription = null;
    }

    if (this._hdThumbnailSubscription) {
      this._hdThumbnailSubscription.unsubscribe();
      this._hdThumbnailSubscription = null;
    }

    if (this._realThumbnailSubscription) {
      this._realThumbnailSubscription.unsubscribe();
      this._realThumbnailSubscription = null;
    }

    if (this._currentFullscreenImageSubscription) {
      this._currentFullscreenImageSubscription.unsubscribe();
      this._currentFullscreenImageSubscription = null;
    }
  }

  onImagesLoaded(loaded: boolean) {
    this.ready = loaded;
    // Prevents the jarring resetting of the zoom when the mouse wanders off the image.
    this.utilsService.delay(100).subscribe(() => {
      if (this.ngxImageZoom) {
        (this.ngxImageZoom as any).clickMouseLeave = () => {
        };
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  setZoomPosition(position: Coord) {
    this.showZoomIndicator = true;
    this._setZoomIndicatorTimeout();
  }

  setZoomScroll(scroll: number) {
    this._zoomScroll = scroll;
    this.showZoomIndicator = true;
    this._setZoomIndicatorTimeout();
  }

  getZoomScroll(): number {
    return this._zoomScroll;
  }

  @HostListener("window:keyup.escape", ["$event"])
  hide(event: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.store$.dispatch(new HideFullscreenImage());
  }

  protected toggleEnableLens(): void {
    this.enableLens = !this.enableLens;
    this.cookieService.put(this.LENS_ENABLED_COOKIE_NAME, this.enableLens.toString());
    if (this.enableLens) {
      this._setZoomLensSize();
    }
  }

  protected toggleTouchMouseMode(): void {
    this.touchMode = !this.touchMode;
    this.cookieService.put(this.TOUCH_OR_MOUSE_MODE_COOKIE_NAME, this.touchMode ? "touch" : "mouse");
  }

  protected onPinchStart(event: HammerInput): void {
    if (this._animationFrame) {
      cancelAnimationFrame(this._animationFrame);
      this._animationFrame = null;
    }

    this._lastTouchScale = this.touchScale;

    // Calculate pinch center relative to container
    const rect = this.touchRealContainer.nativeElement.getBoundingClientRect();
    this._touchScaleStartPoint = {
      x: event.center.x - rect.left,
      y: event.center.y - rect.top
    };

    // Store the current offset
    this._lastTouchScaleOffset = { ...this._touchScaleOffset };

    this.isTransforming = true;
  }

  protected onPinchMove(event: HammerInput): void {
    if (event.timeStamp - this._pinchLastTime < this.FRAME_INTERVAL) {
      return;
    }
    this._pinchLastTime = event.timeStamp;

    const naturalScale = this._canvasContainerDimensions.width / this.naturalWidth;
    const maxScale = this.isVeryLargeImage ? 1 : this.maxZoom / naturalScale;
    const newScale = Math.min(Math.max(this._lastTouchScale * event.scale, 1), maxScale);

    // Get current pinch center using cached container offset
    const currentCenter = {
      x: event.center.x,
      y: event.center.y
    };

    // Calculate the translation (pan)
    const deltaX = (currentCenter.x - this._touchScaleStartPoint.x) / this.touchScale;
    const deltaY = (currentCenter.y - this._touchScaleStartPoint.y) / this.touchScale;

    if (newScale !== this.touchScale) {
      // Convert pinch center to image space coordinates
      const imageSpaceX = (this._touchScaleStartPoint.x - this._canvasContainerDimensions.centerX) / this.touchScale + this._touchScaleOffset.x;
      const imageSpaceY = (this._touchScaleStartPoint.y - this._canvasContainerDimensions.centerY) / this.touchScale + this._touchScaleOffset.y;

      // Calculate new offsets to maintain the pinch center point
      this._touchScaleOffset = {
        x: imageSpaceX - (imageSpaceX - this._touchScaleOffset.x) * (newScale / this.touchScale) + deltaX,
        y: imageSpaceY - (imageSpaceY - this._touchScaleOffset.y) * (newScale / this.touchScale) + deltaY
      };

      this.touchScale = newScale;
      this._updateActualTouchZoom();
    } else {
      // Just apply the translation if scale hasn't changed
      this._touchScaleOffset = {
        x: this._touchScaleOffset.x + deltaX,
        y: this._touchScaleOffset.y + deltaY
      };
    }

    // Update the start point for the next move event
    this._touchScaleStartPoint = currentCenter;

    // Ensure offsets stay within bounds
    this._clampOffset();
    this._drawCanvas();
  }

  protected onPinchEnd(): void {
    this._lastTouchScale = this.touchScale;
    if (this.touchScale <= 1) {
      this._resetTouchZoom();
    }

    this.isTransforming = false;
    this._drawCanvas();
  }

  protected onPanStart(event: HammerInput): void {
    if (this._animationFrame) {
      cancelAnimationFrame(this._animationFrame);
      this._animationFrame = null;
    }

    if (this.touchScale <= 1) {
      return;
    }

    this._lastTouchScaleOffset = this._touchScaleOffset;

    this._touchScaleStartPoint = {
      x: event.center.x,
      y: event.center.y
    };

    // Reset velocity tracking
    this._panVelocity = { x: 0, y: 0 };
    this._panLastPosition = {
      x: event.center.x,
      y: event.center.y
    };
    this._panLastTime = event.timeStamp;

    this.isTransforming = true;
  }

  protected onPanMove(event: HammerInput): void {
    if (this.touchScale <= 1 || event.timeStamp - this._panLastTime < this.FRAME_INTERVAL) {
      return;
    }

    this._updateVelocity(event);

    const deltaX = event.center.x - this._touchScaleStartPoint.x;
    const deltaY = event.center.y - this._touchScaleStartPoint.y;

    const { maxOffsetX, maxOffsetY, newOffsetX, newOffsetY } = this._calculatePanOffsets(deltaX, deltaY);
    this._applyOffsetWithinBounds(newOffsetX, newOffsetY, maxOffsetX, maxOffsetY);
    this._drawCanvas();
  }

  protected onPanEnd(event: HammerInput) {
    if (this.touchScale <= 1) {
      return;
    }
    this._applyPanMoveMomentum();
  }

  protected onDoubleTap(event: HammerInput): void {
    if (this.touchScale > 1) {
      this._animateZoom(1, 0, 0);
    } else {
      const displayWidth = this.touchRealContainer.nativeElement.offsetWidth;
      this._baseTouchScale = displayWidth / this.naturalWidth;
      const targetScale = 1 / this._baseTouchScale;  // This will make actualTouchZoom = 1

      const rect = this.touchRealContainer.nativeElement.getBoundingClientRect();
      const x = event.center.x - rect.left;
      const y = event.center.y - rect.top;

      const targetOffsetX = (rect.width / 2 - x);
      const targetOffsetY = (rect.height / 2 - y);

      this._animateZoom(targetScale, targetOffsetX, targetOffsetY);
    }
  }

  private _animateZoom(targetScale: number, targetOffsetX: number = 0, targetOffsetY: number = 0) {
    const startScale = this.touchScale;
    const startOffsetX = this._touchScaleOffset.x;
    const startOffsetY = this._touchScaleOffset.y;
    const duration = 300; // milliseconds
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic function
      const easing = 1 - Math.pow(1 - progress, 3);

      this.touchScale = startScale + (targetScale - startScale) * easing;
      this._touchScaleOffset.x = startOffsetX + (targetOffsetX - startOffsetX) * easing;
      this._touchScaleOffset.y = startOffsetY + (targetOffsetY - startOffsetY) * easing;

      this._updateActualTouchZoom();
      this.changeDetectorRef.markForCheck();
      this._drawCanvas();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this._lastTouchScale = this.touchScale;
        this._lastTouchScaleOffset = { ...this._touchScaleOffset };
      }
    };

    requestAnimationFrame(animate);
  }

  private _calculatePanOffsets(deltaX: number, deltaY: number, currentScale: number = this.touchScale): {
    maxOffsetX: number;
    maxOffsetY: number;
    newOffsetX: number;
    newOffsetY: number;
  } {
    const scaledImageWidth = this._canvasImageDimensions.width * currentScale;
    const scaledImageHeight = this._canvasImageDimensions.height * currentScale;

    const maxOffsetX = Math.max(0, (scaledImageWidth - this._canvasContainerDimensions.width) / (2 * currentScale));
    const maxOffsetY = Math.max(0, (scaledImageHeight - this._canvasContainerDimensions.height) / (2 * currentScale));

    const adjustedDeltaX = deltaX / currentScale;
    const adjustedDeltaY = deltaY / currentScale;

    return {
      maxOffsetX,
      maxOffsetY,
      newOffsetX: this._lastTouchScaleOffset.x + adjustedDeltaX,
      newOffsetY: this._lastTouchScaleOffset.y + adjustedDeltaY
    };
  }

  private _updateVelocity(event: HammerInput): void {
    const deltaTime = event.timeStamp - this._panLastTime;

    if (deltaTime > 0) {
      this._panVelocity = {
        x: (event.center.x - this._panLastPosition.x) / deltaTime,
        y: (event.center.y - this._panLastPosition.y) / deltaTime
      };
    }

    this._panLastPosition = { x: event.center.x, y: event.center.y };
    this._panLastTime = event.timeStamp;
  }

  private _applyOffsetWithinBounds(newOffsetX: number, newOffsetY: number, maxOffsetX: number, maxOffsetY: number): void {
    if (Math.abs(newOffsetX) <= maxOffsetX) {
      this._touchScaleOffset.x = newOffsetX;
    }

    if (Math.abs(newOffsetY) <= maxOffsetY) {
      this._touchScaleOffset.y = newOffsetY;
    }
  }

  private _applyPanMoveMomentum(): void {
    const friction = .95;
    const minVelocity = .025;

    const animate = () => {
      this._panVelocity.x *= friction;
      this._panVelocity.y *= friction;

      if (Math.abs(this._panVelocity.x) < minVelocity && Math.abs(this._panVelocity.y) < minVelocity) {
        cancelAnimationFrame(this._animationFrame);
        this._animationFrame = null;
        this.isTransforming = false;
        this._drawCanvas();
        return;
      }

      // Calculate new position - keeping the division by touchScale for relative motion
      const deltaX = (this._panVelocity.x * this.FRAME_INTERVAL) / this.touchScale;
      const deltaY = (this._panVelocity.y * this.FRAME_INTERVAL) / this.touchScale;

      const maxOffsetX = (this.touchScale - 1) * this._canvasContainerDimensions.width / 2;
      const maxOffsetY = (this.touchScale - 1) * this._canvasContainerDimensions.height / 2;

      // Update position with bounds checking
      this._touchScaleOffset = {
        x: Math.min(Math.max(this._touchScaleOffset.x + deltaX, -maxOffsetX), maxOffsetX),
        y: Math.min(Math.max(this._touchScaleOffset.y + deltaY, -maxOffsetY), maxOffsetY)
      };

      // If we hit the bounds, stop the momentum in that direction
      if (this._touchScaleOffset.x === -maxOffsetX || this._touchScaleOffset.x === maxOffsetX) {
        this._panVelocity.x = 0;
      }
      if (this._touchScaleOffset.y === -maxOffsetY || this._touchScaleOffset.y === maxOffsetY) {
        this._panVelocity.y = 0;
      }

      this._drawCanvas();
      this._animationFrame = requestAnimationFrame(animate);
    };

    this._animationFrame = requestAnimationFrame(animate);
  }

  private _updateActualTouchZoom(): void {
    if (!this.naturalWidth || !this.touchRealContainer?.nativeElement?.offsetWidth) {
      this.actualTouchZoom = null;
      return;
    }

    const displayWidth = this.touchRealContainer.nativeElement.offsetWidth;
    this._baseTouchScale = displayWidth / this.naturalWidth;
    this.actualTouchZoom = this._baseTouchScale * this.touchScale;
  }

  private _resetTouchZoom(): void {
    this.touchScale = 1;
    this._lastTouchScale = 1;
    this._touchScaleOffset = { x: 0, y: 0 };
    this._lastTouchScaleOffset = { x: 0, y: 0 };
    this._updateActualTouchZoom();
  }

  private _resetThumbnailSubscriptions() {
    if (this._hdThumbnailSubscription) {
      this._hdThumbnailSubscription.unsubscribe();
      this._hdThumbnailSubscription = null;
    }

    if (this._realThumbnailSubscription) {
      this._realThumbnailSubscription.unsubscribe();
      this._realThumbnailSubscription = null;
    }

    if (this._eagerLoadingSubscription) {
      this._eagerLoadingSubscription.unsubscribe();
      this._eagerLoadingSubscription = null;
    }

    this.hdThumbnail = null;
    this.realThumbnail = null;
  }

  private _initThumbnailSubscriptions(): Subscription {
    // Reset any existing subscriptions
    this._resetThumbnailSubscriptions();

    const subscriptions = new Subscription();

    if (this._imageSubscription) {
      this._imageSubscription.unsubscribe();
    }

    this._imageSubscription = this.store$.pipe(
      select(selectImage, this.id),
      filter(image => !!image),
      take(1),
      tap(image => {
        this._revision = this.imageService.getRevision(image, this.revisionLabel);
        this.naturalWidth = this._revision.w;
        this.naturalHeight = this._revision.h;
        this.maxZoom = image.maxZoom || image.defaultMaxZoom || 8;
        this.isLargeEnough = (
          this._revision.w > this.windowRef.nativeWindow.innerWidth ||
          this._revision.h > this.windowRef.nativeWindow.innerHeight
        );

        this.hdThumbnailLoading = true;
        this._hdLoadingProgressSubject.next(0);

        this.changeDetectorRef.markForCheck();

        this.currentUser$.pipe(take(1)).subscribe(user => {
          const limit = image.fullSizeDisplayLimitation;
          this.allowReal = !this.respectFullSizeDisplayLimitation || (
            limit === FullSizeLimitationDisplayOptions.EVERYBODY ||
            (limit === FullSizeLimitationDisplayOptions.MEMBERS && !!user) ||
            (limit === FullSizeLimitationDisplayOptions.PAYING && !!user && !!user.validSubscription) ||
            (limit === FullSizeLimitationDisplayOptions.ME && !!user && user.id === image.user)
          );
          this.changeDetectorRef.markForCheck();
        });
      })
    ).subscribe(() => {
      this._hdThumbnailSubscription = this.store$.select(selectThumbnail, this._getHdOptions()).pipe(
        tap(() => {
          this.changeDetectorRef.markForCheck();
        }),
        filter(thumbnail => !!thumbnail),
        switchMap(thumbnail =>
          this.imageService.loadImageFile(thumbnail.url, (progress: number) => {
            this._hdLoadingProgressSubject.next(progress);
          }).pipe(
            switchMap(url =>
              this._preloadImage(url).pipe(
                map(() => this.domSanitizer.bypassSecurityTrustUrl(url)),
                tap(() => this.store$.dispatch(new LoadThumbnail({ data: this._getRealOptions(), bustCache: false }))),
                tap(() => {
                  this.hdThumbnailLoading = false;
                  this.changeDetectorRef.markForCheck();
                })
              )
            )
          )
        )
      ).subscribe(url => {
        this.hdThumbnail = url;
        this.changeDetectorRef.markForCheck();
      });

      this._realThumbnailSubscription = this.store$.select(selectThumbnail, this._getRealOptions()).pipe(
        tap(() => {
          this.canvasLoading = true;
          this.realThumbnailLoading = true;
          this._realLoadingProgressSubject.next(0);
          this.changeDetectorRef.markForCheck();
        }),
        filter(thumbnail => !!thumbnail),
        tap(thumbnail => {
          this.realThumbnailUnsafeUrl = thumbnail.url;
          this.changeDetectorRef.markForCheck();
        }),
        switchMap(thumbnail =>
          this.imageService.loadImageFile(thumbnail.url, (progress: number) => {
            // Cap at 99% to avoid showing 100% before canvas is ready
            this._realLoadingProgressSubject.next(Math.min(progress, 99));
          })
        )
      ).subscribe(url => {
        this.realThumbnail = url;

        const initCanvas = () => {
          if (!this.touchRealCanvas) {
            this.utilsService.delay(10).subscribe(() => initCanvas());
            return;
          }

          this._canvasImage = new Image();
          this._canvasImage.decoding = "async";

          this._canvasImage.onload = () => {
            try {
              createImageBitmap(this._canvasImage).then(bitmap => {
                this._imageBitmap = bitmap;
                const canvas = this.touchRealCanvas.nativeElement;
                this._canvasContext = canvas.getContext('2d', {
                  alpha: false,
                  willReadFrequently: false
                });

                this._updateCanvasDimensions();
                this._drawCanvas();

                this.firstRender$.pipe(take(1)).subscribe(() => {
                  this.canvasLoading = false;
                  this._realLoadingProgressSubject.next(100);
                  this.changeDetectorRef.markForCheck();
                });

                this.changeDetectorRef.markForCheck();
              });
            } catch (error) {
              console.error('Failed to initialize canvas:', error);
            }
          };

          this._canvasImage.src = this.realThumbnailUnsafeUrl;
          this.changeDetectorRef.markForCheck();
        };

        initCanvas();
        this.changeDetectorRef.markForCheck();
      });

      subscriptions.add(this._hdThumbnailSubscription);
      subscriptions.add(this._realThumbnailSubscription);
    });

    subscriptions.add(this._imageSubscription);

    this.store$.dispatch(new LoadThumbnail({ data: this._getHdOptions(), bustCache: false }));

    return subscriptions;
  }

  private _clampOffset(): void {
    const { width, height } = this._canvasContainerDimensions;
    const { width: drawWidth, height: drawHeight } = this._canvasImageDimensions;

    const scaledWidth = drawWidth * this.touchScale;
    const scaledHeight = drawHeight * this.touchScale;
    const maxOffsetX = Math.max(0, (scaledWidth - width) / (2 * this.touchScale));
    const maxOffsetY = Math.max(0, (scaledHeight - height) / (2 * this.touchScale));

    this._touchScaleOffset = {
      x: Math.min(Math.max(this._touchScaleOffset.x, -maxOffsetX), maxOffsetX),
      y: Math.min(Math.max(this._touchScaleOffset.y, -maxOffsetY), maxOffsetY)
    };
  }

  private _updateCanvasDimensions(): void {
    if (!this.touchRealContainer || !this.touchRealCanvas) {
      return;
    }

    const container = this.touchRealContainer.nativeElement;
    const canvas = this.touchRealCanvas.nativeElement;

    this._canvasContainerDimensions = {
      width: container.offsetWidth,
      height: container.offsetHeight,
      centerX: container.offsetWidth * 0.5,
      centerY: container.offsetHeight * 0.5
    };

    canvas.width = this._canvasContainerDimensions.width;
    canvas.height = this._canvasContainerDimensions.height;

    // Recalculate image dimensions
    const imageRatio = this._canvasImage.width / this._canvasImage.height;
    const containerRatio = this._canvasContainerDimensions.width / this._canvasContainerDimensions.height;

    this._canvasImageDimensions = {
      width: imageRatio > containerRatio ?
        this._canvasContainerDimensions.width :
        this._canvasContainerDimensions.height * imageRatio,
      height: imageRatio > containerRatio ?
        this._canvasContainerDimensions.width / imageRatio :
        this._canvasContainerDimensions.height
    };
  }

  private _drawCanvas(): void {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
    }
    this._rafId = requestAnimationFrame(this._performDrawCanvas.bind(this));
  }

  private _performDrawCanvas(): void {
    if (!this._canvasContext || !this._imageBitmap) return;

    const ctx = this._canvasContext;
    const { width, height, centerX, centerY } = this._canvasContainerDimensions;
    const { width: drawWidth, height: drawHeight } = this._canvasImageDimensions;

    // Cache transform matrix
    const transform = `${this.touchScale},${centerX + this._touchScaleOffset.x * this.touchScale},${centerY + this._touchScaleOffset.y * this.touchScale}`;

    if (this._lastTransform === transform) return;
    this._lastTransform = transform;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);

    ctx.setTransform(
      this.touchScale,
      0,
      0,
      this.touchScale,
      centerX + this._touchScaleOffset.x * this.touchScale,
      centerY + this._touchScaleOffset.y * this.touchScale
    );

    this._clampOffset();
    ctx.drawImage(this._imageBitmap, -drawWidth * .5, -drawHeight * .5, drawWidth, drawHeight);

    if (!this._firstRenderSubject.value) {
      this._firstRenderSubject.next(true);
    }
  }

  private _setZoomLensSize(): void {
    this.zoomLensSize = Math.floor(this.windowRef.nativeWindow.innerWidth / 4);
    if (this.ngxImageZoom) {
      this.ngxImageZoom.lensWidth = this.zoomLensSize;
      this.ngxImageZoom.lensHeight = this.zoomLensSize;
    }
  }

  private _setZoomIndicatorTimeout(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this._zoomIndicatorTimeout) {
        clearTimeout(this._zoomIndicatorTimeout);
      }

      this._zoomIndicatorTimeout = this.windowRef.nativeWindow.setTimeout(() => {
        this.showZoomIndicator = false;
      }, this._zoomIndicatorTimeoutDuration);
    }
  }

  private _getHdOptions(): Omit<ImageThumbnailInterface, "url"> {
    return {
      id: this.id,
      revision: this.revisionLabel,
      alias: this.anonymized ? ImageAlias.HD_ANONYMIZED : ImageAlias.QHD
    };
  }

  private _getRealOptions(): Omit<ImageThumbnailInterface, "url"> {
    return {
      id: this.id,
      revision: this.revisionLabel,
      alias: this.anonymized ? ImageAlias.REAL_ANONYMIZED : ImageAlias.REAL
    };
  }

  private _preloadImage(url: string): Observable<void> {
    return new Observable(subscriber => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        subscriber.next();
        subscriber.complete();
      };
      img.onerror = (err) => subscriber.error(err);
      img.src = url;
    });
  }
}
