import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding, HostListener, Inject, Input, OnChanges, OnDestroy, OnInit, Output, PLATFORM_ID, Renderer2, SimpleChanges, ViewChild } from "@angular/core";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { HideFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import { LoadSolutionMatrix } from "@app/store/actions/solution.actions";
import { selectIsSolutionMatrixLoading, selectSolutionMatrix } from "@app/store/selectors/app/solution.selectors";
import { LoadThumbnail } from "@app/store/actions/thumbnail.actions";
import { selectCurrentFullscreenImage, selectCurrentFullscreenImageEvent } from "@app/store/selectors/app/app.selectors";
import { selectThumbnail } from "@app/store/selectors/app/thumbnail.selectors";
import { MainState } from "@app/store/state";
import { select, Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageAlias } from "@core/enums/image-alias.enum";
import { ImageService } from "@core/services/image/image.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { Coord, NgxImageZoomComponent } from "ngx-image-zoom";
import { BehaviorSubject, combineLatest, Observable, of, Subscription } from "rxjs";
import { distinctUntilChanged, filter, map, startWith, switchMap, take, tap } from "rxjs/operators";
import { ImageThumbnailInterface } from "@core/interfaces/image-thumbnail.interface";
import { UtilsService } from "@core/services/utils/utils.service";
import { isPlatformBrowser } from "@angular/common";
import { DeviceService } from "@core/services/device.service";
import { CookieService } from "ngx-cookie";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { FINAL_REVISION_LABEL, FullSizeLimitationDisplayOptions, ImageInterface, ImageRevisionInterface } from "@core/interfaces/image.interface";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { TitleService } from "@core/services/title/title.service";
import { fadeInOut } from "@shared/animations";
import { SwipeDownService } from "@core/services/swipe-down.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { ActiveToast } from "ngx-toastr";
import { CoordinatesFormatterService } from "@core/services/coordinates-formatter.service";
import { SolutionStatus } from "@core/interfaces/solution.interface";

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

  @Input()
  externalSolutionMatrix: {
    matrixRect: string;
    matrixDelta: number;
    raMatrix: string;
    decMatrix: string;
  };

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

  // Flag to easily check if we're running in a browser environment
  protected readonly isBrowser: boolean;

  // We initialize this to a default value, but it will be updated with minZoomRatio in _initImageZoom
  protected zoomScroll = 0;
  protected touchMode?: boolean = undefined;
  protected enableLens = true;
  protected zoomLensSize: number;
  protected showZoomIndicator = false;
  protected isHybridPC = false;
  protected isTouchDevice = false;
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
  protected isGif = false;
  protected zoomFrozen = false;
  protected mouseRa: string;
  protected mouseDec: string;
  protected mouseGalacticRa: string;
  protected mouseGalacticDec: string;
  protected showCoordinates: boolean = false;
  protected showKebabMenu: boolean = false;
  protected showKeyboardShortcutsOverlay: boolean = false;

  // Measuring tool properties
  protected advancedSolutionMatrix: {
    matrixRect: string;
    matrixDelta: number;
    raMatrix: string;
    decMatrix: string;
  };
  protected loadingAdvancedSolutionMatrix = false;
  protected isMeasuringMode: boolean = false;
  protected measureStartPoint: { x: number; y: number; ra: number; dec: number } = null;
  protected measureEndPoint: { x: number; y: number; ra: number; dec: number } = null;
  protected measureDistance: string = null;

  // Variables for dragging measurement points
  dragStartX: number = null;
  dragStartY: number = null;
  protected isDraggingPoint: 'start' | 'end' | string | null = null;
  protected pointDragRadius = 10; // Pixel radius around points that's draggable
  protected previousMeasurements: Array<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    midX: number;
    midY: number;
    distance: string;
    timestamp: number;
    startRa: number | null;
    startDec: number | null;
    endRa: number | null;
    endDec: number | null;
    // Positions for perpendicular label placement
    startLabelX: number;
    startLabelY: number;
    endLabelX: number;
    endLabelY: number;
    // Flags for showing shape visualizations
    showCircle?: boolean;
    showRectangle?: boolean;
  }> = [];
  
  // Flags for current measurement shapes
  protected showCurrentCircle: boolean = false;
  protected showCurrentRectangle: boolean = false;

  // Swipe-down properties
  protected touchStartY: { value: number } = { value: 0 };
  protected touchCurrentY: { value: number } = { value: 0 };
  protected touchPreviousY: { value: number } = { value: 0 };
  protected isSwiping: { value: boolean } = { value: false };
  protected swipeProgress: { value: number } = { value: 0 };
  protected swipeThreshold: number = 150;
  protected swipeDirectionDown: { value: boolean } = { value: true };

  // Mouse position for crosshair rulers
  protected mouseX: number = null;
  protected mouseY: number = null;
  protected crosshairLeft: number = 0;
  protected crosshairTop: number = 0;
  protected crosshairWidth: number = 0;
  protected crosshairHeight: number = 0;
  protected isMouseOverUIElement: boolean = false;
  protected image: ImageInterface;
  protected revision: ImageInterface | ImageRevisionInterface;

  // Track the "Activate zoom first" notification
  private _zoomActivationNotification: ActiveToast<any> | null = null;

  // Track the "Measuring tool only available at default zoom" notification
  private _measureZoomNotification: ActiveToast<any> | null = null;
  private _lastTransform: string = null;
  private _imageBitmap: ImageBitmap = null;
  private _canvasImage: HTMLImageElement;
  // Bound handlers for various event types
  private _onMeasuringMouseMove = this.handleMeasuringMouseMove.bind(this);
  private _onPreviousMeasurementDragMove: any = null;
  private _onPreviousMeasurementDragEnd: any = null;
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
  private _currentFullscreenImageEventSubscription: Subscription;
  private _zoomIndicatorTimeout: number;
  private _zoomIndicatorTimeoutDuration = 1000;
  private _hdLoadingProgressSubject = new BehaviorSubject<number>(0);
  private _realLoadingProgressSubject = new BehaviorSubject<number>(0);
  private _eagerLoadingSubscription: Subscription;
  private _firstRenderSubject = new BehaviorSubject<boolean>(false);
  readonly firstRender$ = this._firstRenderSubject.asObservable().pipe(
    filter(rendered => rendered)
  );

  // Two levels of downsampled bitmaps for smoother zoom transitions
  private _downsampledBitmapLow: ImageBitmap = null;  // Lower resolution for initial view
  private _downsampledBitmapMedium: ImageBitmap = null;  // Medium resolution for intermediate zoom
  private readonly LENS_ENABLED_COOKIE_NAME = "astrobin-fullscreen-lens-enabled";
  private readonly TOUCH_OR_MOUSE_MODE_COOKIE_NAME = "astrobin-fullscreen-touch-or-mouse";
  private readonly COORDINATES_ENABLED_COOKIE_NAME = "astrobin-fullscreen-show-coordinates";
  private readonly PIXEL_THRESHOLD = 8192 * 8192;
  private readonly FRAME_INTERVAL = 1000 / 120; // 120 FPS

  // Store original handlers and position for freezing/unfreezing
  private _originalOnMouseMove: any = null;
  private _originalOnMouseWheel: any = null;
  // Flags for drag operations
  private _dragInProgress = false;
  private _preventNextClick = false;

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
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly swipeDownService: SwipeDownService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly coordinatesFormatter: CoordinatesFormatterService
  ) {
    super(store$);

    // Initialize the browser flag
    this.isBrowser = isPlatformBrowser(platformId);

    this.isHybridPC = this.deviceService.isHybridPC();
    this.isTouchDevice = this.deviceService.isTouchEnabled();

    const touchModeCookie = this.cookieService.get(this.TOUCH_OR_MOUSE_MODE_COOKIE_NAME);
    this.touchMode = this.cookieService.get(this.TOUCH_OR_MOUSE_MODE_COOKIE_NAME) === "touch";

    if (!touchModeCookie) {
      this.setTouchMouseMode(this.isTouchDevice);
    } else {
      this.touchMode = touchModeCookie === "touch";
    }

    this.enableLens = this.cookieService.get(this.LENS_ENABLED_COOKIE_NAME) === "true";
    this.showCoordinates = this.cookieService.get(this.COORDINATES_ENABLED_COOKIE_NAME) === "true";
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
    return this.ngxImageZoom?.zoomService.zoomingEnabled;
  }

  protected get isVeryLargeImage(): boolean {
    return this.naturalWidth * (this.naturalHeight || this.naturalWidth) > this.PIXEL_THRESHOLD;
  }

  protected get hasAdvancedSolution(): boolean {
    return !!(
      this.revision?.solution?.status === SolutionStatus.ADVANCED_SUCCESS &&
      this.revision?.solution?.advancedRa &&
      this.revision?.solution?.advancedDec
    );
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isBrowser) {
      return;
    }

    // If the kebab menu is open and the click is outside the menu, close it
    if (this.showKebabMenu) {
      const kebabContainer = (event.target as HTMLElement).closest(".kebab-menu-container");
      if (!kebabContainer) {
        this.showKebabMenu = false;
        this.changeDetectorRef.markForCheck();
      }
    }
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    if (!this.isBrowser) {
      return;
    }

    this._setZoomLensSize();
    this._updateCanvasDimensions();
    this._drawCanvas();

    // Clear coordinate display until next mouse move
    this.mouseRa = null;
    this.mouseDec = null;
    this.mouseGalacticRa = null;
    this.mouseGalacticDec = null;

    // Reset crosshair position
    this.mouseX = null;
    this.mouseY = null;
    this.crosshairLeft = 0;
    this.crosshairTop = 0;
    this.crosshairWidth = 0;
    this.crosshairHeight = 0;

    this.changeDetectorRef.markForCheck();

    // Re-trigger coordinate calculation on next mouse movement
    if (this.revision && this.windowRef.nativeWindow) {
      // Use requestAnimationFrame to wait for the resize to finish
      this.windowRef.nativeWindow.requestAnimationFrame(() => {
        // If we have the current mouse position, simulate a mouse move event to update coordinates
        const lastMouseEvent = this.windowRef.nativeWindow.event as MouseEvent;
        if (lastMouseEvent && lastMouseEvent.type === "mousemove") {
          this.onGlobalMouseMove(lastMouseEvent);
        }
      });
    }
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

    if (this._currentFullscreenImageEventSubscription) {
      this._currentFullscreenImageEventSubscription.unsubscribe();
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

        this._resetCanvas();

        cancelAnimationFrame(this._animationFrame);
        this.exitFullscreen.emit();
        this.changeDetectorRef.markForCheck();
      });

      this._currentFullscreenImageEventSubscription = this.store$.pipe(
        select(selectCurrentFullscreenImageEvent),
        take(1)
      ).subscribe(event => {
        if (this._isTouchEvent(event)) {
          this.setTouchMouseMode(true);
          this.changeDetectorRef.markForCheck();
        } else if (event instanceof MouseEvent) {
          this.setTouchMouseMode(false);
          this.changeDetectorRef.markForCheck();
        }

        this.show = true;
        this.titleService.disablePageZoom();
        this.enterFullscreen.emit();

        // Only initialize thumbnails if not already eagerly loading
        if (!this._eagerLoadingSubscription && !this.hdThumbnail && !this.realThumbnail) {
          this._initThumbnailSubscriptions();
        }

        this.changeDetectorRef.markForCheck();
      });
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();

    // Remove any measuring mousemove listener if it exists
    if (this.isBrowser && this.isMeasuringMode) {
      document.removeEventListener("mousemove", this._onMeasuringMouseMove);

      // Also clean up drag event listeners if needed
      document.removeEventListener("mousemove", this._onDragMove);
      document.removeEventListener("mouseup", this._onDragEnd);
      document.removeEventListener("mousemove", this._onPointDragMove);
      document.removeEventListener("mouseup", this._onPointDragEnd);

      // Clean up any previous measurement drag listeners
      if (this._onPreviousMeasurementDragMove) {
        document.removeEventListener("mousemove", this._onPreviousMeasurementDragMove);
      }
      if (this._onPreviousMeasurementDragEnd) {
        document.removeEventListener("mouseup", this._onPreviousMeasurementDragEnd);
      }
    }

    // Clear any measuring zoom notification
    if (this._measureZoomNotification) {
      this.popNotificationsService.clear(this._measureZoomNotification.toastId);
      this._measureZoomNotification = null;
    }

    // Restore original event handlers if needed
    this._restoreOriginalEventHandlers();

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
    this._initImageZoom();
    this.changeDetectorRef.markForCheck();
  }

  setZoomPosition(position: Coord) {
    this.showZoomIndicator = this.zoomingEnabled;
    this._setZoomIndicatorTimeout();

    // Only disable coordinates display in lens mode
    if (this.enableLens && this.zoomingEnabled && this.showCoordinates) {
      this.showCoordinates = false;
      this.mouseRa = null;
      this.mouseDec = null;
      this.mouseGalacticRa = null;
      this.mouseGalacticDec = null;
      this.mouseX = null;
      this.mouseY = null;
      this.changeDetectorRef.markForCheck();
    }
  }

  setZoomScroll(scroll: number) {
    // If the zoom is changing, clear any "measuring tool only available at default zoom" notifications
    if (Math.abs(this.zoomScroll - scroll) > 0.001 && this._measureZoomNotification) {
      this.popNotificationsService.clear(this._measureZoomNotification.toastId);
      this._measureZoomNotification = null;
    }

    this.zoomScroll = scroll;

    // Show zoom indicator when zooming is enabled or when we're not at the default zoom level
    this.showZoomIndicator = this.zoomingEnabled || !this._isAtDefaultZoom();

    this._setZoomIndicatorTimeout();
  }

  snapTo1x() {
    if (this.ngxImageZoom) {
      try {
        this.ngxImageZoom.setMagnification = 1;
        this.ngxImageZoom.zoomService.zoomOn({ offsetX: 0, offsetY: 0 } as MouseEvent);
      } catch (e) {
        console.error("Error in snapTo1x:", e);
      }
    }
  }

  @HostListener("window:keyup.escape", ["$event"])
  hide(event: Event): void {
    if (!this.isBrowser) {
      return;
    }

    // Always prevent default and stop propagation to avoid browser's ESC behavior
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Close the kebab menu if it's open
    if (this.showKebabMenu) {
      this.showKebabMenu = false;
      this.changeDetectorRef.markForCheck();
      return;
    }

    // If in measuring mode, exit measuring mode instead of closing fullscreen
    if (this.isMeasuringMode) {
      // Use toggleMeasuringMode to fully exit the measuring mode
      this.toggleMeasuringMode(event as MouseEvent);
      return;
    }

    // Clear mouse position to hide rulers
    this.mouseX = null;
    this.mouseY = null;

    // Reset frozen state when hiding
    if (this.zoomFrozen) {
      this.zoomFrozen = false;
      this._restoreOriginalEventHandlers();
    }

    this.store$.dispatch(new HideFullscreenImage());
  }

  @HostListener("window:keyup.z", ["$event"])
  toggleZoomLensMode(event: KeyboardEvent): void {
    if (!this.isBrowser) {
      return;
    }

    // Don't interfere with input fields
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      (event.target instanceof HTMLDivElement && event.target.hasAttribute("contenteditable"))
    ) {
      return;
    }

    // Do nothing if the component is not being shown, in touch mode, or in measuring mode
    if (!this.show || this.touchMode || this.isMeasuringMode) {
      return;
    }

    // Toggle lens mode using existing method
    this.toggleEnableLens(null);
  }

  @HostListener("window:keyup.c", ["$event"])
  toggleCoordinatesShortcut(event: KeyboardEvent): void {
    if (!this.isBrowser) {
      return;
    }

    // Don't interfere with input fields
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      (event.target instanceof HTMLDivElement && event.target.hasAttribute("contenteditable"))
    ) {
      return;
    }

    // Do nothing if the component is not being shown, in measuring mode, or if the image doesn't have an advanced solution
    if (!this.show || this.isMeasuringMode || !this.hasAdvancedSolution) {
      return;
    }

    // Toggle coordinates using existing method
    this.toggleCoordinates();
  }

  @HostListener("window:keyup.d", ["$event"])
  toggleMeasuringModeShortcut(event: KeyboardEvent): void {
    if (!this.isBrowser) {
      return;
    }

    // Don't interfere with input fields
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      (event.target instanceof HTMLDivElement && event.target.hasAttribute("contenteditable"))
    ) {
      return;
    }

    // Do nothing if the component is not being shown or if it's a GIF
    if (!this.show || this.isGif) {
      return;
    }

    // Don't allow measuring when zoomed in - only at default zoom level (fit to window)
    if (!this.isMeasuringMode && !this._isAtDefaultZoom()) {
      // Store the notification reference so we can clear it when zoom changes
      this._measureZoomNotification = this.popNotificationsService.warning(
        this.translateService.instant("Measuring is only available at the default zoom level (fit to window).")
      );
      return;
    }

    // Toggle measuring mode using existing method
    this.toggleMeasuringMode(event as unknown as MouseEvent);
  }

  // Reset to default zoom level (fit to window)
  resetToDefaultZoom(): void {
    // Reset zoom to default level (fit to window)
    if (this.ngxImageZoom && this.ngxImageZoom.zoomService) {
      // Set magnification to the minimum ratio (fit to window)
      const minRatio = this.ngxImageZoom.zoomService.minZoomRatio;
      this.ngxImageZoom.zoomService.magnification = minRatio;

      // Clear any measuring zoom notifications immediately
      if (this._measureZoomNotification) {
        this.popNotificationsService.clear(this._measureZoomNotification.toastId);
        this._measureZoomNotification = null;
      }

      // Update the UI to show the current zoom level
      this.setZoomScroll(minRatio);

      // Trigger a zoom update if needed
      if (this.ngxImageZoom.zoomService.zoomingEnabled) {
        // Create a center-based mouse event to update zoom position
        const container = this.ngxImageZoomEl.nativeElement;
        if (container) {
          const rect = container.getBoundingClientRect();
          const fakeEvent = {
            offsetX: rect.width / 2,
            offsetY: rect.height / 2
          } as MouseEvent;
          this.ngxImageZoom.zoomService.calculateZoomPosition(fakeEvent);
        }
      }
    }
  }

  @HostListener("window:keyup.f", ["$event"])
  toggleZoomFreeze(event: KeyboardEvent | MouseEvent): void {
    if (!this.isBrowser) {
      return;
    }

    // Don't interfere with input fields
    if (event instanceof KeyboardEvent) {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLDivElement && event.target.hasAttribute("contenteditable"))
      ) {
        return;
      }
    }

    // Do nothing if the component is not being shown or in measuring mode
    if (!this.show || this.isMeasuringMode) {
      return;
    }

    // Only work in non-touch mode with active zooming
    if (!this.zoomingEnabled || this.touchMode || this.isVeryLargeImage) {
      // Show feedback for why F key doesn't work
      if (this.touchMode) {
        this.popNotificationsService.info(
          this.translateService.instant("Zoom freezing is only available in mouse mode.")
        );
      } else if (this.isVeryLargeImage) {
        this.popNotificationsService.info(
          this.translateService.instant("Zoom freezing is not available for very large images.")
        );
      } else if (!this.zoomingEnabled) {
        // Store the toast reference so we can clear this specific notification when zoom is activated
        this._zoomActivationNotification = this.popNotificationsService.info(
          this.translateService.instant("Activate zoom first before freezing (click or scroll on image).")
        );
      }
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    // Toggle frozen state
    this.zoomFrozen = !this.zoomFrozen;

    if (this.zoomFrozen) {
      // Directly remove the mouse events from the ngx-image-zoom component
      this._deregisterZoomEvents();
    } else {
      // Re-register the events to enable normal behavior
      this._registerZoomEvents();
    }

    this.changeDetectorRef.markForCheck();
  }

  // Handle wheel events on the component and proxy them to ngx-image-zoom
  /**
   * Handle wheel events and apply appropriate zoom behavior
   */
  protected onGlobalWheel(event: WheelEvent): void {
    // Block wheel events during measuring mode
    if (this.isMeasuringMode) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    // If the event has ctrlKey, it's a pinch gesture in Firefox or zoom in other browsers
    // Always prevent browser zoom
    if (event.ctrlKey) {
      event.preventDefault();
      event.stopPropagation();

      // Handle Firefox pinch gestures directly here
      // This ensures the component's wheel events get proxied to ngx-image-zoom
      if (!this.touchMode && this.ngxImageZoom && !this.isVeryLargeImage && !this.zoomFrozen) {
        this._handleFirefoxPinchZoom(event);
      }
      return;
    }

    // Don't handle zoom events if frozen
    if (this.zoomFrozen) {
      return;
    }

    // Only proxy the event if we have the zoom component and we're not in touch mode
    if (!this.touchMode && this.ngxImageZoom && !this.isVeryLargeImage) {
      // First check if we need to activate zoom
      if (!this.zoomingEnabled) {
        // If we're not zoomed yet, activate zoom at event position
        this.ngxImageZoom.zoomService.magnification = this.ngxImageZoom.zoomService.minZoomRatio;
        this.ngxImageZoom.zoomService.zoomOn(event);

        // Clear specific "Activate zoom first" notification if it exists
        if (this._zoomActivationNotification) {
          // Extract toast ID - ActiveToast has a toastId property of type number
          if (typeof this._zoomActivationNotification !== "string" && this._zoomActivationNotification.toastId) {
            this.popNotificationsService.clear(this._zoomActivationNotification.toastId);
          }
          this._zoomActivationNotification = null;
        }

        this.changeDetectorRef.markForCheck();
        return;
      }

      // If already zoomed, modify the zoom level based on wheel delta
      if (this.zoomingEnabled) {
        // Get current values
        const currentMag = this.ngxImageZoom.zoomService.magnification;
        const minRatio = this.ngxImageZoom.zoomService.minZoomRatio || 1;
        const maxRatio = this.ngxImageZoom.zoomService.maxZoomRatio || 2;
        const stepSize = .05; // Default step size

        // For normal wheel events, use deltaY with opposite sign (up = zoom in, down = zoom out)
        const delta = -event.deltaY / 100; // Normalize regular wheel delta

        // Calculate new magnification
        let newMag = currentMag;
        if (delta > 0) { // Scroll up - zoom in
          newMag = Math.min(currentMag + stepSize, maxRatio);
        } else if (delta < 0) { // Scroll down - zoom out
          newMag = Math.max(currentMag - stepSize, minRatio);
        }

        // Update magnification if changed
        if (newMag !== currentMag) {
          this.ngxImageZoom.zoomService.magnification = newMag;

          // Update calculations
          this.ngxImageZoom.zoomService.calculateRatio();
          this.ngxImageZoom.zoomService.calculateZoomPosition(event);

          // Update zoom indicator
          this.setZoomScroll(newMag);
          this.changeDetectorRef.markForCheck();
        }
      }
    }
  }

  // Handle mouse move events on the component and proxy them to ngx-image-zoom
  protected onGlobalMouseMove(event: MouseEvent): void {
    // If in measuring mode, and we've already placed the first point,
    // update line drawing position but allow coordinate calculation to continue
    if (this.isMeasuringMode && this.measureStartPoint) {
      // Update mouse position for line drawing
      this.mouseX = event.clientX;
      this.mouseY = event.clientY;

      // Don't trigger zoom functionality, but continue to next section to update coordinates
      // This allows coordinates to be updated in the display box while placing the second point
    }

    // We need to ensure the revision is loaded before calculating coordinates
    if (!this.revision) {
      return;
    }

    // Don't update position if frozen
    if (this.zoomFrozen) {
      return;
    }

    // Don't update position if touch mode is active
    if (this.touchMode) {
      return;
    }

    // Update mouse position for crosshair rulers and coordinate display
    const imageElement = this.ngxImageZoomEl?.nativeElement?.querySelector(".ngxImageZoomContainer img");

    if (imageElement) {
      // Get fresh dimensions each time
      const imageRect = imageElement.getBoundingClientRect();

      // Always store the mouse position for crosshairs if coordinates are enabled
      if (this.showCoordinates) {
        this.mouseX = event.clientX;
        this.mouseY = event.clientY;

        // Check if mouse is within bounds of the actual image
        if (
          event.clientX >= imageRect.left &&
          event.clientX <= imageRect.right &&
          event.clientY >= imageRect.top &&
          event.clientY <= imageRect.bottom
        ) {
          // Recalculate coordinates immediately
          if (this.revision?.solution?.ra || this.revision?.solution?.advancedRa) {
            this._calculateMouseCoordinates(event);
          }
        } else {
          // Hide coordinate display when mouse is outside the image
          this.mouseRa = null;
          this.mouseDec = null;
          this.mouseGalacticRa = null;
          this.mouseGalacticDec = null;
        }
      } else {
        // Coordinates are disabled, clear all values
        this.mouseX = null;
        this.mouseY = null;
        this.mouseRa = null;
        this.mouseDec = null;
        this.mouseGalacticRa = null;
        this.mouseGalacticDec = null;
      }

      this.changeDetectorRef.markForCheck();
    }

    // Only proxy if we have the zoom component, are in mouse mode, not in measuring mode, and are currently zooming
    if (!this.touchMode && this.ngxImageZoom && this.zoomingEnabled && !this.isVeryLargeImage && !this.isMeasuringMode) {
      // We need to convert global coordinates to coordinates relative to the image
      // Find the image and its position
      const zoomContainer = this.ngxImageZoomEl.nativeElement.querySelector(".ngxImageZoomContainer");
      if (!zoomContainer) {
        return;
      }

      // Get container's position
      const rect = zoomContainer.getBoundingClientRect();

      // Check if mouse is within the bounds of the zoom container
      if (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      ) {
        // Convert global coordinates to relative coordinates
        const relativeEvent = {
          ...event,
          offsetX: event.clientX - rect.left,
          offsetY: event.clientY - rect.top
        };

        // Update the zoom position
        this.ngxImageZoom.zoomService.calculateZoomPosition(relativeEvent);
        this.changeDetectorRef.markForCheck();
      }
    }
  }

  protected toggleEnableLens(event: MouseEvent = null): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();

      // Hide any tooltips before toggling
      this._clearTooltips();
    }

    const wasInLensMode = this.enableLens;
    this.enableLens = !this.enableLens;
    this.cookieService.put(this.LENS_ENABLED_COOKIE_NAME, this.enableLens.toString());

    if (this.enableLens) {
      // Entering lens mode
      this._setZoomLensSize();

      // Turn off coordinates when lens mode is activated
      if (this.showCoordinates) {
        this.showCoordinates = false;
        this.mouseRa = null;
        this.mouseDec = null;
        this.mouseGalacticRa = null;
        this.mouseGalacticDec = null;
        this.mouseX = null;
        this.mouseY = null;
        this.changeDetectorRef.markForCheck();
      }
    } else if (wasInLensMode) {
      // Exiting lens mode - clear any notifications that might be related to lens mode
      this.popNotificationsService.clear();
    }
  }

  protected setMouseOverUIElement(isOver: boolean): void {
    this.isMouseOverUIElement = isOver;
    this.changeDetectorRef.markForCheck();
  }

  protected showShortcutsDialog(event: MouseEvent): void {
    // Prevent the event from propagating
    event.preventDefault();
    event.stopPropagation();

    // Hide any tooltips
    document.querySelectorAll(".tooltip").forEach(tooltip => {
      tooltip.remove();
    });

    // Close the kebab menu
    this.showKebabMenu = false;

    // Toggle the shortcuts overlay
    this.showKeyboardShortcutsOverlay = true;

    this.changeDetectorRef.markForCheck();
  }

  protected hideShortcutsOverlay(): void {
    this.showKeyboardShortcutsOverlay = false;
    this.changeDetectorRef.markForCheck();
  }

  protected toggleKebabMenu(event: MouseEvent): void {
    // Prevent the event from propagating to avoid triggering other click handlers
    event.preventDefault();
    event.stopPropagation();

    // Hide any tooltips before toggling
    this._clearTooltips();

    this.showKebabMenu = !this.showKebabMenu;

    // If opening the menu, add a click event listener to close it when clicking outside
    if (this.showKebabMenu && this.isBrowser) {
      setTimeout(() => {
        const closeMenuHandler = (e: MouseEvent) => {
          // Check if the click was outside the menu
          const kebabContainer = (event.target as HTMLElement).closest(".kebab-menu-container");
          const clickedInsideMenu = kebabContainer && kebabContainer.contains(e.target as Node);

          if (!clickedInsideMenu) {
            this.showKebabMenu = false;
            this.changeDetectorRef.markForCheck();
            document.removeEventListener("click", closeMenuHandler);
          }
        };

        document.addEventListener("click", closeMenuHandler);
      });
    }

    this.changeDetectorRef.markForCheck();
  }

  protected toggleCoordinates(): void {
    // Hide any tooltips before toggling
    this._clearTooltips();

    // If in lens mode, show notification and don't toggle
    if (this.enableLens && this.zoomingEnabled) {
      this.popNotificationsService.warning(
        this.translateService.instant("Coordinates are not available in lens mode.")
      );
      return;
    }

    this.showCoordinates = !this.showCoordinates;
    this.cookieService.put(this.COORDINATES_ENABLED_COOKIE_NAME, this.showCoordinates.toString());

    // If coordinates are turned off, hide any currently displayed values
    if (!this.showCoordinates) {
      this.mouseRa = null;
      this.mouseDec = null;
      this.mouseGalacticRa = null;
      this.mouseGalacticDec = null;
      this.mouseX = null;
      this.mouseY = null;
    } else if (this.mouseX !== null && this.mouseY !== null) {
      // If coordinates are turned on and we have a current mouse position, recalculate
      const lastMouseEvent = this.windowRef.nativeWindow.event as MouseEvent;
      if (lastMouseEvent && lastMouseEvent.type === "mousemove") {
        this.onGlobalMouseMove(lastMouseEvent);
      }
    }
    this.changeDetectorRef.markForCheck();
  }

  protected toggleMeasuringMode(event: MouseEvent): void {
    // Prevent the event from propagating and being handled by handleMeasurementClick
    event.preventDefault();
    event.stopPropagation();

    // Hide any tooltips before toggling
    this._clearTooltips();

    // Don't allow measuring in lens mode
    if (this.enableLens && this.zoomingEnabled) {
      this.popNotificationsService.warning(
        this.translateService.instant("Measuring is not available in lens mode.")
      );
      return;
    }

    // Don't allow measuring when zoomed in - only at default zoom level (fit to window)
    if (!this._isAtDefaultZoom()) {
      // Store the notification reference so we can clear it when zoom changes
      this._measureZoomNotification = this.popNotificationsService.warning(
        this.translateService.instant("Measuring is only available at the default zoom level (fit to window).")
      );
      return;
    }

    // Clear any existing measurements
    this.resetMeasurement();

    // Toggle measuring mode
    this.isMeasuringMode = !this.isMeasuringMode;

    // If exiting measuring mode, clear all previous measurements
    if (!this.isMeasuringMode) {
      this.previousMeasurements = [];

      // Ensure we reset the mouse position tracking for the measuring line
      this.mouseX = null;
      this.mouseY = null;

      // If we added a global mousemove listener, remove it
      if (this.isBrowser) {
        document.removeEventListener("mousemove", this._onMeasuringMouseMove);
      }
    } else {
      // When entering measuring mode, add a global mousemove listener to track mouse position for the measurement line
      if (this.isBrowser) {
        document.addEventListener("mousemove", this._onMeasuringMouseMove);
      }
    }

    this.changeDetectorRef.markForCheck();
  }

  /**
   * Handle the mousedown event to either:
   * 1. Set a start point if one doesn't exist
   * 2. Start a drag operation if start point exists but no end point
   */
  protected handleStartPointOrDrag(event: MouseEvent): void {
    if (!this.isMeasuringMode) {
      return;
    }

    // Check if the click is on UI elements that should be excluded from measurement
    const target = event.target as HTMLElement;
    if (target.closest(".zoom-modes") || target.closest(".close") ||
      target.closest(".measuring-reset") || target.closest(".measure-distance")) {
      return;
    }

    // Get the image element and check if mousedown is over the image
    const imageElement = this._getMeasurementImageElement();
    if (!imageElement) {
      return;
    }

    const imageRect = imageElement.getBoundingClientRect();
    if (
      event.clientX < imageRect.left ||
      event.clientX > imageRect.right ||
      event.clientY < imageRect.top ||
      event.clientY > imageRect.bottom
    ) {
      return;
    }

    // Check if we're clicking near an existing point to drag it
    if (this.measureStartPoint && this.measureEndPoint) {
      // Calculate distances to start and end points
      const distToStart = Math.sqrt(
        Math.pow(event.clientX - this.measureStartPoint.x, 2) +
        Math.pow(event.clientY - this.measureStartPoint.y, 2)
      );

      const distToEnd = Math.sqrt(
        Math.pow(event.clientX - this.measureEndPoint.x, 2) +
        Math.pow(event.clientY - this.measureEndPoint.y, 2)
      );

      // If we're close enough to either point, start dragging it
      if (distToStart <= this.pointDragRadius) {
        this.isDraggingPoint = 'start';
        this._dragInProgress = true;
        document.addEventListener('mousemove', this._onPointDragMove);
        document.addEventListener('mouseup', this._onPointDragEnd);

        // Set the flag to prevent the upcoming click event from being processed
        this._preventNextClick = true;
        setTimeout(() => {
          this._preventNextClick = false;
        }, 100);
        return;
      } else if (distToEnd <= this.pointDragRadius) {
        this.isDraggingPoint = 'end';
        this._dragInProgress = true;
        document.addEventListener('mousemove', this._onPointDragMove);
        document.addEventListener('mouseup', this._onPointDragEnd);

        // Set the flag to prevent the upcoming click event from being processed
        this._preventNextClick = true;
        setTimeout(() => {
          this._preventNextClick = false;
        }, 100);
        return;
      }
    }

    // If we don't have a start point, set it now
    if (!this.measureStartPoint) {
      // Extract current RA/Dec at mouse position if available
      let ra = null, dec = null;

      if (this.revision?.solution) {
        const coords = this._calculateCoordinatesAtPoint(event.clientX, event.clientY);
        if (coords) {
          ra = coords.ra;
          dec = coords.dec;
        }
      }

      this.measureStartPoint = {
        x: event.clientX,
        y: event.clientY,
        ra,
        dec
      };

      // Set the flag to prevent the upcoming click event from being processed
      this._preventNextClick = true;
      setTimeout(() => {
        this._preventNextClick = false;
      }, 100);

      this.changeDetectorRef.markForCheck();
    }
    // If we have a start point but no end point, start a drag operation
    else if (!this.measureEndPoint) {
      // Start the drag operation
      this._dragInProgress = true;

      // Add document-level handlers for drag operations
      document.addEventListener("mousemove", this._onDragMove);
      document.addEventListener("mouseup", this._onDragEnd);
    }
  }

  protected handleMeasurementClick(event: MouseEvent): void {
    if (!this.isMeasuringMode) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    // Skip this click if it was triggered as part of a drag operation
    if (this._preventNextClick) {
      return;
    }

    // Main measurement click handler

    // Check if the click is on UI elements that should be excluded from measurement
    const target = event.target as HTMLElement;
    if (target.closest(".zoom-modes") || target.closest(".close") ||
      target.closest(".measuring-reset") || target.closest(".measure-distance")) {
      // Clicked on UI element, ignore for measurement
      return;
    }

    const imageElement = this._getMeasurementImageElement();
    if (!imageElement) {
      return;
    }

    // Get image coordinates
    const imageRect = imageElement.getBoundingClientRect();

    // Check if click is within image bounds
    if (
      event.clientX >= imageRect.left &&
      event.clientX <= imageRect.right &&
      event.clientY >= imageRect.top &&
      event.clientY <= imageRect.bottom
    ) {
      // First point
      if (!this.measureStartPoint) {
        // Extract current RA/Dec at mouse position if available
        let ra = null, dec = null;

        if (this.revision?.solution) {
          // Try to calculate coordinates for the point
          const coords = this._calculateCoordinatesAtPoint(event.clientX, event.clientY);
          if (coords) {
            ra = coords.ra;
            dec = coords.dec;
          }
        }

        this.measureStartPoint = {
          x: event.clientX,
          y: event.clientY,
          ra,
          dec
        };
      }
      // Second point
      else if (!this.measureEndPoint) {
        // Extract current RA/Dec at mouse position if available
        let ra = null, dec = null;

        if (this.revision?.solution) {
          // Try to calculate coordinates for the point
          const coords = this._calculateCoordinatesAtPoint(event.clientX, event.clientY);
          if (coords) {
            ra = coords.ra;
            dec = coords.dec;
          }
        }

        this.measureEndPoint = {
          x: event.clientX,
          y: event.clientY,
          ra,
          dec
        };

        // Use the shared measurement calculation and storage method
        this._calculateAndStoreMeasurement();
      }

      this.changeDetectorRef.markForCheck();
    }
  }

  protected resetMeasurement(): void {
    this.measureStartPoint = null;
    this.measureEndPoint = null;
    this.measureDistance = null;
    this.changeDetectorRef.markForCheck();
  }

  protected clearAllMeasurements(): void {
    this.resetMeasurement();
    this.previousMeasurements = [];
    this.changeDetectorRef.markForCheck();
  }

  protected calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }
  
  /**
   * Formats angular distance in degrees to a DMS string
   * @param angularDistance - Angular distance in degrees
   * @returns Formatted string with degrees, arcminutes, and arcseconds
   */
  protected formatAngularDistance(angularDistance: number): string {
    if (typeof angularDistance !== 'number' || isNaN(angularDistance)) {
      return null;
    }
    
    const degrees = Math.floor(angularDistance);
    const arcminutes = Math.floor((angularDistance - degrees) * 60);
    const arcseconds = Math.round(((angularDistance - degrees) * 60 - arcminutes) * 60);
    
    return `${degrees.toString().padStart(2, '0')}° ${arcminutes.toString().padStart(2, '0')}′ ${arcseconds.toString().padStart(2, '0')}″`;
  }
  
  /**
   * Get celestial coordinates for a horizontal line along a rectangle
   * @param startX - First point X coordinate
   * @param startY - First point Y coordinate
   * @param endX - Second point X coordinate
   * @param endY - First point Y coordinate (same as startY for horizontal line)
   * @returns Angular distance as formatted string or null if not available
   */
  protected getHorizontalCelestialDistance(startX: number, startY: number, endX: number): string {
    // Only calculate if advanced solution is available
    if (!this.hasAdvancedSolution) {
      return null;
    }
    
    // Calculate celestial coordinates at both points
    const startCoords = this._calculateCoordinatesAtPoint(startX, startY);
    const endCoords = this._calculateCoordinatesAtPoint(endX, startY);
    
    if (!startCoords || !endCoords) {
      return null;
    }
    
    // Calculate angular distance
    const angularDistance = this._calculateAngularDistance(
      startCoords.ra,
      startCoords.dec,
      endCoords.ra,
      endCoords.dec
    );
    
    return this.formatAngularDistance(angularDistance);
  }
  
  /**
   * Get celestial coordinates for a vertical line along a rectangle
   * @param startX - First point X coordinate (same as endX for vertical line)
   * @param startY - First point Y coordinate
   * @param endY - Second point Y coordinate
   * @returns Angular distance as formatted string or null if not available
   */
  protected getVerticalCelestialDistance(startX: number, startY: number, endY: number): string {
    // Only calculate if advanced solution is available
    if (!this.hasAdvancedSolution) {
      return null;
    }
    
    // Calculate celestial coordinates at both points
    const startCoords = this._calculateCoordinatesAtPoint(startX, startY);
    const endCoords = this._calculateCoordinatesAtPoint(startX, endY);
    
    if (!startCoords || !endCoords) {
      return null;
    }
    
    // Calculate angular distance
    const angularDistance = this._calculateAngularDistance(
      startCoords.ra,
      startCoords.dec,
      endCoords.ra,
      endCoords.dec
    );
    
    return this.formatAngularDistance(angularDistance);
  }

  protected toggleCurrentCircle(event: MouseEvent): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Toggle current measurement circle visibility
    this.showCurrentCircle = !this.showCurrentCircle;
    
    // If turning on circle, turn off rectangle to avoid visual clutter
    if (this.showCurrentCircle) {
      this.showCurrentRectangle = false;
    }
    
    this.changeDetectorRef.markForCheck();
  }
  
  protected toggleCurrentRectangle(event: MouseEvent): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Toggle current measurement rectangle visibility
    this.showCurrentRectangle = !this.showCurrentRectangle;
    
    // If turning on rectangle, turn off circle to avoid visual clutter
    if (this.showCurrentRectangle) {
      this.showCurrentCircle = false;
    }
    
    this.changeDetectorRef.markForCheck();
  }
  
  protected toggleCircle(event: MouseEvent, index: number): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Toggle the circle for the specified measurement
    this.previousMeasurements[index].showCircle = !this.previousMeasurements[index].showCircle;
    
    // If turning on circle, turn off rectangle to avoid visual clutter
    if (this.previousMeasurements[index].showCircle) {
      this.previousMeasurements[index].showRectangle = false;
    }
    
    this.changeDetectorRef.markForCheck();
  }
  
  protected toggleRectangle(event: MouseEvent, index: number): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    // Toggle the rectangle for the specified measurement
    this.previousMeasurements[index].showRectangle = !this.previousMeasurements[index].showRectangle;
    
    // If turning on rectangle, turn off circle to avoid visual clutter
    if (this.previousMeasurements[index].showRectangle) {
      this.previousMeasurements[index].showCircle = false;
    }
    
    this.changeDetectorRef.markForCheck();
  }

  protected deleteMeasurement(event: MouseEvent, index: number): void {
    // Prevent event propagation to avoid triggering other click handlers
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (index >= 0 && index < this.previousMeasurements.length) {
      this.previousMeasurements.splice(index, 1);
      this.changeDetectorRef.markForCheck();
    }
  }

  protected calculateStartLabelX(): number {
    if (!this.measureStartPoint || !this.measureEndPoint) {
      return this.measureStartPoint?.x || 0;
    }
    
    // Use the shared function to calculate optimal label positions
    const labelPositions = this._calculateLabelPositions(
      this.measureStartPoint.x,
      this.measureStartPoint.y,
      this.measureEndPoint.x,
      this.measureEndPoint.y
    );
    
    return labelPositions.startLabelX;
  }

  protected calculateStartLabelY(): number {
    if (!this.measureStartPoint || !this.measureEndPoint) {
      return this.measureStartPoint?.y || 0;
    }
    
    // Use the shared function to calculate optimal label positions
    const labelPositions = this._calculateLabelPositions(
      this.measureStartPoint.x,
      this.measureStartPoint.y,
      this.measureEndPoint.x,
      this.measureEndPoint.y
    );
    
    return labelPositions.startLabelY;
  }

  protected calculateEndLabelX(): number {
    if (!this.measureStartPoint || !this.measureEndPoint) {
      return this.measureEndPoint?.x || 0;
    }
    
    // Use the shared function to calculate optimal label positions
    const labelPositions = this._calculateLabelPositions(
      this.measureStartPoint.x,
      this.measureStartPoint.y,
      this.measureEndPoint.x,
      this.measureEndPoint.y
    );
    
    return labelPositions.endLabelX;
  }

  protected calculateEndLabelY(): number {
    if (!this.measureStartPoint || !this.measureEndPoint) {
      return this.measureEndPoint?.y || 0;
    }
    
    // Use the shared function to calculate optimal label positions
    const labelPositions = this._calculateLabelPositions(
      this.measureStartPoint.x,
      this.measureStartPoint.y,
      this.measureEndPoint.x,
      this.measureEndPoint.y
    );
    
    return labelPositions.endLabelY;
  }

  protected formatCoordinatesCompact(ra: number, dec: number): string {
    // Format RA and Dec in a compact format for display
    // RA is in degrees, convert to hours (24h = 360°)
    const raHours = ra / 15;
    const raH = Math.floor(raHours);
    const raM = Math.floor((raHours - raH) * 60);
    const raS = Math.floor(((raHours - raH) * 60 - raM) * 60);

    // Dec is in degrees
    const decSign = dec < 0 ? "-" : "+";
    const decDeg = Math.abs(dec);
    const decD = Math.floor(decDeg);
    const decM = Math.floor((decDeg - decD) * 60);
    const decS = Math.floor(((decDeg - decD) * 60 - decM) * 60);

    // Pad with zeros for consistent display in fixed-width font
    const paddedRaM = raM.toString().padStart(2, '0');
    const paddedRaS = raS.toString().padStart(2, '0');
    const paddedDecM = decM.toString().padStart(2, '0');
    const paddedDecS = decS.toString().padStart(2, '0');

    // Return in very compact format with zero-padded minutes and seconds
    return `${raH}h${paddedRaM}m${paddedRaS}s, ${decSign}${decD}°${paddedDecM}'${paddedDecS}"`;
  }

  protected clearCoordinates(): void {
    if (this.showCoordinates) {
      this.mouseX = null;
      this.mouseY = null;
      this.mouseRa = null;
      this.mouseDec = null;
      this.mouseGalacticRa = null;
      this.mouseGalacticDec = null;
      this.changeDetectorRef.markForCheck();
    }
  }

  protected setTouchMouseMode(touch: boolean): void {
    // Hide any tooltips before toggling
    this._clearTooltips();

    // Never allow touch mode for GIFs
    if (this.isGif && touch) {
      return;
    }

    this.touchMode = touch;
    this.cookieService.put(this.TOUCH_OR_MOUSE_MODE_COOKIE_NAME, this.touchMode ? "touch" : "mouse");
    if (this.touchMode) {
      this._initCanvas();
    } else {
      this._resetCanvas();
    }
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

  /**
   * Checks if we can swipe to close the viewer
   * Only allow swipe-down when the image is not zoomed in beyond fit-to-screen
   */
  protected canSwipeToClose(): boolean {
    // For GIFs we can always swipe to close (no zoom)
    if (this.isGif) {
      return true;
    }

    // For very large images we can always swipe to close (no interactive zoom)
    if (this.isVeryLargeImage) {
      return true;
    }

    if (this.touchMode) {
      // In touch mode, we can only swipe when the touchScale is 1 (fully zoomed out)
      return this.touchScale <= 1;
    } else {
      // In mouse mode, we can only swipe when the zoom is at 1x
      return !this.zoomingEnabled || this.zoomScroll <= 1;
    }
  }

  /**
   * Handle touch start for swipe-down gesture
   */
  protected onTouchStart(event: TouchEvent): void {
    this.swipeDownService.handleTouchStart(
      event,
      this.touchStartY,
      this.touchCurrentY,
      this.touchPreviousY,
      this.swipeDirectionDown
    );
  }

  /**
   * Handle touch move for swipe-down gesture
   */
  protected onTouchMove(event: TouchEvent): void {
    this.swipeDownService.handleTouchMove(
      event,
      this.touchStartY,
      this.touchCurrentY,
      this.touchPreviousY,
      this.swipeDirectionDown,
      this.isSwiping,
      this.swipeProgress,
      this.swipeThreshold,
      new ElementRef(event.currentTarget),
      this.renderer,
      () => this.canSwipeToClose()
    );
  }

  /**
   * Handle touch end for swipe-down gesture
   */
  protected onTouchEnd(event: TouchEvent): void {
    this.swipeDownService.handleTouchEnd(
      this.isSwiping,
      this.touchStartY,
      this.touchCurrentY,
      this.touchPreviousY,
      this.swipeDirectionDown,
      this.swipeThreshold,
      this.swipeProgress,
      new ElementRef(event.currentTarget),
      this.renderer,
      () => {
        this.hide(null);
      }
    );
  }

  // Bound handlers for document-level drag events
  private _onDragMove = (event: MouseEvent) => {
    if (!this._dragInProgress) {
      return;
    }

    // Update the mouse position for drawing the preview line
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
    this.changeDetectorRef.markForCheck();
  };

  private _onDragEnd = (event: MouseEvent) => {
    if (!this._dragInProgress) {
      return;
    }

    // Clean up document-level handlers
    document.removeEventListener("mousemove", this._onDragMove);
    document.removeEventListener("mouseup", this._onDragEnd);

    // Set the end point at the current mouse position
    const imageElement = this._getMeasurementImageElement();
    if (imageElement) {
      const imageRect = imageElement.getBoundingClientRect();

      // Only complete the measurement if the mouseup is over the image
      if (
        event.clientX >= imageRect.left &&
        event.clientX <= imageRect.right &&
        event.clientY >= imageRect.top &&
        event.clientY <= imageRect.bottom
      ) {
        // Check if we've moved enough from the start point to consider it a drag
        const dx = event.clientX - this.measureStartPoint.x;
        const dy = event.clientY - this.measureStartPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Only set end point if distance is significant (to avoid accidental clicks)
        if (distance > 5) {
          // Extract current RA/Dec at mouse position
          let ra = null, dec = null;

          if (this.revision?.solution) {
            const coords = this._calculateCoordinatesAtPoint(event.clientX, event.clientY);
            if (coords) {
              ra = coords.ra;
              dec = coords.dec;
            }
          }

          this.measureEndPoint = {
            x: event.clientX,
            y: event.clientY,
            ra,
            dec
          };

          // Calculate and store measurement
          this._calculateAndStoreMeasurement();

          // The _calculateAndStoreMeasurement method already resets the points
          // so we don't need to call resetMeasurement() again
        }
      }
    }

    // End the drag operation
    this._dragInProgress = false;

    // Prevent any click events following this mouseup from being processed
    // by setting a flag that will be checked in the handleMeasurementClick method
    this._preventNextClick = true;
    setTimeout(() => {
      this._preventNextClick = false;
    }, 100);

    this.changeDetectorRef.markForCheck();
  };

  /**
   * Helper to get the appropriate image element for measurement
   */
  private _getMeasurementImageElement(): HTMLElement {
    // Try the full container image first, but fallback to container image if full container is not visible
    let imageElement = this.ngxImageZoomEl?.nativeElement?.querySelector(".ngxImageZoomFullContainer img");

    // If the full container image has display:none or no dimensions, fallback to the container image
    if (imageElement) {
      const rect = imageElement.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        // Fallback to using container image
        imageElement = this.ngxImageZoomEl?.nativeElement?.querySelector(".ngxImageZoomContainer img");
      }
    } else {
      // Full container image not found, try container image
      imageElement = this.ngxImageZoomEl?.nativeElement?.querySelector(".ngxImageZoomContainer img");
    }

    return imageElement;
  }

  /**
   * Calculate the measurement distance and store it
   */
  private _calculateAndStoreMeasurement(): void {
    if (!this.measureStartPoint || !this.measureEndPoint) {
      return;
    }

    // Calculate angular distance if both points have RA/Dec
    if (
      this.measureStartPoint.ra !== null &&
      this.measureStartPoint.dec !== null &&
      this.measureEndPoint.ra !== null &&
      this.measureEndPoint.dec !== null
    ) {
      const angularDistance = this._calculateAngularDistance(
        this.measureStartPoint.ra,
        this.measureStartPoint.dec,
        this.measureEndPoint.ra,
        this.measureEndPoint.dec
      );
      
      // Format result in degrees, arcminutes, and arcseconds
      const degrees = Math.floor(angularDistance);
      const arcminutes = Math.floor((angularDistance - degrees) * 60);
      const arcseconds = Math.round(((angularDistance - degrees) * 60 - arcminutes) * 60);
      
      // Show only the celestial measurement
      this.measureDistance = `${degrees}° ${arcminutes}′ ${arcseconds}″`;
    } else {
      // If we can't calculate angular distance, show a pixel distance instead
      const pixelDistance = Math.sqrt(
        Math.pow(this.measureEndPoint.x - this.measureStartPoint.x, 2) +
        Math.pow(this.measureEndPoint.y - this.measureStartPoint.y, 2)
      ).toFixed(1);
      this.measureDistance = this.translateService.instant("{{0}} pixels", { 0: pixelDistance });
    }

    // Calculate optimal label positions using our shared function
    const labelPositions = this._calculateLabelPositions(
      this.measureStartPoint.x,
      this.measureStartPoint.y,
      this.measureEndPoint.x,
      this.measureEndPoint.y
    );
    
    // Extract the calculated positions
    const startLabelX = labelPositions.startLabelX;
    const startLabelY = labelPositions.startLabelY;
    const endLabelX = labelPositions.endLabelX;
    const endLabelY = labelPositions.endLabelY;

    // Push to measurements array
    this.previousMeasurements.push({
      startX: this.measureStartPoint.x,
      startY: this.measureStartPoint.y,
      endX: this.measureEndPoint.x,
      endY: this.measureEndPoint.y,
      midX: (this.measureStartPoint.x + this.measureEndPoint.x) / 2,
      midY: (this.measureStartPoint.y + this.measureEndPoint.y) / 2,
      distance: this.measureDistance,
      timestamp: Date.now(),
      startRa: this.measureStartPoint.ra,
      startDec: this.measureStartPoint.dec,
      endRa: this.measureEndPoint.ra,
      endDec: this.measureEndPoint.dec,
      startLabelX,
      startLabelY,
      endLabelX,
      endLabelY,
      // Transfer the current shape options to the saved measurement
      showCircle: this.showCurrentCircle,
      showRectangle: this.showCurrentRectangle
    });

    // Reset points to start a new measurement
    this.measureDistance = null;
    this.measureStartPoint = null;
    this.measureEndPoint = null;
    this.showCurrentCircle = false;
    this.showCurrentRectangle = false;

    this.changeDetectorRef.markForCheck();
  }

  /**
   * Check if the current zoom level is at the default (fit to window) level
   */
  private _isAtDefaultZoom(): boolean {
    if (!this.ngxImageZoom || !this.ngxImageZoom.zoomService) {
      // If zoom service is not available, we can't determine the default zoom
      return false;
    }

    // Get the minimum zoom ratio (fit to window)
    const minRatio = this.ngxImageZoom.zoomService.minZoomRatio;

    // Use a small threshold for floating point comparison with the minimum ratio
    return Math.abs(this.zoomScroll - minRatio) <= 0.01;
  }

  /**
   * Safely remove tooltips when we need to clear UI elements
   * This handles SSR by checking if we're in a browser environment
   */
  private _clearTooltips(): void {
    if (this.isBrowser) {
      document.querySelectorAll(".tooltip").forEach(tooltip => {
        tooltip.remove();
      });
    }
  }

  /**
   * Handler for the measuring mode-specific mousemove event
   * This updates the mouseX/mouseY positions for drawing the dashed line
   */
  private handleMeasuringMouseMove(event: MouseEvent): void {
    // Only update if in measuring mode
    if (this.isMeasuringMode) {
      // Always update the mouse position for visual feedback
      this.mouseX = event.clientX;
      this.mouseY = event.clientY;
      this.changeDetectorRef.markForCheck();
    }
  }

  /**
   * Direct handler for starting a point drag operation
   */
  protected handlePointDragStart(event: MouseEvent, pointType: 'start' | 'end'): void {
    event.preventDefault();
    event.stopPropagation();

    // Set the point being dragged
    this.isDraggingPoint = pointType;
    this._dragInProgress = true;

    // Store the original position for visual feedback
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;

    // Set up document-level handlers for the drag operation
    document.addEventListener('mousemove', this._onPointDragMove);
    document.addEventListener('mouseup', this._onPointDragEnd);

    // Prevent the click handler from firing
    this._preventNextClick = true;
  }

  /**
   * Handler for starting a drag operation on a previous measurement point
   * @param event Mouse event that triggered the drag
   * @param index Index of the measurement in the previousMeasurements array
   * @param pointType Which point to drag ('start' or 'end')
   */
  protected handlePreviousMeasurementDrag(event: MouseEvent, index: number, pointType: 'start' | 'end'): void {
    if (!this.isBrowser) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    // Set drag flag for proper UI update
    this.isDraggingPoint = 'prev' + pointType.charAt(0).toUpperCase() + pointType.slice(1) + '-' + index;
    this._dragInProgress = true;

    // Store starting coordinates for visual indicator
    this.dragStartX = pointType === 'start' ? this.previousMeasurements[index].startX : this.previousMeasurements[index].endX;
    this.dragStartY = pointType === 'start' ? this.previousMeasurements[index].startY : this.previousMeasurements[index].endY;

    // We don't need to store any parsed data - we'll calculate from ra/dec

    // Define and store the move handler for this specific drag operation
    this._onPreviousMeasurementDragMove = (moveEvent: MouseEvent) => {
      this._onPreviousMeasurementDragMove_impl(moveEvent, index, pointType);
    };

    // Define and store the end handler for this specific drag operation
    this._onPreviousMeasurementDragEnd = (upEvent: MouseEvent) => {
      this._onPreviousMeasurementDragEnd_impl(upEvent, index, pointType);
    };

    // Add the event handlers to the document
    document.addEventListener('mousemove', this._onPreviousMeasurementDragMove);
    document.addEventListener('mouseup', this._onPreviousMeasurementDragEnd);

    this.changeDetectorRef.markForCheck();
  }

  /**
   * Handler for when a previous measurement point is being dragged
   * @param event Mouse move event
   * @param index Index of the measurement
   * @param pointType Which point is being dragged ('start' or 'end')
   */
  private _onPreviousMeasurementDragMove_impl(event: MouseEvent, index: number, pointType: 'start' | 'end'): void {
    if (!this.isBrowser || index >= this.previousMeasurements.length) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const imageElement = this._getMeasurementImageElement();
    if (!imageElement) return;

    const imageRect = imageElement.getBoundingClientRect();

    // Only update if the mouse is over the image
    if (
      event.clientX >= imageRect.left &&
      event.clientX <= imageRect.right &&
      event.clientY >= imageRect.top &&
      event.clientY <= imageRect.bottom
    ) {
      // Update the point position based on mouse movement
      if (pointType === 'start') {
        this.previousMeasurements[index].startX = event.clientX;
        this.previousMeasurements[index].startY = event.clientY;

        // Update RA/Dec if we have the solution
        if (this.hasAdvancedSolution) {
          const coords = this._calculateCoordinatesAtPoint(event.clientX, event.clientY);
          if (coords) {
            this.previousMeasurements[index].startRa = coords.ra;
            this.previousMeasurements[index].startDec = coords.dec;
          }
        }
      } else {
        this.previousMeasurements[index].endX = event.clientX;
        this.previousMeasurements[index].endY = event.clientY;

        // Update RA/Dec if we have the solution
        if (this.hasAdvancedSolution) {
          const coords = this._calculateCoordinatesAtPoint(event.clientX, event.clientY);
          if (coords) {
            this.previousMeasurements[index].endRa = coords.ra;
            this.previousMeasurements[index].endDec = coords.dec;
          }
        }
      }

      // Recalculate the midpoint
      this.previousMeasurements[index].midX = (this.previousMeasurements[index].startX + this.previousMeasurements[index].endX) / 2;
      this.previousMeasurements[index].midY = (this.previousMeasurements[index].startY + this.previousMeasurements[index].endY) / 2;

      // Recalculate the measurement
      this._recalculatePreviousMeasurement(index);

      this.changeDetectorRef.markForCheck();
    }
  }

  /**
   * Handler for when a previous measurement point drag operation ends
   * @param event Mouse up event
   * @param index Index of the measurement
   * @param pointType Which point was being dragged ('start' or 'end')
   */
  private _onPreviousMeasurementDragEnd_impl(event: MouseEvent, index: number, pointType: 'start' | 'end'): void {
    if (!this.isBrowser || index >= this.previousMeasurements.length) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    // Perform final position update
    if (pointType === 'start') {
      this.previousMeasurements[index].startX = event.clientX;
      this.previousMeasurements[index].startY = event.clientY;

      // Final update to RA/Dec if we have the solution
      if (this.hasAdvancedSolution) {
        const coords = this._calculateCoordinatesAtPoint(event.clientX, event.clientY);
        if (coords) {
          this.previousMeasurements[index].startRa = coords.ra;
          this.previousMeasurements[index].startDec = coords.dec;
        }
      }
    } else {
      this.previousMeasurements[index].endX = event.clientX;
      this.previousMeasurements[index].endY = event.clientY;

      // Final update to RA/Dec if we have the solution
      if (this.hasAdvancedSolution) {
        const coords = this._calculateCoordinatesAtPoint(event.clientX, event.clientY);
        if (coords) {
          this.previousMeasurements[index].endRa = coords.ra;
          this.previousMeasurements[index].endDec = coords.dec;
        }
      }
    }

    // Final recalculation of midpoint
    this.previousMeasurements[index].midX = (this.previousMeasurements[index].startX + this.previousMeasurements[index].endX) / 2;
    this.previousMeasurements[index].midY = (this.previousMeasurements[index].startY + this.previousMeasurements[index].endY) / 2;

    // Final recalculation of the measurement
    this._recalculatePreviousMeasurement(index);

    // Reset dragging state
    this.isDraggingPoint = null;
    this._dragInProgress = false;
    this.dragStartX = null;
    this.dragStartY = null;

    // Clean up the event listeners
    document.removeEventListener('mousemove', this._onPreviousMeasurementDragMove);
    document.removeEventListener('mouseup', this._onPreviousMeasurementDragEnd);
    this._onPreviousMeasurementDragMove = null;
    this._onPreviousMeasurementDragEnd = null;

    this.changeDetectorRef.markForCheck();
  }

  // Event handlers for dragging existing measurement points
  private _onPointDragMove = (event: MouseEvent) => {
    if (!this._dragInProgress || !this.isDraggingPoint) return;

    const imageElement = this._getMeasurementImageElement();
    if (!imageElement) return;

    const imageRect = imageElement.getBoundingClientRect();

    // Only update if the mouse is over the image
    if (
      event.clientX >= imageRect.left &&
      event.clientX <= imageRect.right &&
      event.clientY >= imageRect.top &&
      event.clientY <= imageRect.bottom
    ) {
      // Update the position of the point being dragged
      const newPosition = {
        x: event.clientX,
        y: event.clientY
      };

      // Get new RA/Dec coordinates if available
      let ra = null, dec = null;

      if (this.revision?.solution) {
        const coords = this._calculateCoordinatesAtPoint(event.clientX, event.clientY);
        if (coords) {
          ra = coords.ra;
          dec = coords.dec;
        }
      }

      // Update the appropriate point
      if (this.isDraggingPoint === 'start') {
        this.measureStartPoint = {
          ...this.measureStartPoint,
          x: newPosition.x,
          y: newPosition.y,
          ra,
          dec
        };
      } else if (this.isDraggingPoint === 'end') {
        this.measureEndPoint = {
          ...this.measureEndPoint,
          x: newPosition.x,
          y: newPosition.y,
          ra,
          dec
        };
      }

      // Update the measurement distance display
      if (this.measureStartPoint && this.measureEndPoint) {
        // Calculate angular distance if both points have RA/Dec
        if (
          this.measureStartPoint.ra !== null &&
          this.measureStartPoint.dec !== null &&
          this.measureEndPoint.ra !== null &&
          this.measureEndPoint.dec !== null
        ) {
          const angularDistance = this._calculateAngularDistance(
            this.measureStartPoint.ra,
            this.measureStartPoint.dec,
            this.measureEndPoint.ra,
            this.measureEndPoint.dec
          );
          
          // Format result in degrees, arcminutes, and arcseconds
          const degrees = Math.floor(angularDistance);
          const arcminutes = Math.floor((angularDistance - degrees) * 60);
          const arcseconds = Math.round(((angularDistance - degrees) * 60 - arcminutes) * 60);
          
          // Show only the celestial measurement
          this.measureDistance = `${degrees}° ${arcminutes}′ ${arcseconds}″`;
        } else {
          // If we can't calculate angular distance, show a pixel distance instead
          const pixelDistance = Math.sqrt(
            Math.pow(this.measureEndPoint.x - this.measureStartPoint.x, 2) +
            Math.pow(this.measureEndPoint.y - this.measureStartPoint.y, 2)
          ).toFixed(1);
          this.measureDistance = this.translateService.instant("{{0}} pixels", { 0: pixelDistance });
        }
      }

      this.changeDetectorRef.markForCheck();
    }
  };

  private _onPointDragEnd = (event: MouseEvent) => {
    if (!this._dragInProgress || !this.isDraggingPoint) return;

    // Clean up event listeners
    document.removeEventListener('mousemove', this._onPointDragMove);
    document.removeEventListener('mouseup', this._onPointDragEnd);

    // Reset drag state
    this._dragInProgress = false;
    this.isDraggingPoint = null;

    // Prevent any click events following this mouseup from being processed
    this._preventNextClick = true;
    setTimeout(() => {
      this._preventNextClick = false;
    }, 100);

    this.changeDetectorRef.markForCheck();
  };

  /**
   * Calculate the coordinates at the current mouse position
   */
  private _calculateMouseCoordinates(event: MouseEvent): void {
    // Don't calculate coordinates when using lens mode
    if (this.enableLens && this.ngxImageZoom?.zoomService?.zoomingEnabled) {
      this.mouseRa = null;
      this.mouseDec = null;
      this.mouseGalacticRa = null;
      this.mouseGalacticDec = null;
      return;
    }

    // Don't attempt calculation if matrix is still loading
    if (this.loadingAdvancedSolutionMatrix) {
      return;
    }

    // If we have the advanced solution matrix, use it for accurate coordinate calculation
    if (this.advancedSolutionMatrix && this.advancedSolutionMatrix.raMatrix) {
      try {
        // Try the full container image first, but fallback to container image if full container is not visible
        let imageElement = this.ngxImageZoomEl?.nativeElement?.querySelector(".ngxImageZoomFullContainer img");

        // If the full container image has display:none or no dimensions, fallback to the container image
        if (imageElement) {
          const rect = imageElement.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) {
            // Fallback to using container image
            imageElement = this.ngxImageZoomEl?.nativeElement?.querySelector(".ngxImageZoomContainer img");
          }
        } else {
          // Full container image not found, try container image
          imageElement = this.ngxImageZoomEl?.nativeElement?.querySelector(".ngxImageZoomContainer img");
        }

        if (!imageElement) {
          return;
        }

        // Use the shared service to calculate and format the coordinates
        const result = this.coordinatesFormatter.calculateMouseCoordinates(
          event,
          imageElement,
          this.advancedSolutionMatrix,
          {
            useClientCoords: true,
            naturalWidth: this._canvasImage?.naturalWidth || this.naturalWidth || this.revision.w
          }
        );

        if (!result) {
          this.mouseRa = null;
          this.mouseDec = null;
          this.mouseGalacticRa = null;
          this.mouseGalacticDec = null;
          return;
        }

        // Set the formatted coordinates
        this.mouseRa = result.coordinates.raHtml;
        this.mouseDec = result.coordinates.decHtml;
        this.mouseGalacticRa = result.coordinates.galacticRaHtml;
        this.mouseGalacticDec = result.coordinates.galacticDecHtml;

        this.changeDetectorRef.markForCheck();
      } catch (error) {
        this.mouseRa = null;
        this.mouseDec = null;
        this.mouseGalacticRa = null;
        this.mouseGalacticDec = null;
      }
    }
  }

  private _calculateCoordinatesAtPoint(x: number, y: number): { ra: number; dec: number } | null {
    try {
      // Similar coordinate calculation as in _calculateMouseCoordinates but returns raw values
      // Try the full container image first, but fallback to container image if full container is not visible
      let imageElement = this.ngxImageZoomEl?.nativeElement?.querySelector(".ngxImageZoomFullContainer img");

      // If the full container image has display:none or no dimensions, fallback to the container image
      if (imageElement) {
        const rect = imageElement.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          // Fallback to using container image
          imageElement = this.ngxImageZoomEl?.nativeElement?.querySelector(".ngxImageZoomContainer img");
        }
      } else {
        // Full container image not found, try container image
        imageElement = this.ngxImageZoomEl?.nativeElement?.querySelector(".ngxImageZoomContainer img");
      }

      if (!imageElement || !this.advancedSolutionMatrix) {
        return null;
      }

      // Create a synthetic mouse event with the coordinates
      const syntheticEvent = {
        clientX: x,
        clientY: y,
        offsetX: 0,  // Not used with useClientCoords: true
        offsetY: 0   // Not used with useClientCoords: true
      } as MouseEvent;

      // Use the coordinatesFormatter to calculate coordinates
      const result = this.coordinatesFormatter.calculateMouseCoordinates(
        syntheticEvent,
        imageElement,
        this.advancedSolutionMatrix,
        {
          useClientCoords: true,
          naturalWidth: this._canvasImage?.naturalWidth || this.naturalWidth || this.revision.w
        }
      );

      if (!result) {
        return null;
      }

      // Calculate image pixel coordinates
      const imageRect = imageElement.getBoundingClientRect();
      const relativeX = (x - imageRect.left);
      const relativeY = (y - imageRect.top);

      // Scale to HD space (1824px width reference)
      const HD_WIDTH = 1824;
      const scaledX = relativeX / imageRect.width * HD_WIDTH;
      const scaledY = relativeY / imageRect.width * HD_WIDTH;

      // Parse matrix data
      const raMatrix = this.advancedSolutionMatrix.raMatrix.split(",").map(Number);
      const decMatrix = this.advancedSolutionMatrix.decMatrix.split(",").map(Number);
      const rect = this.advancedSolutionMatrix.matrixRect.split(",").map(Number);
      const delta = this.advancedSolutionMatrix.matrixDelta;

      // @ts-ignore - CoordinateInterpolation is defined globally in assets/js/CoordinateInterpolation.js
      const interpolation = new CoordinateInterpolation(
        raMatrix,
        decMatrix,
        rect[0],
        rect[1],
        rect[2],
        rect[3],
        delta
      );

      // Get raw coordinates using interpolation
      const rawCoords = interpolation.interpolate(scaledX, scaledY);
      if (rawCoords && rawCoords.alpha !== undefined && rawCoords.delta !== undefined) {
        return {
          ra: rawCoords.alpha,
          dec: rawCoords.delta
        };
      }
    } catch (error) {
      console.error("Error calculating coordinates for measurement:", error);
    }

    return null;
  }

  private _calculateAngularDistance(ra1: number, dec1: number, ra2: number, dec2: number): number {
    // Convert degrees to radians
    const toRadians = (deg) => deg * Math.PI / 180;

    // RA/Dec are in degrees
    const ra1Rad = toRadians(ra1);
    const dec1Rad = toRadians(dec1);
    const ra2Rad = toRadians(ra2);
    const dec2Rad = toRadians(dec2);

    // Calculate angular distance using Haversine formula
    // cos(angular_distance) = sin(dec1) * sin(dec2) + cos(dec1) * cos(dec2) * cos(ra1 - ra2)
    const cosAngDist = Math.sin(dec1Rad) * Math.sin(dec2Rad) +
      Math.cos(dec1Rad) * Math.cos(dec2Rad) * Math.cos(ra1Rad - ra2Rad);

    // Clamp value to handle floating point errors
    const clampedCosAngDist = Math.max(-1, Math.min(1, cosAngDist));

    // Calculate angular distance in radians and convert to degrees
    const angDistDeg = Math.acos(clampedCosAngDist) * 180 / Math.PI;

    // Return the angular distance in degrees
    return angDistDeg;
  }

  // Replace both mousemove and wheel handlers to completely freeze the zoom
  private _deregisterZoomEvents(): void {
    if (!this.ngxImageZoom || !(this.ngxImageZoom as any).zoomInstance) {
      return;
    }

    // Store the original handlers
    this._originalOnMouseMove = (this.ngxImageZoom as any).zoomInstance.onMouseMove;
    this._originalOnMouseWheel = (this.ngxImageZoom as any).zoomInstance.onMouseWheel;

    // Replace with empty handler - this freezes the zoom position
    (this.ngxImageZoom as any).zoomInstance.onMouseMove = (event: MouseEvent) => {
      // Do nothing - freezes the zoom position
    };

    // Block wheel events to prevent zooming while frozen
    (this.ngxImageZoom as any).zoomInstance.onMouseWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      return false;
    };
  }

  // Helper method to restore all original event handlers
  private _restoreOriginalEventHandlers(): void {
    if (!this.ngxImageZoom || !(this.ngxImageZoom as any).zoomInstance) {
      return;
    }

    // Restore the original mouse move handler
    if (this._originalOnMouseMove) {
      (this.ngxImageZoom as any).zoomInstance.onMouseMove = this._originalOnMouseMove;
      this._originalOnMouseMove = null;
    }

    // Restore the original wheel handler
    if (this._originalOnMouseWheel) {
      (this.ngxImageZoom as any).zoomInstance.onMouseWheel = this._originalOnMouseWheel;
      this._originalOnMouseWheel = null;
    }
  }

  // Restore original event handlers
  private _registerZoomEvents(): void {
    this._restoreOriginalEventHandlers();
  }

  /**
   * Handle Firefox pinch-to-zoom gestures by updating magnification
   * @param event WheelEvent with ctrlKey for Firefox pinch gestures
   * @param syntheticEvent Optional synthetic event with proper coordinates
   */
  /**
   * Ensures that a solution matrix is loaded, with proper state tracking
   * This prevents race conditions between multiple components trying to load the same matrix
   */
  private _ensureSolutionMatrixLoaded(solutionId: number): void {
    // Check if matrix is already loaded in component with valid properties
    if (this.advancedSolutionMatrix &&
      this.advancedSolutionMatrix.raMatrix &&
      this.advancedSolutionMatrix.decMatrix &&
      this.advancedSolutionMatrix.matrixRect &&
      this.advancedSolutionMatrix.matrixDelta !== undefined) {
      return;
    }

    // Mark as loading to prevent duplicate requests
    this.loadingAdvancedSolutionMatrix = true;

    // First check if matrix is in the store
    this.store$.pipe(
      select(selectSolutionMatrix, solutionId),
      take(1),
      switchMap(matrixFromStore => {
        if (matrixFromStore) {
          // If matrix is already in store, use it
          this.advancedSolutionMatrix = matrixFromStore;
          this.loadingAdvancedSolutionMatrix = false;
          return of(matrixFromStore);
        } else {
          // Otherwise, check if it's currently being loaded by another component
          return this.store$.pipe(
            select(selectIsSolutionMatrixLoading, solutionId),
            take(1),
            switchMap(isLoading => {
              if (isLoading) {
                // If already loading, wait for it to complete
                return this.store$.pipe(
                  select(selectSolutionMatrix, solutionId),
                  filter(matrix => !!matrix), // Wait until matrix is available
                  take(1)
                );
              } else {
                // If not loading, dispatch action to load it
                this.store$.dispatch(new LoadSolutionMatrix({ solutionId }));

                // Then wait for it to complete
                return this.store$.pipe(
                  select(selectSolutionMatrix, solutionId),
                  filter(matrix => !!matrix), // Wait until matrix is available
                  take(1)
                );
              }
            })
          );
        }
      })
    ).subscribe(matrix => {
      // Update component state with the matrix
      this.advancedSolutionMatrix = matrix;
      this.loadingAdvancedSolutionMatrix = false;
      this.changeDetectorRef.markForCheck();
    });
  }

  private _handleFirefoxPinchZoom(event: WheelEvent, syntheticEvent?: WheelEvent): void {
    // Always prevent browser zoom when using ctrl+wheel (Firefox pinch gesture)
    event.preventDefault();
    event.stopPropagation();

    // Only handle zoom operations if not frozen and zoom component exists
    if (this.zoomFrozen || !this.ngxImageZoom?.zoomService) {
      return;
    }

    // Get current magnification settings
    const mag = this.ngxImageZoom.zoomService.magnification;
    const minRatio = this.ngxImageZoom.zoomService.minZoomRatio || 1;
    const maxRatio = this.ngxImageZoom.zoomService.maxZoomRatio || 2;

    // Get the actual deltas which will now work directly with pinch gestures
    const deltaY = event.deltaY;

    // Calculate zoom step - normalize Firefox touchpad pinch deltas
    // Firefox produces larger deltaY values with trackpad pinch gestures
    const step = 0.05 * (Math.abs(deltaY) / 20);

    // Calculate new magnification with correct direction
    // In Firefox, positive deltaY = pinch in (should zoom out)
    // negative deltaY = pinch out (should zoom in)
    let newMag = mag;
    if (deltaY > 0) { // Pinch in - zoom out
      newMag = Math.max(mag - step, minRatio);
    } else if (deltaY < 0) { // Pinch out - zoom in
      newMag = Math.min(mag + step, maxRatio);
    }

    // Only update if magnification changed
    if (newMag !== mag) {
      this.ngxImageZoom.zoomService.magnification = newMag;

      // If not already zooming, activate zoom
      if (!this.ngxImageZoom.zoomService.zoomingEnabled) {
        this.ngxImageZoom.zoomService.zoomOn(syntheticEvent || event);
      }

      // Update calculations
      this.ngxImageZoom.zoomService.calculateRatio();
      this.ngxImageZoom.zoomService.calculateZoomPosition(syntheticEvent || event);

      // Update zoom indicator
      this.setZoomScroll(newMag);
      this.changeDetectorRef.markForCheck();
    }
  }

  /**
   * Create a synthetic wheel event with coordinates converted to be relative to container
   */
  private _createSyntheticWheelEvent(originalEvent: WheelEvent, containerRect: DOMRect): WheelEvent {
    // Create a new synthetic event with relevant properties
    const syntheticEvent = new WheelEvent("wheel", {
      deltaY: originalEvent.deltaY,
      deltaX: originalEvent.deltaX,
      deltaZ: originalEvent.deltaZ,
      deltaMode: originalEvent.deltaMode,
      ctrlKey: originalEvent.ctrlKey,
      clientX: originalEvent.clientX,
      clientY: originalEvent.clientY,
      screenX: originalEvent.screenX,
      screenY: originalEvent.screenY
    });

    // Add offsetX/Y properties to make it compatible with ngx-image-zoom
    (syntheticEvent as any).offsetX = originalEvent.clientX - containerRect.left;
    (syntheticEvent as any).offsetY = originalEvent.clientY - containerRect.top;

    return syntheticEvent;
  }

  private _initImageZoom(skipZoomReset: boolean = false) {
    if (this.ngxImageZoom) {
      const renderedThumbnailHeight = this.ngxImageZoomEl.nativeElement.querySelector(".ngxImageZoomThumbnail").height;
      const thumbnailNaturalHeight = this.ngxImageZoomEl.nativeElement.querySelector(".ngxImageZoomThumbnail").naturalHeight;
      const renderRatio = renderedThumbnailHeight / thumbnailNaturalHeight;
      const renderedThumbnailWidth = this.ngxImageZoomEl.nativeElement.querySelector(".ngxImageZoomThumbnail").naturalWidth * renderRatio;

      this.ngxImageZoom.zoomService.thumbWidth = renderedThumbnailWidth;
      this.ngxImageZoom.zoomService.thumbHeight = renderedThumbnailHeight;
      this.ngxImageZoom.zoomService.minZoomRatio = renderedThumbnailWidth / this.naturalWidth;

      // Only reset the magnification and zoom scroll if not explicitly skipping this step
      // This helps when restoring from measuring mode where we want to maintain the previous zoom level
      if (!skipZoomReset) {
        // Get the minimum zoom ratio (fit to window)
        const minRatio = this.ngxImageZoom.zoomService.minZoomRatio;

        // Set magnification to the minimum ratio (fit to window) instead of 1
        this.ngxImageZoom.zoomService.magnification = minRatio;
        this.setZoomScroll(minRatio);
      }

      // Handle touchpad pinch gestures in Firefox
      // Convert them to zoom operations similar to Chrome
      if (isPlatformBrowser(this.platformId)) {
        // Add a direct wheel event listener that will handle pinch gestures
        // This approach should work better for Firefox touchpad gestures
        const container = this.ngxImageZoomEl.nativeElement;

        // Using a more focused wheel handler specifically for Firefox
        container.addEventListener("wheel", (event: WheelEvent) => {
          if (event.ctrlKey) {
            this._handleFirefoxPinchZoom(event);
          }
        }, { passive: false });

        // Handle Firefox touchpad pinch gesture globally
        // This is needed because the Firefox pinch gesture doesn't always bubble up
        // to the container element properly
        document.addEventListener("wheel", (event: WheelEvent) => {
          if (event.ctrlKey && !this.touchMode && this.show && !this.isVeryLargeImage && !this.zoomFrozen) {
            // Always prevent browser zoom
            event.preventDefault();
            event.stopPropagation();

            // Only handle if zoom component exists
            if (this.ngxImageZoom && this.ngxImageZoom.zoomService) {
              // Convert global coordinates to container-relative coordinates
              // First, get the container's position
              const zoomContainer = this.ngxImageZoomEl.nativeElement.querySelector(".ngxImageZoomContainer");
              if (!zoomContainer) {
                return;
              }

              const rect = zoomContainer.getBoundingClientRect();

              // Check if event is within container bounds
              if (
                event.clientX >= rect.left &&
                event.clientX <= rect.right &&
                event.clientY >= rect.top &&
                event.clientY <= rect.bottom
              ) {
                // Create a synthetic event with coordinates relative to the container
                const syntheticEvent = this._createSyntheticWheelEvent(event, rect);

                // Handle the pinch zoom using the synthetic event
                this._handleFirefoxPinchZoom(event, syntheticEvent);
              }
            }
          }
        }, { passive: false });
      }

      this.ngxImageZoomEl.nativeElement.querySelector(".ngxImageZoomThumbnail").addEventListener("wheel", (event: WheelEvent) => {
        // Always prevent browser zoom with ctrl key
        if (event.ctrlKey) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }

        if (this.ngxImageZoom.zoomService.zoomingEnabled) {
          return;
        }

        event.preventDefault();

        this.ngxImageZoom.zoomService.magnification = this.ngxImageZoom.zoomService.minZoomRatio;
        this.ngxImageZoom.zoomService.zoomOn(event);
        // Clear specific "Activate zoom first" notification if it exists
        if (this._zoomActivationNotification) {
          // Extract toast ID - ActiveToast has a toastId property of type number
          if (typeof this._zoomActivationNotification !== "string" && this._zoomActivationNotification.toastId) {
            this.popNotificationsService.clear(this._zoomActivationNotification.toastId);
          }
          this._zoomActivationNotification = null;
        }
        this.changeDetectorRef.markForCheck();
      }, { once: true });

      // Prevents the jarring resetting of the zoom when the mouse wanders off the image.
      (this.ngxImageZoom as any).zoomInstance.onMouseLeave = () => {
      };

      (this.ngxImageZoom as any).zoomInstance.onClick = (event: MouseEvent) => {
        if (this.enableLens) {
          if (this.zoomingEnabled) {
            this.ngxImageZoom.zoomService.zoomOff();
          } else {
            this.ngxImageZoom.zoomService.zoomOn(event);
            // Clear specific "Activate zoom first" notification if it exists
            if (this._zoomActivationNotification) {
              // Extract toast ID - ActiveToast has a toastId property of type number
              if (typeof this._zoomActivationNotification !== "string" && this._zoomActivationNotification.toastId) {
                this.popNotificationsService.clear(this._zoomActivationNotification.toastId);
              }
              this._zoomActivationNotification = null;
            }
          }
        } else {
          if (this.zoomingEnabled) {
            this.hide(null);
          } else {
            this.ngxImageZoom.zoomService.zoomOn(event);
            // Clear specific "Activate zoom first" notification if it exists
            if (this._zoomActivationNotification) {
              // Extract toast ID - ActiveToast has a toastId property of type number
              if (typeof this._zoomActivationNotification !== "string" && this._zoomActivationNotification.toastId) {
                this.popNotificationsService.clear(this._zoomActivationNotification.toastId);
              }
              this._zoomActivationNotification = null;
            }
          }
        }
      };

      this.changeDetectorRef.markForCheck();
    } else {
      this.utilsService.delay(50).subscribe(() => {
        this._initImageZoom();
      });
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
        this.image = image;
        this.revision = this.imageService.getRevision(image, this.revisionLabel);
        this.naturalWidth = this.revision.w;
        this.naturalHeight = this.revision.h;
        this.maxZoom = image.maxZoom || image.defaultMaxZoom || 8;

        // Load solution matrix for coordinate calculation
        if (this.revision?.solution?.id) {
          // If matrix was passed from parent component, use it directly
          if (this.externalSolutionMatrix) {
            this.advancedSolutionMatrix = this.externalSolutionMatrix;
            this.loadingAdvancedSolutionMatrix = false;
            this.changeDetectorRef.markForCheck();
          } else {
            // Use same pattern as in ImageViewerComponent
            this._ensureSolutionMatrixLoaded(this.revision.solution.id);
          }
        }

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
      // Check if the image is a GIF
      this.isGif = this.revision.imageFile && this.revision.imageFile.toLowerCase().endsWith(".gif");

      // For GIFs, always use non-touch mode
      if (this.isGif && this.touchMode) {
        this.setTouchMouseMode(false);
      }

      if (this.isGif) {
        // For GIFs, use the original file directly for both HD and REAL thumbnails
        this.hdThumbnailLoading = true;
        this.realThumbnailLoading = true;

        this._hdLoadingProgressSubject.next(0);
        this._realLoadingProgressSubject.next(0);

        this.imageService.loadImageFile(this.revision.imageFile, (progress: number) => {
          this._hdLoadingProgressSubject.next(progress);
          this._realLoadingProgressSubject.next(progress);
        }).pipe(
          switchMap(url =>
            this._preloadImage(url).pipe(
              map(() => this.domSanitizer.bypassSecurityTrustUrl(url))
            )
          )
        ).subscribe(url => {
          this.hdThumbnail = url;
          this.realThumbnail = url;
          this.realThumbnailUnsafeUrl = this.revision.imageFile;

          this.hdThumbnailLoading = false;
          this.realThumbnailLoading = false;

          if (this.touchMode && !this.isGif) {
            this._initCanvas();
          }

          this.changeDetectorRef.markForCheck();
        });
      } else {
        // Normal image handling for non-GIFs
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
                  tap(() => this.store$.dispatch(new LoadThumbnail({
                    data: this._getRealOptions(),
                    bustCache: false
                  }))),
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
          this.realThumbnailLoading = false;

          if (this.touchMode && !this.isGif) {
            this._initCanvas();
          }

          this.changeDetectorRef.markForCheck();
        });

        subscriptions.add(this._hdThumbnailSubscription);
        subscriptions.add(this._realThumbnailSubscription);

        this.store$.dispatch(new LoadThumbnail({ data: this._getHdOptions(), bustCache: false }));
      }
    });

    subscriptions.add(this._imageSubscription);

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

  private _resetCanvas() {
    this._lastTransform = null;
    if (this._imageBitmap) {
      this._imageBitmap.close();
      this._imageBitmap = null;
    }

    if (this._downsampledBitmapLow) {
      this._downsampledBitmapLow.close();
      this._downsampledBitmapLow = null;
    }

    if (this._downsampledBitmapMedium) {
      this._downsampledBitmapMedium.close();
      this._downsampledBitmapMedium = null;
    }

    this._canvasContext = null;
    this._canvasImage = null;
    this._firstRenderSubject.next(false);
    this.canvasLoading = false;
    this._canvasContainerDimensions = null;
    this._canvasImageDimensions = null;
  }

  /**
   * Creates both low and medium resolution downsampled bitmaps
   * Returns a promise that resolves when both bitmaps are created
   */
  private _createDownsampledBitmaps(): Promise<[ImageBitmap, ImageBitmap]> {
    if (!this._canvasImage || !this._canvasContainerDimensions) {
      return Promise.resolve([null, null]);
    }

    const originalWidth = this._canvasImage.width;
    const originalHeight = this._canvasImage.height;

    // Create a low-resolution bitmap (2x display size)
    // This is used for the initial view with minimal memory usage
    const lowResWidth = Math.min(this._canvasContainerDimensions.width * 2, originalWidth);
    const lowResHeight = Math.round(originalHeight * (lowResWidth / originalWidth));

    // Create a medium-resolution bitmap (6x display size or half original, whichever is smaller)
    // This is used for intermediate zoom levels
    const medResWidth = Math.min(this._canvasContainerDimensions.width * 6, originalWidth);
    const medResHeight = Math.round(originalHeight * (medResWidth / originalWidth));

    // Create both downsampled bitmaps
    const lowBitmapPromise = this._createSingleDownsampledBitmap(lowResWidth, lowResHeight);
    const medBitmapPromise = this._createSingleDownsampledBitmap(medResWidth, medResHeight);

    // Return both promises together
    return Promise.all([lowBitmapPromise, medBitmapPromise]);
  }

  /**
   * Helper method to create a single downsampled bitmap at a specific resolution
   */
  private _createSingleDownsampledBitmap(width: number, height: number): Promise<ImageBitmap> {
    // Create an offscreen canvas for downsampling
    const offscreenCanvas = new OffscreenCanvas(width, height);
    const offscreenCtx = offscreenCanvas.getContext("2d") as OffscreenCanvasRenderingContext2D;

    // Apply smoothing settings for better downsampling
    offscreenCtx.imageSmoothingEnabled = true;
    offscreenCtx.imageSmoothingQuality = "high";

    // Draw the image at the target size
    offscreenCtx.drawImage(this._canvasImage, 0, 0, width, height);

    // Return a bitmap from this intermediate canvas
    return createImageBitmap(offscreenCanvas, {
      resizeQuality: "high",
      premultiplyAlpha: "premultiply"
    });
  }

  private _initCanvas() {
    if (!this.touchRealCanvas) {
      this.utilsService.delay(10).subscribe(() => {
        this._initCanvas();
        this.changeDetectorRef.markForCheck();
      });
      return;
    }

    if (this.canvasLoading) {
      return;
    }

    this.canvasLoading = true;
    this._canvasImage = new Image();
    this._canvasImage.decoding = "async";

    this._canvasImage.onload = () => {
      try {
        // Create both full resolution and downsampled bitmaps
        const fullResBitmapPromise = createImageBitmap(this._canvasImage, {
          resizeQuality: "high",
          premultiplyAlpha: "premultiply"
        });

        const canvas = this.touchRealCanvas.nativeElement;
        this._canvasContext = canvas.getContext("2d", {
          alpha: false,
          willReadFrequently: false
        });

        this._updateCanvasDimensions();

        // First ensure we have the full resolution bitmap
        fullResBitmapPromise.then(fullBitmap => {
          this._imageBitmap = fullBitmap;

          // Now try to create the downsampled bitmaps, but handle failure gracefully
          this._createDownsampledBitmaps()
            .then(([lowResBitmap, medResBitmap]) => {
              this._downsampledBitmapLow = lowResBitmap;
              this._downsampledBitmapMedium = medResBitmap;
            })
            .catch(error => {
              // Log the error but continue with only the full resolution bitmap
              console.warn("Failed to create downsampled bitmaps, using full resolution only:", error);
            })
            .finally(() => {
              // Draw the canvas regardless of whether downsampling succeeded
              this._drawCanvas();

              this.firstRender$.pipe(take(1)).subscribe(() => {
                this.canvasLoading = false;
                this._realLoadingProgressSubject.next(100);
                this.changeDetectorRef.markForCheck();
              });

              this.changeDetectorRef.markForCheck();
            });
        })
          .catch(error => {
            console.error("Failed to create any bitmap:", error);
            this.canvasLoading = false;
            this._realLoadingProgressSubject.next(100);
          });
      } catch (error) {
        console.error("Failed to initialize canvas:", error);
      }
    };

    this._canvasImage.src = this.realThumbnailUnsafeUrl;
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
    // Ensure we have a canvas context and at least one valid bitmap
    if (!this._canvasContext) {
      return;
    }

    // If we don't have any bitmap available, there's nothing to draw
    if (!this._imageBitmap && !this._downsampledBitmapLow && !this._downsampledBitmapMedium) {
      return;
    }

    const ctx = this._canvasContext;
    const { width, height, centerX, centerY } = this._canvasContainerDimensions;
    const { width: drawWidth, height: drawHeight } = this._canvasImageDimensions;

    // Cache transform matrix
    const transform = `${this.touchScale},${centerX + this._touchScaleOffset.x * this.touchScale},${centerY + this._touchScaleOffset.y * this.touchScale}`;

    if (this._lastTransform === transform) {
      return;
    }
    this._lastTransform = transform;

    // Apply image smoothing settings for better quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // When zoomed in beyond 1:1 pixel mapping, disable smoothing for crisp pixels
    if (this.touchScale > 1 && this.touchScale > this.naturalWidth / this._canvasImageDimensions.width) {
      ctx.imageSmoothingEnabled = false;
    }

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

    // Calculate the current display pixels needed based on zoom
    // This represents how many actual source pixels we need to display without quality loss
    const displayWidth = drawWidth * this.touchScale;

    // Select the appropriate bitmap based on which resolution is most efficient for current zoom
    let bitmapToUse: ImageBitmap;

    // Helper function to avoid choosing a bitmap that would need to be stretched beyond 100%
    const isBitmapSufficientForDisplay = (bitmap: ImageBitmap): boolean => {
      if (!bitmap) {
        return false;
      }
      // Return true if the bitmap has enough resolution for the current display size
      return bitmap.width >= displayWidth * 1.1; // Buffer for quality
    };

    // First try low-res bitmap if it has enough resolution
    if (this._downsampledBitmapLow && isBitmapSufficientForDisplay(this._downsampledBitmapLow)) {
      bitmapToUse = this._downsampledBitmapLow;
    }
    // Then try medium-res bitmap if it has enough resolution
    else if (this._downsampledBitmapMedium && isBitmapSufficientForDisplay(this._downsampledBitmapMedium)) {
      bitmapToUse = this._downsampledBitmapMedium;
    }
    // Finally use full-res bitmap
    else if (this._imageBitmap) {
      bitmapToUse = this._imageBitmap;
    }

    // Fallback chain if the preferred bitmap is not available
    if (!bitmapToUse) {
      bitmapToUse = this._imageBitmap || this._downsampledBitmapMedium || this._downsampledBitmapLow;
    }

    // Only draw if we have a valid bitmap to use
    if (bitmapToUse) {
      ctx.drawImage(bitmapToUse, -drawWidth * .5, -drawHeight * .5, drawWidth, drawHeight);
    }

    if (!this._firstRenderSubject.value) {
      this._firstRenderSubject.next(true);
    }
  }

  private _setZoomLensSize(): void {
    this.zoomLensSize = Math.floor(this.windowRef.nativeWindow.innerWidth / 4);
    if (this.ngxImageZoom) {
      this.ngxImageZoom.zoomService.lensWidth = this.zoomLensSize;
      this.ngxImageZoom.zoomService.lensHeight = this.zoomLensSize;
    }
  }

  private _setZoomIndicatorTimeout(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this._zoomIndicatorTimeout) {
        clearTimeout(this._zoomIndicatorTimeout);
      }

      this._zoomIndicatorTimeout = this.windowRef.nativeWindow.setTimeout(() => {
        this.showZoomIndicator = false;
        this.changeDetectorRef.markForCheck();
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

  /**
   * Safely check if an event is a touch event without directly using instanceof TouchEvent
   * This handles browsers where TouchEvent might not be defined
   */
  private _isTouchEvent(event: any): boolean {
    if (!event) {
      return false;
    }

    // Check for touch event properties instead of using instanceof
    return (
      typeof event.touches !== "undefined" ||
      typeof event.changedTouches !== "undefined" ||
      (event.type && event.type.startsWith("touch"))
    );
  }

  // Removed duplicate implementation. Use the one defined at line ~2111

  // Helper method to update label positions without recalculating distance
  private _updateMeasurementLabelPositions(measurement): void {
    if (!measurement) return;

    // Update midpoint
    measurement.midX = (measurement.startX + measurement.endX) / 2;
    measurement.midY = (measurement.startY + measurement.endY) / 2;

    // Use the shared function to calculate optimal label positions
    const labelPositions = this._calculateLabelPositions(
      measurement.startX,
      measurement.startY,
      measurement.endX,
      measurement.endY
    );
    
    // Update the label positions
    measurement.startLabelX = labelPositions.startLabelX;
    measurement.startLabelY = labelPositions.startLabelY;
    measurement.endLabelX = labelPositions.endLabelX;
    measurement.endLabelY = labelPositions.endLabelY;
  }

  // Removed duplicate implementation

  /**
   * Recalculates the distance and position for a previous measurement
   * Uses same logic as our drag handlers for consistency
   */
  // Calculate the optimal label positions for measurement points
  private _calculateLabelPositions(
    startX: number, 
    startY: number, 
    endX: number, 
    endY: number
  ): { startLabelX: number, startLabelY: number, endLabelX: number, endLabelY: number } {
    const labelWidth = 120;
    const labelHeight = 25;
    const pointRadius = 6;
    const labelDistance = 24;
    
    // Calculate angle of the line
    const dx = endX - startX;
    const dy = endY - startY;
    const angleRad = Math.atan2(dy, dx);
    
    // Check if the line is nearly horizontal or vertical
    const isNearHorizontal = Math.abs(angleRad) < Math.PI / 12 || Math.abs(Math.abs(angleRad) - Math.PI) < Math.PI / 12;
    const isNearVertical = Math.abs(Math.abs(angleRad) - Math.PI / 2) < Math.PI / 12;
    
    // Calculate extended positions for labels with extra distance for near-horizontal lines
    const extraDistance = isNearHorizontal ? labelDistance * 2 : 0;
    
    // Start label - opposite direction of the line
    const startExtX = startX - (labelDistance + pointRadius + extraDistance) * Math.cos(angleRad);
    const startExtY = startY - (labelDistance + pointRadius + extraDistance) * Math.sin(angleRad);
    
    // End label - along the direction of the line
    const endExtX = endX + (labelDistance + pointRadius + extraDistance) * Math.cos(angleRad);
    const endExtY = endY + (labelDistance + pointRadius + extraDistance) * Math.sin(angleRad);
    
    // Calculate final label positions
    let startLabelX, endLabelX;
    
    if (isNearVertical) {
      // For near-vertical lines, center align both labels
      startLabelX = startExtX;
      endLabelX = endExtX;
    } else if (isNearHorizontal) {
      // For near-horizontal lines, increase the vertical offset to avoid overlap
      startLabelX = startExtX - (labelWidth / 2);
      endLabelX = endExtX - (labelWidth / 2);
    } else {
      // For other angles
      startLabelX = startExtX - (labelWidth / 2);
      endLabelX = endExtX - (labelWidth / 2);
    }
    
    // Vertical position (centered)
    const startLabelY = startExtY - (labelHeight / 2);
    const endLabelY = endExtY - (labelHeight / 2);
    
    return { startLabelX, startLabelY, endLabelX, endLabelY };
  }
  
  private _recalculatePreviousMeasurement(index: number): void {
    const measurement = this.previousMeasurements[index];
    if (!measurement) return;
    
    // No need to store or parse old distance - we'll calculate directly from coordinates

    // Calculate pixel distance
    const dx = measurement.endX - measurement.startX;
    const dy = measurement.endY - measurement.startY;
    const pixelDistance = Math.sqrt(dx * dx + dy * dy);
    const pixelText = `${Math.round(pixelDistance)} px`;

    // Update midpoint
    measurement.midX = (measurement.startX + measurement.endX) / 2;
    measurement.midY = (measurement.startY + measurement.endY) / 2;

    // Calculate optimal label positions using the shared function
    const labelPositions = this._calculateLabelPositions(
      measurement.startX, 
      measurement.startY, 
      measurement.endX, 
      measurement.endY
    );
    
    // Update the label positions
    measurement.startLabelX = labelPositions.startLabelX;
    measurement.startLabelY = labelPositions.startLabelY;
    measurement.endLabelX = labelPositions.endLabelX;
    measurement.endLabelY = labelPositions.endLabelY;

    // If both points have celestial coordinates, calculate angular distance
    if (this.hasAdvancedSolution &&
        measurement.startRa !== null && measurement.startDec !== null &&
        measurement.endRa !== null && measurement.endDec !== null) {
      try {
        // Calculate angular distance using the original method
        const angularDistance = this._calculateAngularDistance(
          measurement.startRa, measurement.startDec,
          measurement.endRa, measurement.endDec
        );

        if (typeof angularDistance === 'number' && !isNaN(angularDistance)) {
          // Format in degrees/minutes/seconds
          const degrees = Math.floor(angularDistance);
          const minutes = Math.floor((angularDistance - degrees) * 60);
          const seconds = Math.round(((angularDistance - degrees) * 60 - minutes) * 60);

          // Set only the celestial measurement when available
          measurement.distance = `${degrees}° ${minutes}′ ${seconds}″`;
        } else {
          // If calculation fails, just show pixel distance
          measurement.distance = pixelText;
        }
      } catch (e) {
        // If calculation throws an error, just show pixel distance
        measurement.distance = pixelText;
      }
    } else {
      // If we don't have coordinates, just show pixel distance
      measurement.distance = pixelText;
    }

    // Apply changes
    this.changeDetectorRef.detectChanges();
  }
}
