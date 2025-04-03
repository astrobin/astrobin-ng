import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, Input, NgZone, OnDestroy, OnInit, Output, PLATFORM_ID, TemplateRef, ViewChild } from "@angular/core";
import { CookieService } from "ngx-cookie";
import { CoordinatesFormatterService } from "@core/services/coordinates-formatter.service";
import { AstroUtilsService } from "@core/services/astro-utils/astro-utils.service";
import { select, Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { TranslateService } from "@ngx-translate/core";
import { CreateMeasurementPreset, DeleteMeasurementPreset, LoadMeasurementPresets, ToggleSavedMeasurements } from "./store/measurement-preset.actions";
import { selectAllMeasurementPresets, selectShowSavedMeasurements } from "./store/measurement-preset.selectors";
import { MeasurementPresetInterface } from "./measurement-preset.interface";
import { debounceTime, filter, switchMap, take, takeUntil, tap } from "rxjs/operators";
import { fromEvent, merge, Subject } from "rxjs";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { NgbModal, NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { SaveMeasurementModalComponent } from "./save-measurement-modal/save-measurement-modal.component";
import { SolutionInterface } from "@core/interfaces/solution.interface";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { InformationDialogComponent } from "@shared/components/misc/information-dialog/information-dialog.component";
import { isPlatformBrowser } from "@angular/common";
import { WindowRefService } from "@core/services/window-ref.service";
import { ExportMeasurementModalComponent } from "./export-measurement-modal/export-measurement-modal.component";
import { ActivatedRoute, Router } from "@angular/router";
import { DeviceService } from "@core/services/device.service";
import { UtilsService } from "@core/services/utils/utils.service";

// Interface to represent a label's bounding box for collision detection
interface LabelBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  priority: number; // Lower number = higher priority (less likely to be moved)
  type: "point" | "dimension"; // Type of label for special handling
}

export interface MeasurementPoint {
  x: number;
  y: number;
  ra: number | null;
  dec: number | null;
}

export interface MeasurementData {
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
  startLabelX: number;
  startLabelY: number;
  endLabelX: number;
  endLabelY: number;
  showCircle?: boolean;
  showRectangle?: boolean;

  // For saved measurements
  widthArcseconds?: number | null;  // Width in arcseconds for rectangular measurements
  heightArcseconds?: number | null; // Height in arcseconds for rectangular measurements
  length?: number;                  // Length in pixels for recreating the measurement
  name?: string;                    // Name for the measurement
  notes?: string;                   // Optional user notes about the measurement
  outOfBounds?: boolean;            // Flag indicating if any point is outside image boundaries
}

export interface SolutionMatrix {
  matrixRect: string;
  matrixDelta: number;
  raMatrix: string;
  decMatrix: string;
}

@Component({
  selector: "astrobin-measuring-tool",
  templateUrl: "./measuring-tool.component.html",
  styleUrls: ["./measuring-tool.component.scss"]
})
export class MeasuringToolComponent extends BaseComponentDirective implements OnInit, OnDestroy, AfterViewInit {

  /**
   * Toggles the tooltip visibility when clicked
   * @param tooltip The NgbTooltip instance
   */
  toggleTooltip(tooltip: any): void {
    if (tooltip.isOpen()) {
      tooltip.close();
    } else {
      tooltip.open();
    }
  }
  @Input() active: boolean = false;
  @Input() imageElement: ElementRef<HTMLElement | HTMLImageElement>;
  @Input() advancedSolutionMatrix: SolutionMatrix | null = null;
  @Input() windowWidth: number;
  @Input() windowHeight: number;
  @Input() setMouseOverUIElement: (value: boolean) => void;
  @Input() solution: SolutionInterface;
  @Input() naturalWidth: number;
  @Input() naturalHeight: number;

  @Output() exitMeasuringMode = new EventEmitter<void>();
  @Output() measurementStarted = new EventEmitter<void>();
  @Output() measurementComplete = new EventEmitter<MeasurementData>();

  @ViewChild("helpContent", { static: true }) helpContentRef: TemplateRef<any>;

  // Measurement points
  measureStartPoint: MeasurementPoint | null = null;
  measureEndPoint: MeasurementPoint | null = null;
  measureDistance: string | null = null;
  previousMeasurements: MeasurementData[] = [];
  // Saved measurements
  showSavedMeasurements: boolean = false;
  newMeasurementName: string = "";
  saveMeasurementNotes: string = "";
  savedMeasurements: MeasurementPresetInterface[] = [];
  // URL measurement loading state
  loadingUrlMeasurements: boolean = false;
  // Saved measurement loading state
  loadingMeasurement: boolean = false;
  // Mouse tracking
  mouseX: number | null = null;
  mouseY: number | null = null;
  // Drag functionality
  dragStartX: number | null = null;
  dragStartY: number | null = null;
  dragOffsetX: number = 0;
  dragOffsetY: number = 0;
  isDraggingPoint: "start" | "end" | string | null = null;
  // Shape visualization
  showCurrentCircle: boolean = false;
  showCurrentRectangle: boolean = false;
  // Flag to track if window has been resized (affecting measurement accuracy)
  public measurementsAffectedByResize: boolean = false;
  // Flag to control the visibility of the resize warning modal
  public showResizeWarningModal: boolean = false;
  // Constants
  protected readonly Math = Math;
  // Flag to detect browser environment
  protected isBrowser: boolean;
  // Constants for magic values
  private readonly DRAG_THRESHOLD = 10; // Minimum pixels to move before considering it a drag
  private readonly COORD_UPDATE_DEBOUNCE_MS = 100; // Update coordinates at most every 100ms
  private readonly MEASUREMENT_SHAPE_COOKIE_NAME = "astrobin-fullscreen-measurement-shape"; // Cookie name for shape preference
  private readonly CLICK_PREVENTION_TIMEOUT_MS = 100; // Timeout to prevent accidental double clicks
  private readonly RESIZE_DEBOUNCE_MS = 300; // Debounce time for window resize events
  // Bound event handlers
  // Subjects for controlling drag operations
  private _pointDragStart$ = new Subject<{ event: MouseEvent, point: string }>();
  private _pointDragEnd$ = new Subject<MouseEvent>();
  private _previousMeasurementDragStart$ = new Subject<{ event: MouseEvent, index: number, point: string }>();
  private _previousMeasurementDragEnd$ = new Subject<MouseEvent>();
  private _shapeDragStart$ = new Subject<{ event: MouseEvent, index: number }>();
  private _shapeDragEnd$ = new Subject<MouseEvent>();
  private _currentShapeDragStart$ = new Subject<MouseEvent>();
  private _currentShapeDragEnd$ = new Subject<MouseEvent>();

  // Events streams
  private _documentMouseMove$ = isPlatformBrowser(this.platformId) ?
    fromEvent<MouseEvent>(document, "mousemove", { passive: false }).pipe(takeUntil(this.destroyed$)) :
    new Subject<MouseEvent>();
  private _documentMouseUp$ = isPlatformBrowser(this.platformId) ?
    fromEvent<MouseEvent>(document, "mouseup", { passive: false }).pipe(takeUntil(this.destroyed$)) :
    new Subject<MouseEvent>();
  private _windowResize$ = isPlatformBrowser(this.platformId) ?
    fromEvent<UIEvent>(window, "resize", { passive: false }).pipe(
      debounceTime(this.RESIZE_DEBOUNCE_MS),
      takeUntil(this.destroyed$)
    ) :
    new Subject<UIEvent>();

  private _dragInProgress = false;
  private _preventNextClick = false;
  // Track the previous window dimensions to detect significant changes
  private _prevWindowWidth: number = 0;
  private _prevWindowHeight: number = 0;
  // For debouncing coordinate updates during drag
  private _lastCoordUpdateTime = 0;

  // Touch-specific state
  private _isTouchDevice = false;
  private _lastTouchEvent: TouchEvent = null;
  private _touchStartTime = 0;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly cookieService: CookieService,
    public readonly coordinatesFormatter: CoordinatesFormatterService,
    public readonly astroUtilsService: AstroUtilsService,
    public readonly cdRef: ChangeDetectorRef,
    public readonly ngZone: NgZone,
    public readonly utilsService: UtilsService,
    public readonly deviceService: DeviceService,
    private modalService: NgbModal,
    private offcanvasService: NgbOffcanvas,
    private popNotificationsService: PopNotificationsService,
    private translateService: TranslateService,
    private windowRefService: WindowRefService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    super(store$);

    // For SSR compatibility
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // Bound methods for use in pipes
  public boundCalculateCoordinatesAtPoint = (x: number, y: number, accountForRotation: boolean = false) => {
    // Never attempt to access DOM in server-side rendering
    if (!this.isBrowser || !this.isValidSolutionMatrix()) {
      return null;
    }

    // Use the cached image element
    let imageElement = this.cachedImageElement;

    // Fallback if cached element isn't available yet
    if (!imageElement || imageElement.getBoundingClientRect().width === 0) {
      // Now we use the direct image element (no querySelector needed)
      imageElement = this.imageElement?.nativeElement;
    }

    if (!imageElement) {
      return null;
    }

    // Use the service to calculate coordinates
    return this.astroUtilsService.calculateCoordinatesAtPoint(
      x,
      y,
      this.advancedSolutionMatrix,
      imageElement as HTMLElement
    );
  };

  public boundCalculateAngularDistance = (ra1: number, dec1: number, ra2: number, dec2: number) =>
    this.astroUtilsService.calculateAngularDistance(ra1, dec1, ra2, dec2);

  public boundFormatAstronomicalAngle = (arcseconds: number) =>
    this.astroUtilsService.formatAstronomicalAngle(arcseconds);


  ngOnInit(): void {
    super.ngOnInit();

    // Detect touch device
    if (this.isBrowser) {
      this._isTouchDevice = 'ontouchstart' in window ||
                           navigator.maxTouchPoints > 0 ||
                           (navigator as any).msMaxTouchPoints > 0;
    }

    // Always handle store subscriptions first as they're SSR-safe
    // Subscribe to state changes
    this.store$.pipe(
      select(selectShowSavedMeasurements),
      takeUntil(this.destroyed$)
    ).subscribe(showSavedMeasurements => {
      this.showSavedMeasurements = showSavedMeasurements;
    });

    this.store$.pipe(
      select(selectAllMeasurementPresets),
      takeUntil(this.destroyed$)
    ).subscribe(presets => {
      this.savedMeasurements = presets;
    });

    // We'll initialize image element in ngAfterViewInit

    // URL measurement loading moved to ngAfterViewInit
    // This is crucial because we need the image element to be ready first

    // Load presets when the component initializes
    this.currentUser$.pipe(
      take(1),
      takeUntil(this.destroyed$)
    ).subscribe(user => {
      if (user && "id" in user) {
        this.store$.dispatch(new LoadMeasurementPresets({ userId: user.id }));
      }
    });

    // Load browser-specific preferences
    this.loadMeasurementShapePreference();

    // Only set up RxJS streams when in browser environment
    if (this.isBrowser) {
      // Set up document mouse move for measuring mode
      if (this.active) {
        this._documentMouseMove$
          .pipe(takeUntil(this.destroyed$))
          .subscribe(event => this.handleMeasuringMouseMove(event));
      }

      // Set up window resize handler
      this._windowResize$
        .pipe(takeUntil(this.destroyed$))
        .subscribe(event => this.handleWindowResize(event));

      // Initialize previous window dimensions
      this._prevWindowWidth = window.innerWidth;

      // Set up point drag handling
      this._pointDragStart$
        .pipe(
          takeUntil(this.destroyed$),
          tap(() => this._dragInProgress = true),
          switchMap(({ event, point }) => this._documentMouseMove$.pipe(
            takeUntil(merge(this._pointDragEnd$, this.destroyed$)),
            // Apply preventDefault directly in the observable chain
            tap(moveEvent => {
              moveEvent.preventDefault();
            }),
            tap(moveEvent => this.handlePointDragMove(moveEvent))
          ))
        )
        .subscribe();

      // Handle point drag end
      this._pointDragEnd$
        .pipe(
          takeUntil(this.destroyed$),
          tap(event => {
            this.handlePointDragEnd(event);
            this._dragInProgress = false;
          })
        )
        .subscribe();

      // Set up previous measurement drag handling
      this._previousMeasurementDragStart$
        .pipe(
          takeUntil(this.destroyed$),
          tap(() => this._dragInProgress = true),
          switchMap(({ event, index, point }) => this._documentMouseMove$.pipe(
            takeUntil(merge(this._previousMeasurementDragEnd$, this.destroyed$)),
            // Apply preventDefault directly in the observable chain
            tap(moveEvent => {
              moveEvent.preventDefault();
            }),
            tap(moveEvent => this.handlePreviousMeasurementDragMove(moveEvent))
          ))
        )
        .subscribe();

      // Handle previous measurement drag end
      this._previousMeasurementDragEnd$
        .pipe(
          takeUntil(this.destroyed$),
          tap(event => {
            this.handlePreviousMeasurementDragEnd(event);
            this._dragInProgress = false;
          })
        )
        .subscribe();

      // Set up shape drag handling
      this._shapeDragStart$
        .pipe(
          takeUntil(this.destroyed$),
          tap(() => this._dragInProgress = true),
          switchMap(({ event, index }) => this._documentMouseMove$.pipe(
            takeUntil(merge(this._shapeDragEnd$, this.destroyed$)),
            // Apply preventDefault directly in the observable chain
            // BEFORE passing the event to handlers
            tap(moveEvent => {
              if (this.isDraggingPoint?.startsWith("prevShape")) {
                moveEvent.preventDefault();
              }
            }),
            tap(moveEvent => this.handleShapeDragMove(moveEvent))
          ))
        )
        .subscribe();

      // Handle shape drag end
      this._shapeDragEnd$
        .pipe(
          takeUntil(this.destroyed$),
          tap(event => {
            this.handleShapeDragEnd(event);
            this._dragInProgress = false;
          })
        )
        .subscribe();

      // Set up current shape drag handling
      this._currentShapeDragStart$
        .pipe(
          takeUntil(this.destroyed$),
          tap(() => this._dragInProgress = true),
          switchMap(event => this._documentMouseMove$.pipe(
            takeUntil(merge(this._currentShapeDragEnd$, this.destroyed$)),
            // Apply preventDefault directly in the observable chain
            tap(moveEvent => {
              moveEvent.preventDefault();
            }),
            tap(moveEvent => this.handleCurrentShapeDragMove(moveEvent))
          ))
        )
        .subscribe();

      // Handle current shape drag end
      this._currentShapeDragEnd$
        .pipe(
          takeUntil(this.destroyed$),
          tap(event => {
            this.handleCurrentShapeDragEnd(event);
            this._dragInProgress = false;
          })
        )
        .subscribe();

      // Global mouse up handler for all drags
      this._documentMouseUp$
        .pipe(
          takeUntil(this.destroyed$),
          filter(() => this._dragInProgress)
        )
        .subscribe(event => {
          // Determine which drag is active and end it
          if (this.isDraggingPoint?.startsWith("prev") && this.isDraggingPoint?.includes("-")) {
            this._previousMeasurementDragEnd$.next(event);
          } else if (this.isDraggingPoint?.startsWith("prevShape")) {
            this._shapeDragEnd$.next(event);
          } else if (this.isDraggingPoint === "currentShape") {
            this._currentShapeDragEnd$.next(event);
          } else if (this.isDraggingPoint) {
            this._pointDragEnd$.next(event);
          }
        });
      this._prevWindowHeight = window.innerHeight;
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      // Initialize the cached image element after a delay to ensure DOM is ready
      this.windowRefService.utilsService.delay(100).subscribe(() => {
        // Setting cached image element
        // Now we use the direct image element (no querySelector needed)
        this.cachedImageElement = this.imageElement?.nativeElement;

        // After image element is cached, update boundary status
        this.updateBoundaryStatus();

        // IMPORTANT: Check for measurements in URL AFTER the image element is available
        // This is critical for correct positioning of measurements
        this.checkForUrlMeasurements();
      });
    }
  }

  /**
   * Check for measurements in URL and load them if found
   * This needs to happen after the image element is available
   */
  private checkForUrlMeasurements(): void {
    if (!this.isBrowser) {
      return;
    }

    // Checking for URL measurements

    // Get the current URL directly
    const currentUrl = new URL(this.windowRefService.nativeWindow.location.href);
    const measurementsParam = currentUrl.searchParams.get('measurements');

    // URL measurements check
    // Checking measurements param present/not present

    if (measurementsParam && measurementsParam.trim() !== '') {
      try {
        // Found measurements in URL - Loading

        // Set loading flag
        this.loadingUrlMeasurements = true;
        this.cdRef.markForCheck();
        this.cdRef.detectChanges();

        // Show loading indicator
        this.showLoadingIndicator();

        // Load after a brief delay to ensure indicator is visible
        this.windowRefService.utilsService.delay(200).subscribe(() => {
          try {
            // Load the measurements with explicit error check
            this.loadMeasurementsFromUrl(measurementsParam);
            // Successfully loaded measurements from URL
          } catch (e) {
            // Failed to load measurements from URL
            this.loadingUrlMeasurements = false;
            this.hideLoadingIndicator();
            this.popNotificationsService.error(
              this.translateService.instant("Failed to load shared measurements: {{error}}", { error: e.message })
            );
          }
        });
      } catch (e) {
        // Error checking URL measurements
        this.loadingUrlMeasurements = false;
      }
    } else {
      // No measurements found in URL
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      // Complete all drag-related subjects
      this._pointDragStart$.complete();
      this._pointDragEnd$.complete();
      this._previousMeasurementDragStart$.complete();
      this._previousMeasurementDragEnd$.complete();
      this._shapeDragStart$.complete();
      this._shapeDragEnd$.complete();
      this._currentShapeDragStart$.complete();
      this._currentShapeDragEnd$.complete();
    }

    // Call parent class ngOnDestroy - this will also complete the destroyed$ subject
    super.ngOnDestroy();
  }

  /**
   * Handle mouse down on the measurement overlay to start measuring
   */
  handleMeasurementMouseDown(event: MouseEvent): void {
    // Skip if this mousedown should be prevented
    if (this._preventNextClick) {
      this._preventNextClick = false;
      return;
    }

    // Check if we can proceed with measurement
    if (!this._validateMeasurementArea(event)) {
      return;
    }

    // Prevent text selection during drag
    event.preventDefault();

    // If already in the middle of a two-click measurement (start point exists but no end point),
    // don't start a new measurement with mouse down
    if (this.measureStartPoint && !this.measureEndPoint) {
      return;
    }

    // Handle case when starting a new measurement while one is already complete
    if (this.measureStartPoint && this.measureEndPoint) {
      this._resetCurrentMeasurement();
    }

    // Initialize tracking variables for detecting drag vs. click
    const startX = event.clientX;
    const startY = event.clientY;

    // Initialize the start point and prepare for measurement
    this._initializeStartPoint(event);

    // Setup drag tracking and handlers
    this._setupDragTracking(event, startX, startY);
  }

  /**
   * Handle clicks on the measurement overlay to place points
   */
  handleMeasurementClick(event: MouseEvent): void {
    // Skip if this click should be prevented (e.g., it's part of a drag operation)
    if (this._preventNextClick || this._dragInProgress) {
      this._preventNextClick = false;
      return;
    }

    // Check if we can proceed with measurement
    if (!this._validateMeasurementArea(event)) {
      return;
    }

    // Handle different measurement states
    if (this.measureStartPoint && this.measureEndPoint) {
      // We have a completed measurement, start a new one
      this._handleNewMeasurementClick(event);
    } else if (!this.measureStartPoint) {
      // No measurement started yet, set first point
      this._handleFirstPointClick(event);
    } else if (!this.measureEndPoint) {
      // First point set, now add second point and complete measurement
      this._handleSecondPointClick(event);
    }
  }

  /**
   * Calculate the distance between two points
   */
  calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  /**
   * Format angular distance with proper units
   */
  formatAngularDistance(distance: number): string {
    // Convert pixel distance to angular distance using solution matrix
    if (!this.isValidSolutionMatrix()) {
      return `${Math.round(distance)} px`;
    }

    // If we have coordinates for both points, use them to calculate the actual angular distance
    if (this.measureStartPoint?.ra !== null && this.measureStartPoint?.dec !== null &&
      this.measureEndPoint?.ra !== null && this.measureEndPoint?.dec !== null) {

      const angularDistance = this.astroUtilsService.calculateAngularDistance(
        this.measureStartPoint.ra,
        this.measureStartPoint.dec,
        this.measureEndPoint.ra,
        this.measureEndPoint.dec
      );

      // Format the angular distance
      return this.astroUtilsService.formatAngularDistance(angularDistance);
    }

    // If we don't have valid celestial coordinates, return the pixel distance
    return `${Math.round(distance)} px`;
  }

  /**
   * Handle mouse movement during measuring mode
   */
  handleMeasuringMouseMove(event: MouseEvent): void {
    // Update mouse position for drawing the measurement line
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }

  /**
   * Handle touch start for measurements - only track position, don't create points yet
   */
  handleMeasurementTouchStart(event: TouchEvent): void {
    // Prevent scrolling while interacting with the measuring tool
    event.preventDefault();

    // Store the touch start time and event for subsequent handling
    this._touchStartTime = Date.now();
    this._lastTouchEvent = event;

    // Skip if this touch should be prevented
    if (this._preventNextClick) {
      this._preventNextClick = false;
      return;
    }

    if (event.touches.length === 1) {
      const touch = event.touches[0];

      // Initialize tracking variables for detecting drag vs. tap
      this.dragStartX = touch.clientX;
      this.dragStartY = touch.clientY;

      // Track coordinates for visualization
      this.mouseX = touch.clientX;
      this.mouseY = touch.clientY;

      // Track this as the start of a potential drag - but don't create a point yet
      // We'll wait to see if this is a drag or a tap
      this._dragInProgress = true;
    }
  }

  /**
   * Handle touch move to track measurement & support drag-to-measure
   */
  handleMeasurementTouchMove(event: TouchEvent): void {
    // Prevent scrolling during measurement
    event.preventDefault();

    // Store the last touch event
    this._lastTouchEvent = event;

    if (event.touches.length === 1) {
      const touch = event.touches[0];

      // Update mouse position for live visualization
      this.mouseX = touch.clientX;
      this.mouseY = touch.clientY;

      // If we're dragging a point, we don't need to handle it here
      // as it's already being handled by the touch listeners in handlePointTouchStart
      if (this.isDraggingPoint) {
        return;
      }

      // If we're in a drag operation
      if (this._dragInProgress && this.dragStartX !== null && this.dragStartY !== null) {
        const deltaX = Math.abs(touch.clientX - this.dragStartX);
        const deltaY = Math.abs(touch.clientY - this.dragStartY);

        // If we've moved enough, consider this a real drag and create start point if needed
        if ((deltaX > this.DRAG_THRESHOLD || deltaY > this.DRAG_THRESHOLD) && !this._preventNextClick) {
          this._preventNextClick = true; // Mark as a drag

          // Create a simulated mouse event for consistent handling
          const simulatedEvent = new MouseEvent('touchmove', {
            clientX: this.dragStartX, // Use the original start position
            clientY: this.dragStartY,
            bubbles: true,
            cancelable: true,
            view: window
          });

          // Check if we can proceed with measurement
          if (this._validateMeasurementArea(simulatedEvent)) {
            // If already in the middle of a measurement, do nothing
            if (this.measureStartPoint && !this.measureEndPoint) {
              return;
            }

            // Handle case when starting a new measurement while one is already complete
            if (this.measureStartPoint && this.measureEndPoint) {
              this._resetCurrentMeasurement();
            }

            // Initialize the start point at the original touch position
            this._initializeStartPoint(simulatedEvent);
            this.measurementStarted.emit();
            this.cdRef.markForCheck();
          }
        }
      }
    }
  }

  /**
   * Handle touch end - finalize drag-based measurements or handle single tap
   */
  handleMeasurementTouchEnd(event: TouchEvent): void {
    // Get the final touch position
    const touch = event.changedTouches[0];
    if (!touch) {
      this._dragInProgress = false;
      return;
    }

    // Create a simulated mouse event for consistent handling
    const simulatedEvent = new MouseEvent('touchend', {
      clientX: touch.clientX,
      clientY: touch.clientY,
      bubbles: true,
      cancelable: true,
      view: window
    });

    // Calculate touch duration
    const touchDuration = Date.now() - this._touchStartTime;
    const wasTap = touchDuration < 300 && !this._preventNextClick; // Short touch without significant movement

    if (wasTap) {
      // If this was a tap (not a drag), simulate a click
      if (this._validateMeasurementArea(simulatedEvent)) {
        // Handle different measurement states - exactly like handleMeasurementClick
        if (this.measureStartPoint && this.measureEndPoint) {
          // We have a completed measurement, start a new one
          this._handleNewMeasurementClick(simulatedEvent);
        } else if (!this.measureStartPoint) {
          // No measurement started yet, set first point
          this._handleFirstPointClick(simulatedEvent);
        } else if (!this.measureEndPoint) {
          // First point set, now add second point and complete measurement
          this._handleSecondPointClick(simulatedEvent);
        }
      }
    } else if (this.measureStartPoint && !this.measureEndPoint && this._preventNextClick) {
      // This was a drag, create end point at the current touch position
      if (this._validateMeasurementArea(simulatedEvent)) {
        // Create the end point
        this._createEndPoint(simulatedEvent);

        // Finalize the measurement
        this._finalizeMeasurement();
      }
    }

    // Reset state flags
    this._dragInProgress = false;
    this._preventNextClick = false;

    // Reset drag state if needed
    if (this.isDraggingPoint) {
      this.isDraggingPoint = null;
    }

    this.cdRef.markForCheck();
  }

  /**
   * Start dragging a measurement point
   */
  handlePointDragStart(event: MouseEvent, point: "start" | "end"): void {
    event.preventDefault();
    event.stopPropagation();

    this.isDraggingPoint = point;

    // Calculate offset between mouse position and point position
    if (point === "start" && this.measureStartPoint) {
      this.dragOffsetX = this.measureStartPoint.x - event.clientX;
      this.dragOffsetY = this.measureStartPoint.y - event.clientY;
    } else if (point === "end" && this.measureEndPoint) {
      this.dragOffsetX = this.measureEndPoint.x - event.clientX;
      this.dragOffsetY = this.measureEndPoint.y - event.clientY;
    } else {
      this.dragOffsetX = 0;
      this.dragOffsetY = 0;
    }

    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;

    // Signal that dragging has started
    this._preventNextClick = true;

    // Trigger the drag start stream
    this._pointDragStart$.next({ event, point });
  }

  /**
   * Start touch-dragging a measurement point (start or end point)
   */
  handlePointTouchStart(event: TouchEvent, point: "start" | "end"): void {
    event.preventDefault();
    event.stopPropagation();

    this.isDraggingPoint = point;
    this._dragInProgress = true;

    // Calculate offset between touch position and point position
    if (event.touches.length === 1) {
      const touch = event.touches[0];

      if (point === "start" && this.measureStartPoint) {
        this.dragOffsetX = this.measureStartPoint.x - touch.clientX;
        this.dragOffsetY = this.measureStartPoint.y - touch.clientY;
      } else if (point === "end" && this.measureEndPoint) {
        this.dragOffsetX = this.measureEndPoint.x - touch.clientX;
        this.dragOffsetY = this.measureEndPoint.y - touch.clientY;
      } else {
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
      }

      this.dragStartX = touch.clientX;
      this.dragStartY = touch.clientY;
    }

    // Set up document-level touch handlers for the duration of this drag
    const touchMoveHandler = (moveEvent: TouchEvent) => {
      moveEvent.preventDefault();

      if (moveEvent.touches.length !== 1) return;
      const moveTouch = moveEvent.touches[0];

      // Update the point position based on the touch
      if (point === 'start' && this.measureStartPoint) {
        this.measureStartPoint.x = moveTouch.clientX + this.dragOffsetX;
        this.measureStartPoint.y = moveTouch.clientY + this.dragOffsetY;

        // Update celestial coordinates with debouncing
        const now = Date.now();
        if (now - this._lastCoordUpdateTime > this.COORD_UPDATE_DEBOUNCE_MS) {
          this._lastCoordUpdateTime = now;
          if (this.isValidSolutionMatrix()) {
            const coords = this.boundCalculateCoordinatesAtPoint(
              this.measureStartPoint.x,
              this.measureStartPoint.y
            );
            if (coords) {
              this.measureStartPoint.ra = coords.ra;
              this.measureStartPoint.dec = coords.dec;
            }
          }
        }
      } else if (point === 'end' && this.measureEndPoint) {
        this.measureEndPoint.x = moveTouch.clientX + this.dragOffsetX;
        this.measureEndPoint.y = moveTouch.clientY + this.dragOffsetY;

        // Update celestial coordinates with debouncing
        const now = Date.now();
        if (now - this._lastCoordUpdateTime > this.COORD_UPDATE_DEBOUNCE_MS) {
          this._lastCoordUpdateTime = now;
          if (this.isValidSolutionMatrix()) {
            const coords = this.boundCalculateCoordinatesAtPoint(
              this.measureEndPoint.x,
              this.measureEndPoint.y
            );
            if (coords) {
              this.measureEndPoint.ra = coords.ra;
              this.measureEndPoint.dec = coords.dec;
            }
          }
        }
      }

      // Recalculate distance if needed
      if (this.measureStartPoint && this.measureEndPoint) {
        this._recalculateMeasurementDistance();
      }

      // Update boundary status
      this.updateBoundaryStatus();

      // Force change detection
      this.cdRef.markForCheck();
    };

    const touchEndHandler = () => {
      // Reset drag state
      this._dragInProgress = false;
      this.isDraggingPoint = null;

      // Clean up event listeners
      document.removeEventListener('touchmove', touchMoveHandler);
      document.removeEventListener('touchend', touchEndHandler);

      // Force change detection
      this.cdRef.markForCheck();
    };

    // Add event listeners for the duration of this drag
    document.addEventListener('touchmove', touchMoveHandler, { passive: false });
    document.addEventListener('touchend', touchEndHandler, { passive: false });

    // Force change detection
    this.cdRef.markForCheck();
  }

  /**
   * Handle point dragging movement
   */
  handlePointDragMove(event: MouseEvent): void {
    if (!this.isDraggingPoint || !this._dragInProgress) {
      return;
    }

    if (this.isDraggingPoint === "start" && this.measureStartPoint) {
      this._updateDraggedStartPoint(event);
    } else if (this.isDraggingPoint === "end" && this.measureEndPoint) {
      this._updateDraggedEndPoint(event);
    }

    // Update boundary status during drag
    this.updateBoundaryStatus();

    // Force label position calculation and change detection
    this._updateLabelPositions();
  }

  /**
   * Handle end of point dragging
   */
  handlePointDragEnd(event: MouseEvent): void {
    if (!this._dragInProgress) {
      return;
    }

    event.preventDefault();

    // Clean up event listeners
    // Using RxJS streams for handling drag events now
    this._pointDragEnd$.next(event);

    // Reset drag state
    this._dragInProgress = false;
    this.isDraggingPoint = null;
    this.dragStartX = null;
    this.dragStartY = null;

    // Update measurement data
    if (this.measureStartPoint && this.measureEndPoint && this.measureDistance) {
      // Calculate midpoint for label positioning
      const midX = (this.measureStartPoint.x + this.measureEndPoint.x) / 2;
      const midY = (this.measureStartPoint.y + this.measureEndPoint.y) / 2;

      const currentMeasurement: MeasurementData = {
        startX: this.measureStartPoint.x,
        startY: this.measureStartPoint.y,
        endX: this.measureEndPoint.x,
        endY: this.measureEndPoint.y,
        midX: midX,
        midY: midY,
        distance: this.measureDistance,
        timestamp: Date.now(),
        startRa: this.measureStartPoint.ra,
        startDec: this.measureStartPoint.dec,
        endRa: this.measureEndPoint.ra,
        endDec: this.measureEndPoint.dec,
        startLabelX: 0,
        startLabelY: 0,
        endLabelX: 0,
        endLabelY: 0,
        showCircle: this.showCurrentCircle,
        showRectangle: this.showCurrentRectangle
      };

      // Calculate label positions
      this.updateCoordinateLabelPositions(currentMeasurement);

      // Save the updated measurement data
      this.measurementComplete.emit(currentMeasurement);
    }
  }

  /**
   * Start dragging a previous measurement point
   */
  handlePreviousMeasurementDrag(event: MouseEvent, index: number, point: "start" | "end"): void {
    event.preventDefault();
    event.stopPropagation();

    this.isDraggingPoint = `prev${point.charAt(0).toUpperCase() + point.slice(1)}-${index}`;

    // Calculate offset between mouse position and point position
    if (index >= 0 && index < this.previousMeasurements.length) {
      const measurement = this.previousMeasurements[index];
      if (point === "start") {
        this.dragOffsetX = measurement.startX - event.clientX;
        this.dragOffsetY = measurement.startY - event.clientY;
      } else if (point === "end") {
        this.dragOffsetX = measurement.endX - event.clientX;
        this.dragOffsetY = measurement.endY - event.clientY;
      } else {
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
      }
    } else {
      this.dragOffsetX = 0;
      this.dragOffsetY = 0;
    }

    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;

    // Signal that dragging has started
    this._preventNextClick = true;

    // Trigger the drag start stream
    this._previousMeasurementDragStart$.next({ event, index, point });
  }

  /**
   * Start touch-dragging a previous measurement point
   */
  handlePreviousMeasurementTouchDrag(event: TouchEvent, index: number, point: "start" | "end"): void {
    event.preventDefault();
    event.stopPropagation();

    if (event.touches.length !== 1) return;

    const touch = event.touches[0];
    this.isDraggingPoint = `prev${point.charAt(0).toUpperCase() + point.slice(1)}-${index}`;

    // Calculate offset between touch position and point position
    if (index >= 0 && index < this.previousMeasurements.length) {
      const measurement = this.previousMeasurements[index];
      if (point === "start") {
        this.dragOffsetX = measurement.startX - touch.clientX;
        this.dragOffsetY = measurement.startY - touch.clientY;
      } else if (point === "end") {
        this.dragOffsetX = measurement.endX - touch.clientX;
        this.dragOffsetY = measurement.endY - touch.clientY;
      } else {
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
      }
    } else {
      this.dragOffsetX = 0;
      this.dragOffsetY = 0;
    }

    this.dragStartX = touch.clientX;
    this.dragStartY = touch.clientY;

    // Signal that dragging has started
    this._preventNextClick = true;

    // Create a simulated mouse event for the drag handler
    const simulatedEvent = new MouseEvent('touchstart', {
      clientX: touch.clientX,
      clientY: touch.clientY,
      bubbles: true,
      cancelable: true,
      view: window
    });

    // Trigger the drag start stream with simulated mouse event
    this._previousMeasurementDragStart$.next({ event: simulatedEvent, index, point });

    // Set up document-level touch handlers for the duration of this drag
    const touchMoveHandler = (moveEvent: TouchEvent) => {
      moveEvent.preventDefault();
      if (moveEvent.touches.length !== 1) return;

      const moveTouch = moveEvent.touches[0];

      // Create a simulated mouse event for move
      const simulatedMoveEvent = new MouseEvent('touchmove', {
        clientX: moveTouch.clientX,
        clientY: moveTouch.clientY,
        bubbles: true,
        cancelable: true,
        view: window
      });

      // Update the previous measurement using the same logic as mouse
      this.handlePreviousMeasurementDragMove(simulatedMoveEvent);
    };

    const touchEndHandler = (endEvent: TouchEvent) => {
      // Create a simulated mouse event for end
      const simulatedEndEvent = new MouseEvent('touchend', {
        clientX: endEvent.changedTouches[0]?.clientX || touch.clientX,
        clientY: endEvent.changedTouches[0]?.clientY || touch.clientY,
        bubbles: true,
        cancelable: true,
        view: window
      });

      // Process the touch end as if it were a mouse up
      this.handlePreviousMeasurementDragEnd(simulatedEndEvent);

      // Clean up event listeners
      document.removeEventListener('touchmove', touchMoveHandler);
      document.removeEventListener('touchend', touchEndHandler);
    };

    // Add event listeners for the duration of this drag
    document.addEventListener('touchmove', touchMoveHandler, { passive: false });
    document.addEventListener('touchend', touchEndHandler, { passive: false });
  }

  /**
   * Handle previous measurement point drag movement
   */
  handlePreviousMeasurementDragMove(event: MouseEvent): void {
    if (!this.isDraggingPoint || !this._dragInProgress || !this.isDraggingPoint.startsWith("prev")) {
      return;
    }

    // Get the measurement data and point type
    const measurementInfo = this._getPreviousMeasurementInfo();
    if (!measurementInfo) {
      return;
    }

    const { measurement, index, pointType } = measurementInfo;

    // Update the appropriate point based on drag type
    if (pointType === "start") {
      this._updatePreviousMeasurementStartPoint(measurement, event);
    } else if (pointType === "end") {
      this._updatePreviousMeasurementEndPoint(measurement, event);
    }

    // Update common properties
    this._updatePreviousMeasurementProperties(measurement);

    // Update boundary status during drag in real-time
    this.updateBoundaryStatus();
  }

  /**
   * Handle end of previous measurement point drag
   */
  handlePreviousMeasurementDragEnd(event: MouseEvent): void {
    if (!this._dragInProgress) {
      return;
    }

    // Update boundary status after dragging
    this.updateBoundaryStatus();

    event.preventDefault();

    // Extract the index from the drag state string
    if (this.isDraggingPoint && (this.isDraggingPoint.startsWith("prevStart-") || this.isDraggingPoint.startsWith("prevEnd-"))) {
      const parts = this.isDraggingPoint.split("-");
      const index = parseInt(parts[1], 10);

      if (!isNaN(index) && index >= 0 && index < this.previousMeasurements.length) {
        const measurement = this.previousMeasurements[index];

        // Always calculate on the fly based on current coordinates
        if (measurement.startRa !== null && measurement.endRa !== null) {
          const angularDistance = this.astroUtilsService.calculateAngularDistance(
            measurement.startRa,
            measurement.startDec,
            measurement.endRa,
            measurement.endDec
          );

          // Use consistent formatting
          measurement.distance = this.astroUtilsService.formatAngularDistance(angularDistance);
        }
      }
    }

    // Clean up event listeners
    // Using RxJS streams for handling drag events now
    this._previousMeasurementDragEnd$.next(event);

    // Reset drag state
    this._dragInProgress = false;
    this.isDraggingPoint = null;
    this.dragStartX = null;
    this.dragStartY = null;
  }

  /**
   * Start dragging a shape (circle or rectangle)
   */
  handleShapeDragStart(event: MouseEvent, index: number, shapeType: "circle" | "rectangle"): void {
    event.preventDefault();
    event.stopPropagation();

    this.isDraggingPoint = `prevShape-${index}`;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;

    // Signal that dragging has started
    this._preventNextClick = true;

    // Trigger the drag start stream
    this._shapeDragStart$.next({ event, index });
  }

  /**
   * Start touch-dragging a shape (circle or rectangle)
   */
  handleShapeTouchStart(event: TouchEvent, index: number, shapeType: "circle" | "rectangle"): void {
    event.preventDefault();
    event.stopPropagation();

    if (event.touches.length !== 1) return;

    const touch = event.touches[0];
    this.isDraggingPoint = `prevShape-${index}`;
    this.dragStartX = touch.clientX;
    this.dragStartY = touch.clientY;

    // Signal that dragging has started
    this._preventNextClick = true;

    // Create a simulated mouse event for the drag handler
    const simulatedEvent = new MouseEvent('touchstart', {
      clientX: touch.clientX,
      clientY: touch.clientY,
      bubbles: true,
      cancelable: true,
      view: window
    });

    // Trigger the drag start stream with simulated mouse event
    this._shapeDragStart$.next({ event: simulatedEvent, index });

    // Set up document-level touch handlers for the duration of this drag
    const touchMoveHandler = (moveEvent: TouchEvent) => {
      moveEvent.preventDefault();
      if (moveEvent.touches.length !== 1) return;

      const moveTouch = moveEvent.touches[0];

      // Create a simulated mouse event for move
      const simulatedMoveEvent = new MouseEvent('touchmove', {
        clientX: moveTouch.clientX,
        clientY: moveTouch.clientY,
        bubbles: true,
        cancelable: true,
        view: window
      });

      // Update the shape position using the same logic as mouse
      this.handleShapeDragMove(simulatedMoveEvent);
    };

    const touchEndHandler = (endEvent: TouchEvent) => {
      // Create a simulated mouse event for end
      const simulatedEndEvent = new MouseEvent('touchend', {
        clientX: endEvent.changedTouches[0]?.clientX || touch.clientX,
        clientY: endEvent.changedTouches[0]?.clientY || touch.clientY,
        bubbles: true,
        cancelable: true,
        view: window
      });

      // Process the touch end as if it were a mouse up
      this.handleShapeDragEnd(simulatedEndEvent);

      // Clean up event listeners
      document.removeEventListener('touchmove', touchMoveHandler);
      document.removeEventListener('touchend', touchEndHandler);
    };

    // Add event listeners for the duration of this drag
    document.addEventListener('touchmove', touchMoveHandler, { passive: false });
    document.addEventListener('touchend', touchEndHandler, { passive: false });
  }

  /**
   * Handle shape drag movement
   */
  handleShapeDragMove(event: MouseEvent): void {
    if (!this.isDraggingPoint || !this._dragInProgress || !this.isDraggingPoint.startsWith("prevShape")) {
      return;
    }

    // Extract the index from the drag state string
    const parts = this.isDraggingPoint.split("-");
    const index = parseInt(parts[1], 10);

    if (isNaN(index) || index < 0 || index >= this.previousMeasurements.length) {
      return;
    }

    const measurement = this.previousMeasurements[index];

    if (!this.dragStartX || !this.dragStartY) {
      return;
    }

    // Calculate how far the mouse has moved
    const deltaX = event.clientX - this.dragStartX;
    const deltaY = event.clientY - this.dragStartY;

    // Update all points of the measurement by the delta
    measurement.startX += deltaX;
    measurement.startY += deltaY;
    measurement.endX += deltaX;
    measurement.endY += deltaY;
    measurement.midX += deltaX;
    measurement.midY += deltaY;
    measurement.startLabelX += deltaX;
    measurement.startLabelY += deltaY;
    measurement.endLabelX += deltaX;
    measurement.endLabelY += deltaY;

    // Update the drag start point for the next move event
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;

    // Update boundary status during drag in real-time
    this.updateBoundaryStatus();

    // Update coordinates in real-time during drag, with debouncing
    // Only update if we have valid solution data and enough time has passed since last update
    const now = Date.now();
    if (this.isValidSolutionMatrix() && (now - this._lastCoordUpdateTime > this.COORD_UPDATE_DEBOUNCE_MS)) {
      this._lastCoordUpdateTime = now;

      // Run in ngZone to ensure Angular detects the changes
      this.ngZone.run(() => {
        // Get new RA/Dec for start point
        const startCoords = this.boundCalculateCoordinatesAtPoint(measurement.startX, measurement.startY);
        if (startCoords) {
          measurement.startRa = startCoords.ra;
          measurement.startDec = startCoords.dec;
        }

        // Get new RA/Dec for end point
        const endCoords = this.boundCalculateCoordinatesAtPoint(measurement.endX, measurement.endY);
        if (endCoords) {
          measurement.endRa = endCoords.ra;
          measurement.endDec = endCoords.dec;
        }

        // Update distance calculation if we have valid coordinates
        if (measurement.startRa !== null && measurement.endRa !== null) {
          const angularDistance = this.astroUtilsService.calculateAngularDistance(
            measurement.startRa,
            measurement.startDec,
            measurement.endRa,
            measurement.endDec
          );

          // Use consistent stable formatting for angular distances
          measurement.distance = this.astroUtilsService.formatAngularDistance(angularDistance);
        }

        // Force change detection
        this.cdRef.detectChanges();
      });
    }
  }

  /**
   * Handle end of shape drag
   */
  handleShapeDragEnd(event: MouseEvent): void {
    if (!this._dragInProgress) {
      return;
    }

    // Update boundary status after dragging
    this.updateBoundaryStatus();

    event.preventDefault();

    // Extract the index from the drag state string
    if (this.isDraggingPoint && this.isDraggingPoint.startsWith("prevShape")) {
      const parts = this.isDraggingPoint.split("-");
      const index = parseInt(parts[1], 10);

      if (!isNaN(index) && index >= 0 && index < this.previousMeasurements.length) {
        const measurement = this.previousMeasurements[index];

        // Ensure final update of celestial coordinates for start and end points
        if (this.advancedSolutionMatrix) {
          // Get new RA/Dec for start point
          const startCoords = this.boundCalculateCoordinatesAtPoint(measurement.startX, measurement.startY);
          if (startCoords) {
            measurement.startRa = startCoords.ra;
            measurement.startDec = startCoords.dec;
          }

          // Get new RA/Dec for end point
          const endCoords = this.boundCalculateCoordinatesAtPoint(measurement.endX, measurement.endY);
          if (endCoords) {
            measurement.endRa = endCoords.ra;
            measurement.endDec = endCoords.dec;
          }

          // Always recalculate based on new coordinates
          // This ensures honest representation of the actual measurement
          if (measurement.startRa !== null && measurement.endRa !== null) {
            const angularDistance = this.astroUtilsService.calculateAngularDistance(
              measurement.startRa,
              measurement.startDec,
              measurement.endRa,
              measurement.endDec
            );

            // Use consistent stable formatting for angular distances
            measurement.distance = this.astroUtilsService.formatAngularDistance(angularDistance);
          }

          // Force change detection to ensure updates are visible
          this.cdRef.detectChanges();
        }
      }
    }

    // Clean up event listeners
    // Using RxJS streams for handling drag events now
    this._shapeDragEnd$.next(event);

    // Reset drag state
    this._dragInProgress = false;
    this.isDraggingPoint = null;
    this.dragStartX = null;
    this.dragStartY = null;

    // Reset debounce timer
    this._lastCoordUpdateTime = 0;
  }

  /**
   * Start dragging the current shape
   */
  handleCurrentShapeDragStart(event: MouseEvent, shapeType: "circle" | "rectangle"): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.measureStartPoint || !this.measureEndPoint) {
      return;
    }

    this.isDraggingPoint = "currentShape";
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;

    // Signal that dragging has started
    this._preventNextClick = true;

    // Trigger the drag start stream
    this._currentShapeDragStart$.next(event);
  }

  /**
   * Start touch-dragging the current shape
   */
  handleCurrentShapeTouchStart(event: TouchEvent, shapeType: "circle" | "rectangle"): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.measureStartPoint || !this.measureEndPoint || event.touches.length !== 1) {
      return;
    }

    const touch = event.touches[0];
    this.isDraggingPoint = "currentShape";
    this.dragStartX = touch.clientX;
    this.dragStartY = touch.clientY;

    // Signal that dragging has started
    this._preventNextClick = true;

    // Create a simulated mouse event for the drag handler
    const simulatedEvent = new MouseEvent('touchstart', {
      clientX: touch.clientX,
      clientY: touch.clientY,
      bubbles: true,
      cancelable: true,
      view: window
    });

    // Trigger the drag start stream with simulated mouse event
    this._currentShapeDragStart$.next(simulatedEvent);

    // Set up document-level touch handlers for the duration of this drag
    const touchMoveHandler = (moveEvent: TouchEvent) => {
      moveEvent.preventDefault();
      if (moveEvent.touches.length !== 1) return;

      const moveTouch = moveEvent.touches[0];

      // Create a simulated mouse event for move
      const simulatedMoveEvent = new MouseEvent('touchmove', {
        clientX: moveTouch.clientX,
        clientY: moveTouch.clientY,
        bubbles: true,
        cancelable: true,
        view: window
      });

      // Update the current shape position using the same logic as mouse
      this.handleCurrentShapeDragMove(simulatedMoveEvent);
    };

    const touchEndHandler = (endEvent: TouchEvent) => {
      // Create a simulated mouse event for end
      const simulatedEndEvent = new MouseEvent('touchend', {
        clientX: endEvent.changedTouches[0]?.clientX || touch.clientX,
        clientY: endEvent.changedTouches[0]?.clientY || touch.clientY,
        bubbles: true,
        cancelable: true,
        view: window
      });

      // Process the touch end as if it were a mouse up
      this.handleCurrentShapeDragEnd(simulatedEndEvent);

      // Clean up event listeners
      document.removeEventListener('touchmove', touchMoveHandler);
      document.removeEventListener('touchend', touchEndHandler);
    };

    // Add event listeners for the duration of this drag
    document.addEventListener('touchmove', touchMoveHandler, { passive: false });
    document.addEventListener('touchend', touchEndHandler, { passive: false });
  }

  /**
   * Handle current shape drag movement
   */
  handleCurrentShapeDragMove(event: MouseEvent): void {
    if (!this.isDraggingPoint || !this._dragInProgress || this.isDraggingPoint !== "currentShape") {
      return;
    }

    if (!this.measureStartPoint || !this.measureEndPoint || !this.dragStartX || !this.dragStartY) {
      return;
    }

    // Calculate how far the mouse has moved
    const deltaX = event.clientX - this.dragStartX;
    const deltaY = event.clientY - this.dragStartY;

    // Update both points of the current measurement
    this.measureStartPoint.x += deltaX;
    this.measureStartPoint.y += deltaY;
    this.measureEndPoint.x += deltaX;
    this.measureEndPoint.y += deltaY;

    // Update the drag start point for the next move event
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;

    // Update boundary status during drag in real-time
    this.updateBoundaryStatus();

    // Update coordinates in real-time during drag, with debouncing
    // Only update if we have solution data and enough time has passed since last update
    const now = Date.now();
    if (this.advancedSolutionMatrix && (now - this._lastCoordUpdateTime > this.COORD_UPDATE_DEBOUNCE_MS)) {
      this._lastCoordUpdateTime = now;

      // Run in ngZone to ensure Angular detects the changes
      this.ngZone.run(() => {
        // Get new RA/Dec for start point
        const startCoords = this.boundCalculateCoordinatesAtPoint(this.measureStartPoint.x, this.measureStartPoint.y);
        if (startCoords) {
          this.measureStartPoint.ra = startCoords.ra;
          this.measureStartPoint.dec = startCoords.dec;
        }

        // Get new RA/Dec for end point
        const endCoords = this.boundCalculateCoordinatesAtPoint(this.measureEndPoint.x, this.measureEndPoint.y);
        if (endCoords) {
          this.measureEndPoint.ra = endCoords.ra;
          this.measureEndPoint.dec = endCoords.dec;
        }

        // Update the distance calculation
        if (this.measureStartPoint.ra !== null && this.measureEndPoint.ra !== null) {
          const angularDistance = this.astroUtilsService.calculateAngularDistance(
            this.measureStartPoint.ra,
            this.measureStartPoint.dec,
            this.measureEndPoint.ra,
            this.measureEndPoint.dec
          );

          // Use consistent stable formatting for angular distances
          this.measureDistance = this.astroUtilsService.formatAngularDistance(angularDistance);
        } else {
          // Calculate pixel distance as fallback
          const pixelDistance = this.calculateDistance(
            this.measureStartPoint.x,
            this.measureStartPoint.y,
            this.measureEndPoint.x,
            this.measureEndPoint.y
          );
          this.measureDistance = `${Math.round(pixelDistance)} px`;
        }

        // Force change detection
        this.cdRef.detectChanges();
      });
    }
  }

  /**
   * Handle end of current shape drag
   */
  handleCurrentShapeDragEnd(event: MouseEvent): void {
    if (!this._dragInProgress) {
      return;
    }

    // Update boundary status after dragging
    this.updateBoundaryStatus();

    event.preventDefault();

    // Ensure final update of celestial coordinates for the current measurement
    if (this.measureStartPoint && this.measureEndPoint && this.advancedSolutionMatrix) {
      // Recalculate start point RA/Dec
      const startCoords = this.boundCalculateCoordinatesAtPoint(this.measureStartPoint.x, this.measureStartPoint.y);
      if (startCoords) {
        this.measureStartPoint.ra = startCoords.ra;
        this.measureStartPoint.dec = startCoords.dec;
      }

      // Recalculate end point RA/Dec
      const endCoords = this.boundCalculateCoordinatesAtPoint(this.measureEndPoint.x, this.measureEndPoint.y);
      if (endCoords) {
        this.measureEndPoint.ra = endCoords.ra;
        this.measureEndPoint.dec = endCoords.dec;
      }

      // Always calculate distances on the fly based on the current coordinates
      else if (this.measureStartPoint.ra !== null && this.measureEndPoint.ra !== null) {
        const angularDistance = this.astroUtilsService.calculateAngularDistance(
          this.measureStartPoint.ra,
          this.measureStartPoint.dec,
          this.measureEndPoint.ra,
          this.measureEndPoint.dec
        );

        // Use consistent stable formatting for angular distances
        this.measureDistance = this.astroUtilsService.formatAngularDistance(angularDistance);
      }
    }

    // Clean up event listeners
    // Using RxJS streams for handling drag events now
    this._currentShapeDragEnd$.next(event);

    // Reset drag state
    this._dragInProgress = false;
    this.isDraggingPoint = null;
    this.dragStartX = null;
    this.dragStartY = null;

    // Reset debounce timer
    this._lastCoordUpdateTime = 0;

    // Send the updated measurement data
    if (this.measureStartPoint && this.measureEndPoint && this.measureDistance) {
      // Calculate midpoint for label positioning
      const midX = (this.measureStartPoint.x + this.measureEndPoint.x) / 2;
      const midY = (this.measureStartPoint.y + this.measureEndPoint.y) / 2;

      const currentMeasurement: MeasurementData = {
        startX: this.measureStartPoint.x,
        startY: this.measureStartPoint.y,
        endX: this.measureEndPoint.x,
        endY: this.measureEndPoint.y,
        midX: midX,
        midY: midY,
        distance: this.measureDistance,
        timestamp: Date.now(),
        startRa: this.measureStartPoint.ra,
        startDec: this.measureStartPoint.dec,
        endRa: this.measureEndPoint.ra,
        endDec: this.measureEndPoint.dec,
        startLabelX: 0,
        startLabelY: 0,
        endLabelX: 0,
        endLabelY: 0,
        showCircle: this.showCurrentCircle,
        showRectangle: this.showCurrentRectangle
      };

      // Calculate label positions
      this.updateCoordinateLabelPositions(currentMeasurement);

      // Emit the updated measurement
      this.measurementComplete.emit(currentMeasurement);
    }
  }

  /**
   * Toggle circle visualization for a measurement
   */
  toggleCircle(event: MouseEvent, index: number): void {
    event.preventDefault();
    event.stopPropagation();

    // Explicitly stop propagation to prevent parent elements from handling the event
    event.stopImmediatePropagation();

    // Prevent click from propagating to parent containers
    this._preventNextClick = true;

    if (index >= 0 && index < this.previousMeasurements.length) {
      const measurement = this.previousMeasurements[index];
      measurement.showCircle = !measurement.showCircle;

      // If enabling circle, disable rectangle
      if (measurement.showCircle) {
        measurement.showRectangle = false;

        // Also update the current defaults for new measurements
        this.showCurrentCircle = true;
        this.showCurrentRectangle = false;
      } else if (!measurement.showRectangle) {
        // If both are now disabled, update the current defaults
        this.showCurrentCircle = false;
        this.showCurrentRectangle = false;
      }

      // Save the shape preference to cookie
      this.saveMeasurementShapePreference();

      // Force change detection cycle with a meaningful operation
      this.windowRefService.utilsService.delay(0).subscribe(() => {
        // Circle visualization toggled for measurement
      });
    }
  }

  /**
   * Toggle rectangle visualization for a measurement
   */
  toggleRectangle(event: MouseEvent, index: number): void {
    event.preventDefault();
    event.stopPropagation();

    // Explicitly stop propagation to prevent parent elements from handling the event
    event.stopImmediatePropagation();

    // Prevent click from propagating to parent containers
    this._preventNextClick = true;

    if (index >= 0 && index < this.previousMeasurements.length) {
      const measurement = this.previousMeasurements[index];
      measurement.showRectangle = !measurement.showRectangle;

      // If enabling rectangle, disable circle
      if (measurement.showRectangle) {
        measurement.showCircle = false;

        // Also update the current defaults for new measurements
        this.showCurrentRectangle = true;
        this.showCurrentCircle = false;
      } else if (!measurement.showCircle) {
        // If both are now disabled, update the current defaults
        this.showCurrentRectangle = false;
        this.showCurrentCircle = false;
      }

      // Save the shape preference to cookie
      this.saveMeasurementShapePreference();

      // Force change detection cycle with a meaningful operation
      this.windowRefService.utilsService.delay(0).subscribe(() => {
        // Rectangle visualization toggled for measurement
      });
    }
  }

  /**
   * Toggle circle visualization for current measurement
   */
  toggleCurrentCircle(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    // Explicitly stop propagation to prevent parent elements from handling the event
    event.stopImmediatePropagation();

    // Prevent click from propagating to parent containers
    this._preventNextClick = true;

    // Toggle the circle visualization
    this.showCurrentCircle = !this.showCurrentCircle;

    // If circle is enabled, disable rectangle
    if (this.showCurrentCircle) {
      this.showCurrentRectangle = false;
    }

    // Save preference to cookie
    this.saveMeasurementShapePreference();

    // Force change detection cycle with a meaningful operation
    this.windowRefService.utilsService.delay(0).subscribe(() => {
      // Current circle visualization toggled
    });
  }

  /**
   * Toggle rectangle visualization for current measurement
   */
  toggleCurrentRectangle(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    // Explicitly stop propagation to prevent parent elements from handling the event
    event.stopImmediatePropagation();

    // Prevent click from propagating to parent containers
    this._preventNextClick = true;

    // Toggle the rectangle visualization
    this.showCurrentRectangle = !this.showCurrentRectangle;

    // If rectangle is enabled, disable circle
    if (this.showCurrentRectangle) {
      this.showCurrentCircle = false;
    }

    // Save preference to cookie
    this.saveMeasurementShapePreference();

    // Force change detection cycle with a meaningful operation
    this.windowRefService.utilsService.delay(0).subscribe(() => {
      // Current rectangle visualization toggled
    });
  }

  /**
   * Clear all measurements with confirmation dialog
   */
  clearAllMeasurements(): void {
    if (this.previousMeasurements.length === 0) {
      return; // Nothing to clear
    }

    // Open confirmation dialog
    const modalRef = this.modalService.open(ConfirmationDialogComponent, {
      centered: true,
      backdrop: "static"
    });

    // Configure dialog
    modalRef.componentInstance.title = this.translateService.instant("Clear all measurements");
    modalRef.componentInstance.message = this.translateService.instant(
      "This action cannot be undone."
    );
    modalRef.componentInstance.confirmLabel = this.translateService.instant("Clear all");

    // Subscribe to dialog result
    modalRef.result.then(
      () => {
        // Modal closed with confirm button
        this.previousMeasurements = [];

        // Remove the measurements parameter from the URL without exiting fullscreen
        if (this.isBrowser) {
          try {
            // Get the current URL and preserve the hash (important for fullscreen view)
            const currentUrl = window.location.href;
            const hash = currentUrl.includes("#") ? "#" + currentUrl.split("#")[1] : "";

            // Create a URL tree without the measurements parameter
            const urlTree = this.router.createUrlTree([], {
              relativeTo: this.activatedRoute,
              queryParams: { measurements: null },
              queryParamsHandling: "merge"
            });

            // Update the browser URL without navigation
            window.history.replaceState({}, '', window.location.origin + urlTree.toString() + hash);
          } catch (error) {
            console.error("Failed to update URL:", error);
          }
        }
      },
      () => {
        // Modal dismissed, do nothing
      }
    );
  }

  /**
   * Delete a specific measurement with confirmation dialog
   */
  deleteMeasurement(event: MouseEvent, index: number): void {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    // Prevent click from propagating to parent containers
    this._preventNextClick = true;

    // Open confirmation dialog
    const modalRef = this.modalService.open(ConfirmationDialogComponent, {
      centered: true,
      backdrop: "static"
    });

    // Configure dialog
    modalRef.componentInstance.title = this.translateService.instant("Delete measurement");
    modalRef.componentInstance.message = this.translateService.instant(
      "This action cannot be undone."
    );
    modalRef.componentInstance.confirmLabel = this.translateService.instant("Delete");

    // Subscribe to dialog result
    modalRef.result.then(
      () => {
        // Modal closed with confirm button
        // Remove the measurement
        this.previousMeasurements.splice(index, 1);

        // Update boundary status after deletion
        this.updateBoundaryStatus();
      },
      () => {
        // Modal dismissed, do nothing
      }
    );
  }

  /**
   * Calculate display positions for coordinate labels with collision detection
   */
  updateCoordinateLabelPositions(measurement: MeasurementData): void {
    // Calculate the angle of the line
    const angle = Math.atan2(measurement.endY - measurement.startY, measurement.endX - measurement.startX);

    // Set offset parameters
    const pointRadius = 6;
    const baseLabelDistance = 24;
    const startLabelDistance = baseLabelDistance;
    const endLabelDistance = baseLabelDistance * 1.5;

    // Calculate initial positions based on angle
    // Start with the basic geometric positioning

    // Calculate how horizontal the line is
    const absAngle = Math.abs(angle);
    const horizontalness = Math.min(
      Math.abs(absAngle),
      Math.abs(absAngle - Math.PI)
    );

    // Determine if line is nearly horizontal or vertical
    const isNearlyHorizontal = horizontalness < Math.PI / 8;
    const isNearlyVertical = Math.abs(absAngle - Math.PI / 2) < Math.PI / 12;

    // Calculate the diagonal factor
    const diagonalFactor = Math.abs(Math.sin(2 * angle)) / 1.0;

    // Calculate distances with boosts
    const startVerticalBoost = startLabelDistance * 0.8 * diagonalFactor;
    const endVerticalBoost = endLabelDistance * 0.8 * diagonalFactor;

    let startExtraDistance = 0;
    let endExtraDistance = 0;

    if (isNearlyHorizontal) {
      const horizontalFactor = 1 - (horizontalness / (Math.PI / 8));
      startExtraDistance = startLabelDistance * 3.5 * horizontalFactor + startVerticalBoost;
      endExtraDistance = endLabelDistance * 3.5 * horizontalFactor + endVerticalBoost;
    } else {
      startExtraDistance = startVerticalBoost;
      endExtraDistance = endVerticalBoost;
    }

    // Calculate initial positions
    measurement.startLabelX = measurement.startX - (startLabelDistance + pointRadius + startExtraDistance) * Math.cos(angle);
    measurement.startLabelY = measurement.startY - (startLabelDistance + pointRadius + startExtraDistance) * Math.sin(angle);

    measurement.endLabelX = measurement.endX + (endLabelDistance + pointRadius + endExtraDistance) * Math.cos(angle);
    measurement.endLabelY = measurement.endY + (endLabelDistance + pointRadius + endExtraDistance) * Math.sin(angle);

    // For vertical lines, add horizontal offset
    if (isNearlyVertical) {
      const horizontalOffset = 15;
      if (angle > 0) { // Line pointing downward
        measurement.startLabelX -= horizontalOffset;
        measurement.endLabelX += horizontalOffset;
      } else { // Line pointing upward
        measurement.startLabelX += horizontalOffset;
        measurement.endLabelX -= horizontalOffset;
      }
    }

    // For rectangle mode, we now need to check if labels will collide with dimension labels
    // Approximate where dimension labels will be (we don't have actual references to them here)

    // Estimate label dimensions - these are approximate values
    const coordLabelWidth = 150;  // RA/Dec label width
    const coordLabelHeight = 20;  // RA/Dec label height
    const dimLabelWidth = 60;     // Dimension label width
    const dimLabelHeight = 20;    // Dimension label height

    // Create bounding boxes for our labels
    const labels: LabelBoundingBox[] = [
      // 1. Start point coordinates label
      {
        x: measurement.startLabelX - coordLabelWidth / 2,
        y: measurement.startLabelY - coordLabelHeight / 2,
        width: coordLabelWidth,
        height: coordLabelHeight,
        priority: 2,  // Medium priority
        type: "point"
      },
      // 2. End point coordinates label
      {
        x: measurement.endLabelX - coordLabelWidth / 2,
        y: measurement.endLabelY - coordLabelHeight / 2,
        width: coordLabelWidth,
        height: coordLabelHeight,
        priority: 2,  // Medium priority
        type: "point"
      }
    ];

    // 3. Add width dimension label (horizontal) - positioned at midpoint of X, below the rectangle
    const widthLabelX = (Math.min(measurement.startX, measurement.endX) +
      Math.abs(measurement.endX - measurement.startX) / 2) - dimLabelWidth / 2;
    const widthLabelY = Math.max(measurement.startY, measurement.endY) + 20;

    labels.push({
      x: widthLabelX,
      y: widthLabelY,
      width: dimLabelWidth,
      height: dimLabelHeight,
      priority: 1,  // Higher priority (less likely to move)
      type: "dimension"
    });

    // 4. Add height dimension label (vertical) - positioned to the right of the rectangle
    const heightLabelX = Math.max(measurement.startX, measurement.endX) + 20;
    const heightLabelY = (Math.min(measurement.startY, measurement.endY) +
      Math.abs(measurement.endY - measurement.startY) / 2) - dimLabelHeight / 2;

    labels.push({
      x: heightLabelX,
      y: heightLabelY,
      width: dimLabelWidth,
      height: dimLabelHeight,
      priority: 1,  // Higher priority
      type: "dimension"
    });

    // Perform collision detection and resolution
    // We only need to check the first two labels (coord labels) against the others
    for (let i = 0; i < 2; i++) {  // Coordinate labels
      for (let j = 2; j < labels.length; j++) {  // Dimension labels
        if (this.doLabelsOverlap(labels[i], labels[j])) {
          // If collision detected, move the coordinate label
          const newPos = this.resolveCollision(labels[i], labels[j]);

          // Update the label position
          if (i === 0) {  // Start label
            measurement.startLabelX = newPos.x + coordLabelWidth / 2;
            measurement.startLabelY = newPos.y + coordLabelHeight / 2;
          } else {  // End label
            measurement.endLabelX = newPos.x + coordLabelWidth / 2;
            measurement.endLabelY = newPos.y + coordLabelHeight / 2;
          }

          // Update the label's position in our array for subsequent collision checks
          labels[i].x = newPos.x;
          labels[i].y = newPos.y;
        }
      }
    }

    // Also check if the two coordinate labels collide with each other
    if (this.doLabelsOverlap(labels[0], labels[1])) {
      const newPos = this.resolveCollision(labels[0], labels[1]);

      // We move the first label as it has the same priority as the second
      measurement.startLabelX = newPos.x + coordLabelWidth / 2;
      measurement.startLabelY = newPos.y + coordLabelHeight / 2;
    }
  }

  /**
   * Format coordinates in a compact display format
   */
  formatCoordinatesCompact(ra: number | null, dec: number | null): string {
    // If either coordinate is null, return empty string
    if (ra === null || dec === null) {
      return "";
    }

    // Convert ra/dec to formatted strings
    const raHours = Math.floor(ra);
    const raMinutes = Math.floor((ra - raHours) * 60);
    const raSeconds = Math.floor(((ra - raHours) * 60 - raMinutes) * 60);

    const decDegrees = Math.floor(Math.abs(dec));
    const decMinutes = Math.floor((Math.abs(dec) - decDegrees) * 60);
    const decSeconds = Math.floor(((Math.abs(dec) - decDegrees) * 60 - decMinutes) * 60);

    const sign = dec >= 0 ? "+" : "-";

    return `${raHours.toString().padStart(2, "0")}h ${raMinutes.toString().padStart(2, "0")}m ${raSeconds.toString().padStart(2, "0")}s, ${sign}${decDegrees.toString().padStart(2, "0")}° ${decMinutes.toString().padStart(2, "0")}' ${decSeconds.toString().padStart(2, "0")}"`;
  }

  /**
   * Get horizontal celestial distance for rectangle
   *
   * @param measurement Optional measurement data containing additional information
   */
  getHorizontalCelestialDistance(x1: number, y: number, x2: number, measurement?: MeasurementData | MeasurementPresetInterface): string {
    // If no valid advanced solution, return empty (template will show px)
    if (!this.isValidSolutionMatrix()) {
      return "";
    }

    // Get the coordinates at both points
    const startCoords = this.boundCalculateCoordinatesAtPoint(x1, y);
    const endCoords = this.boundCalculateCoordinatesAtPoint(x2, y);

    // If we have valid coordinates, calculate angular distance
    if (startCoords && endCoords) {
      const angularDistance = this.astroUtilsService.calculateAngularDistance(
        startCoords.ra,
        startCoords.dec,
        endCoords.ra,
        endCoords.dec
      );

      // Convert to arcseconds
      const arcseconds = angularDistance * 3600;

      // Format using standardized astronomical notation
      return this.astroUtilsService.formatAstronomicalAngle(arcseconds);
    }

    // If we couldn't calculate celestial coordinates, return empty string
    // The template will fall back to showing pixel distance
    return "";
  }

  /**
   * Get vertical celestial distance for rectangle
   *
   * @param measurement Optional measurement data containing additional information
   */
  getVerticalCelestialDistance(x: number, y1: number, y2: number, measurement?: MeasurementData | MeasurementPresetInterface): string {
    // If no valid advanced solution, return empty (template will show px)
    if (!this.isValidSolutionMatrix()) {
      return "";
    }

    // Get the coordinates at both points
    const startCoords = this.boundCalculateCoordinatesAtPoint(x, y1);
    const endCoords = this.boundCalculateCoordinatesAtPoint(x, y2);

    // If we have valid coordinates, calculate angular distance
    if (startCoords && endCoords) {
      const angularDistance = this.astroUtilsService.calculateAngularDistance(
        startCoords.ra,
        startCoords.dec,
        endCoords.ra,
        endCoords.dec
      );

      // Convert to arcseconds
      const arcseconds = angularDistance * 3600;

      // Format using standardized astronomical notation
      return this.astroUtilsService.formatAstronomicalAngle(arcseconds);
    }

    // If we couldn't calculate celestial coordinates, return empty string
    // The template will fall back to showing pixel distance
    return "";
  }

  /**
   * Calculate positions for start point coordinates label
   */
  calculateStartLabelX(): number {
    if (!this.measureStartPoint || !this.measureEndPoint) {
      return 0;
    }

    // Calculate the angle of the line
    const angle = Math.atan2(this.measureEndPoint.y - this.measureStartPoint.y,
      this.measureEndPoint.x - this.measureStartPoint.x);

    // Set offset parameters
    const pointRadius = 6;
    const labelDistance = 24;

    // Calculate how horizontal the line is
    const absAngle = Math.abs(angle);
    const horizontalness = Math.min(
      Math.abs(absAngle), // Angle from positive x-axis
      Math.abs(absAngle - Math.PI) // Angle from negative x-axis
    );

    // Expand what constitutes "nearly horizontal" to include slacker angles
    const isNearlyHorizontal = horizontalness < Math.PI / 8; // Within ~22.5 degrees of horizontal (more forgiving)
    const isNearlyVertical = Math.abs(absAngle - Math.PI / 2) < Math.PI / 12; // Within 15 degrees of vertical

    // Calculate extra distance based on how horizontal the line is
    let extraDistance = 0;

    // Calculate a diagonal factor - maximum at 45 and 135 degrees, minimum at 0 or 90 degrees
    // Math.abs ensures we get a positive factor regardless of the line direction
    // This gives us a value between 0 and 1, with 1 being at 45 or 135 degrees
    const diagonalFactor = Math.abs(Math.sin(2 * angle)) / 1.0; // abs(sin(2x)) peaks at 45 and 135 degrees

    // Add some vertical offset based on diagonal factor
    const verticalBoost = labelDistance * 0.8 * diagonalFactor; // 0.8x gives a more noticeable boost

    if (isNearlyHorizontal) {
      // For nearly horizontal lines, add extra distance that scales with horizontalness
      const horizontalFactor = 1 - (horizontalness / (Math.PI / 8)); // 0 to 1 factor, adjusted for wider angle
      extraDistance = labelDistance * 3.5 * horizontalFactor + verticalBoost; // Scale up with vertical boost
    } else {
      // For non-horizontal lines, still add the vertical boost
      extraDistance = verticalBoost;
    }

    // For the start point, place in the opposite direction of the line
    const offsetX = (labelDistance + pointRadius + extraDistance) * Math.cos(angle);
    let startLabelX = this.measureStartPoint.x - offsetX;

    // For vertical lines, add a horizontal offset for better visibility
    if (isNearlyVertical) {
      const horizontalOffset = 15;
      if (angle > 0) { // Line pointing downward
        startLabelX -= horizontalOffset;
      } else { // Line pointing upward
        startLabelX += horizontalOffset;
      }
    }

    return startLabelX;
  }

  /**
   * Calculate positions for start point coordinates label
   */
  calculateStartLabelY(): number {
    if (!this.measureStartPoint || !this.measureEndPoint) {
      return 0;
    }

    // Calculate the angle of the line
    const angle = Math.atan2(this.measureEndPoint.y - this.measureStartPoint.y,
      this.measureEndPoint.x - this.measureStartPoint.x);

    // Set offset parameters
    const pointRadius = 6;
    const labelDistance = 24;

    // Calculate how horizontal the line is
    const absAngle = Math.abs(angle);
    const horizontalness = Math.min(
      Math.abs(absAngle), // Angle from positive x-axis
      Math.abs(absAngle - Math.PI) // Angle from negative x-axis
    );

    // Calculate extra distance based on how horizontal the line is
    let extraDistance = 0;

    // Calculate a diagonal factor - maximum at 45 and 135 degrees, minimum at 0 or 90 degrees
    // Math.abs ensures we get a positive factor regardless of the line direction
    // This gives us a value between 0 and 1, with 1 being at 45 or 135 degrees
    const diagonalFactor = Math.abs(Math.sin(2 * angle)) / 1.0; // abs(sin(2x)) peaks at 45 and 135 degrees

    // Add some vertical offset based on diagonal factor
    const verticalBoost = labelDistance * 0.8 * diagonalFactor; // 0.8x gives a more noticeable boost

    if (horizontalness < Math.PI / 8) { // Within 22.5 degrees of horizontal
      // For nearly horizontal lines, add extra distance that scales with horizontalness
      const horizontalFactor = 1 - (horizontalness / (Math.PI / 8)); // 0 to 1 factor, adjusted for wider angle
      extraDistance = labelDistance * 3.5 * horizontalFactor + verticalBoost; // Scale up with vertical boost
    } else {
      // For non-horizontal lines, still add the vertical boost
      extraDistance = verticalBoost;
    }

    // For the start point, place in the opposite direction of the line
    return this.measureStartPoint.y - (labelDistance + pointRadius + extraDistance) * Math.sin(angle);
  }

  /**
   * Calculate positions for end point coordinates label
   */
  calculateEndLabelX(): number {
    if (!this.measureStartPoint || !this.measureEndPoint) {
      return 0;
    }

    // Calculate the angle of the line
    const angle = Math.atan2(this.measureEndPoint.y - this.measureStartPoint.y,
      this.measureEndPoint.x - this.measureStartPoint.x);

    // Set offset parameters
    const pointRadius = 6;
    const labelDistance = 24;

    // Calculate how horizontal the line is
    const absAngle = Math.abs(angle);
    const horizontalness = Math.min(
      Math.abs(absAngle), // Angle from positive x-axis
      Math.abs(absAngle - Math.PI) // Angle from negative x-axis
    );

    // Expand what constitutes "nearly horizontal" to include slacker angles
    const isNearlyHorizontal = horizontalness < Math.PI / 8; // Within ~22.5 degrees of horizontal (more forgiving)
    const isNearlyVertical = Math.abs(absAngle - Math.PI / 2) < Math.PI / 12; // Within 15 degrees of vertical

    // Calculate extra distance based on how horizontal the line is
    let extraDistance = 0;

    // Calculate a diagonal factor - maximum at 45 and 135 degrees, minimum at 0 or 90 degrees
    // Math.abs ensures we get a positive factor regardless of the line direction
    // This gives us a value between 0 and 1, with 1 being at 45 or 135 degrees
    const diagonalFactor = Math.abs(Math.sin(2 * angle)) / 1.0; // abs(sin(2x)) peaks at 45 and 135 degrees

    // Add some vertical offset based on diagonal factor
    const verticalBoost = labelDistance * 0.8 * diagonalFactor; // 0.8x gives a more noticeable boost

    if (isNearlyHorizontal) {
      // For nearly horizontal lines, add extra distance that scales with horizontalness
      const horizontalFactor = 1 - (horizontalness / (Math.PI / 8)); // 0 to 1 factor, adjusted for wider angle
      extraDistance = labelDistance * 3.5 * horizontalFactor + verticalBoost; // Scale up with vertical boost
    } else {
      // For non-horizontal lines, still add the vertical boost
      extraDistance = verticalBoost;
    }

    // For the end point, place in the same direction as the line
    let endLabelX = this.measureEndPoint.x + (labelDistance + pointRadius + extraDistance) * Math.cos(angle);

    // For vertical lines, add a horizontal offset for better visibility
    if (isNearlyVertical) {
      const horizontalOffset = 15;
      if (angle > 0) { // Line pointing downward
        endLabelX += horizontalOffset;
      } else { // Line pointing upward
        endLabelX -= horizontalOffset;
      }
    }

    return endLabelX;
  }

  /**
   * Calculate positions for end point coordinates label
   */
  calculateEndLabelY(): number {
    if (!this.measureStartPoint || !this.measureEndPoint) {
      return 0;
    }

    // Calculate the angle of the line
    const angle = Math.atan2(this.measureEndPoint.y - this.measureStartPoint.y,
      this.measureEndPoint.x - this.measureStartPoint.x);

    // Set offset parameters
    const pointRadius = 6;
    const labelDistance = 24;

    // Calculate how horizontal the line is
    const absAngle = Math.abs(angle);
    const horizontalness = Math.min(
      Math.abs(absAngle), // Angle from positive x-axis
      Math.abs(absAngle - Math.PI) // Angle from negative x-axis
    );

    // Calculate extra distance based on how horizontal the line is
    let extraDistance = 0;

    // Calculate a diagonal factor - maximum at 45 and 135 degrees, minimum at 0 or 90 degrees
    // Math.abs ensures we get a positive factor regardless of the line direction
    // This gives us a value between 0 and 1, with 1 being at 45 or 135 degrees
    const diagonalFactor = Math.abs(Math.sin(2 * angle)) / 1.0; // abs(sin(2x)) peaks at 45 and 135 degrees

    // Add some vertical offset based on diagonal factor
    const verticalBoost = labelDistance * 0.8 * diagonalFactor; // 0.8x gives a more noticeable boost

    if (horizontalness < Math.PI / 8) { // Within 22.5 degrees of horizontal
      // For nearly horizontal lines, add extra distance that scales with horizontalness
      const horizontalFactor = 1 - (horizontalness / (Math.PI / 8)); // 0 to 1 factor, adjusted for wider angle
      extraDistance = labelDistance * 3.5 * horizontalFactor + verticalBoost; // Scale up with vertical boost
    } else {
      // For non-horizontal lines, still add the vertical boost
      extraDistance = verticalBoost;
    }

    // For the end point, place in the same direction as the line
    return this.measureEndPoint.y + (labelDistance + pointRadius + extraDistance) * Math.sin(angle);
  }

  /**
   * Exit measuring mode
   */
  exitMeasuring(): void {
    console.log("EXIT MEASURING MODE CALLED");

    // DIRECT APPROACH: Remove measurements parameter via window.history
    if (this.isBrowser) {
      try {
        // Get the current URL directly
        const location = this.windowRefService.nativeWindow.location;
        const currentUrl = new URL(location.href);

        console.log("MEASUREMENTS - BEFORE EXIT URL UPDATE:", currentUrl.toString());

        // Remove measurements parameter if it exists
        if (currentUrl.searchParams.has('measurements')) {
          // Remove the measurements parameter
          currentUrl.searchParams.delete('measurements');

          // Apply the change directly to history
          this.windowRefService.nativeWindow.history.replaceState({}, '', currentUrl.toString());

          console.log("MEASUREMENTS - AFTER EXIT URL UPDATE:", this.windowRefService.nativeWindow.location.href);
        }
      } catch (e) {
        console.error("Error removing measurements parameter from URL:", e);
      }
    }

    // Clear measurements and exit
    this.previousMeasurements = [];
    this.cdRef.markForCheck();
    this.cdRef.detectChanges(); // Force immediate update

    // Emit event to notify parent component
    this.exitMeasuringMode.emit();
  }

  /** The cached image element for boundary checking */
  cachedImageElement: HTMLElement | null = null;

  /** Flag for current measurement boundary check */
  isCurrentMeasurementOutsideBoundaries: boolean = false;

  /**
   * Check if a point is outside the image boundaries
   * The method is prefixed with underscore but is still used directly in template
   */
  _checkPointOutsideBoundaries(x: number, y: number): boolean {
    if (!this.isBrowser || !this.cachedImageElement) {
      return false;
    }

    const imageRect = this.cachedImageElement.getBoundingClientRect();
    return (
      x < imageRect.left ||
      x > imageRect.right ||
      y < imageRect.top ||
      y > imageRect.bottom
    );
  }

  /**
   * Public method to check if a point is outside the image boundaries
   * Used by the template for current measurements
   */
  isPointOutsideImageBoundaries(x: number, y: number): boolean {
    return this._checkPointOutsideBoundaries(x, y);
  }

  /**
   * Updates boundary status flags for all measurements
   * Call this whenever points move, not during every change detection cycle
   */
  updateBoundaryStatus(): void {
    // Check current measurement
    if (this.measureStartPoint && this.measureEndPoint) {
      this.isCurrentMeasurementOutsideBoundaries =
        this._checkPointOutsideBoundaries(this.measureStartPoint.x, this.measureStartPoint.y) ||
        this._checkPointOutsideBoundaries(this.measureEndPoint.x, this.measureEndPoint.y);
    } else {
      this.isCurrentMeasurementOutsideBoundaries = false;
    }

    // Check each previous measurement and update its outOfBounds property
    this.previousMeasurements.forEach(m => {
      m.outOfBounds =
        this._checkPointOutsideBoundaries(m.startX, m.startY) ||
        this._checkPointOutsideBoundaries(m.endX, m.endY);
    });

    // Ensure change detection runs
    this.cdRef.markForCheck();
  }


  /**
   * Share measurements by encoding them in URL
   */
  shareMeasurements(): void {
    if (!this.isBrowser || this.previousMeasurements.length === 0) {
      return;
    }

    try {
      // Encode the measurements
      const encodedData = this.encodeMeasurementsForUrl(this.previousMeasurements);

      // DIRECT APPROACH: Get the current URL through the window reference
      const location = this.windowRefService.nativeWindow.location;
      const currentUrl = new URL(location.href);

      console.log("MEASUREMENTS - BEFORE URL UPDATE:", currentUrl.toString());

      // Set the measurements parameter directly
      currentUrl.searchParams.set('measurements', encodedData);

      // Apply the change directly to the URL without navigation
      this.windowRefService.nativeWindow.history.replaceState({}, '', currentUrl.toString());

      console.log("MEASUREMENTS - AFTER URL UPDATE:", this.windowRefService.nativeWindow.location.href);

      // Copy the updated URL to clipboard with a slight delay to ensure URL change is processed
      this.windowRefService.utilsService.delay(200).subscribe(() => {
        // Get the final URL directly from the window location
        const shareUrl = this.windowRefService.nativeWindow.location.href;

        // Use the WindowRefService's copyToClipboard method which handles fallbacks properly
        this.windowRefService.copyToClipboard(shareUrl)
          .then(success => {
            if (success) {
              this.popNotificationsService.success(
                this.translateService.instant("Share URL copied to clipboard. Send this URL to share your measurements.")
              );
            } else {
              // Still provide useful feedback if clipboard access failed but URL was updated
              this.popNotificationsService.info(
                this.translateService.instant("Measurements URL has been updated. You can now share this page.")
              );
            }
          })
          .catch(error => {
            console.error("Failed to copy to clipboard:", error);
            // Still provide useful feedback even if clipboard access failed
            this.popNotificationsService.info(
              this.translateService.instant("Measurements URL has been updated. You can now share this page.")
            );
          });
      });
    } catch (error) {
      console.error("Failed to share measurements:", error);
      this.popNotificationsService.error(
        this.translateService.instant("Failed to create share URL.")
      );
    }
  }

  /**
   * Show help dialog with measuring tool instructions
   */
  showHelp(): void {
    if (!this.isBrowser) {
      return;
    }

    this.offcanvasService.open(this.helpContentRef, {
      position: this.deviceService.offcanvasPosition(),
      panelClass: 'image-viewer-offcanvas help-offcanvas',
      backdropClass: 'image-viewer-offcanvas-backdrop'
    });
  }

  /**
   * Toggle the saved measurements panel visibility
   */
  toggleSavedMeasurements(event?: MouseEvent): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Check if user is logged in
    let isLoggedIn = false;
    this.currentUser$.pipe(take(1)).subscribe(user => {
      isLoggedIn = !!user;
    });

    if (!isLoggedIn) {
      return;
    }

    this.store$.dispatch(new ToggleSavedMeasurements());
  }

  /**
   * Open the saved measurements panel and pre-fill with current measurement
   */
  openSaveCurrentMeasurement(event?: MouseEvent): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Check if we have a valid advanced solution matrix needed for saving
    if (!this.isValidSolutionMatrix()) {
      this.popNotificationsService.error(
        this.translateService.instant(
          "Measurement presets cannot be saved on images without valid advanced plate-solving data"
        )
      );
      return;
    }

    // Check if user is logged in
    let isLoggedIn = false;
    this.currentUser$.pipe(take(1)).subscribe(user => {
      isLoggedIn = !!user;
    });

    if (!isLoggedIn) {
      return;
    }

    if (!this.measureStartPoint || !this.measureEndPoint || !this.measureDistance) {
      return;
    }

    // Generate a default name based on width x height if available (for rectangles)
    let defaultName = this.measureDistance; // Fallback

    // Calculate measurement length (needed for recreation)
    const length = this.calculateDistance(
      this.measureStartPoint.x,
      this.measureStartPoint.y,
      this.measureEndPoint.x,
      this.measureEndPoint.y
    );

    // Calculate width and height in arcseconds if we have celestial coordinates
    let widthArcseconds = null;
    let heightArcseconds = null;

    // Always calculate width and height regardless of display mode
    if (this.measureStartPoint.ra !== null && this.measureEndPoint.ra !== null &&
      this.measureStartPoint.dec !== null && this.measureEndPoint.dec !== null) {

      // For rectangular measurements, calculate width and height
      if (this.advancedSolutionMatrix) {
        // Calculate width in arcseconds (horizontal component)
        const minX = Math.min(this.measureStartPoint.x, this.measureEndPoint.x);
        const maxX = Math.max(this.measureStartPoint.x, this.measureEndPoint.x);
        const midY = (this.measureStartPoint.y + this.measureEndPoint.y) / 2;

        const leftCoords = this.boundCalculateCoordinatesAtPoint(minX, midY);
        const rightCoords = this.boundCalculateCoordinatesAtPoint(maxX, midY);

        if (leftCoords && rightCoords) {
          const angularWidth = this.astroUtilsService.calculateAngularDistance(
            leftCoords.ra, leftCoords.dec,
            rightCoords.ra, rightCoords.dec
          );

          // Convert to arcseconds
          widthArcseconds = angularWidth * 3600;
        }

        // Calculate height in arcseconds (vertical component)
        const minY = Math.min(this.measureStartPoint.y, this.measureEndPoint.y);
        const maxY = Math.max(this.measureStartPoint.y, this.measureEndPoint.y);
        const midX = (this.measureStartPoint.x + this.measureEndPoint.x) / 2;

        const topCoords = this.boundCalculateCoordinatesAtPoint(midX, minY);
        const bottomCoords = this.boundCalculateCoordinatesAtPoint(midX, maxY);

        if (topCoords && bottomCoords) {
          const angularHeight = this.astroUtilsService.calculateAngularDistance(
            topCoords.ra, topCoords.dec,
            bottomCoords.ra, bottomCoords.dec
          );

          // Convert to arcseconds
          heightArcseconds = angularHeight * 3600;
        }

        // Set the default name to width x height = diagonal using astronomical format
        if (widthArcseconds !== null && heightArcseconds !== null) {
          // Format using proper astronomical angle notation
          const widthFormatted = this.astroUtilsService.formatAstronomicalAngle(widthArcseconds);
          const heightFormatted = this.astroUtilsService.formatAstronomicalAngle(heightArcseconds);
          defaultName = `${widthFormatted} × ${heightFormatted} = ${this.measureDistance}`;
        }
      }
    }

    // Create simplified measurement data with just what's needed to recreate the measurement
    const measurementData: MeasurementData = {
      // We only need one of these coordinates if we recreate in the center
      startRa: this.measureStartPoint.ra,
      startDec: this.measureStartPoint.dec,
      endRa: this.measureEndPoint.ra,
      endDec: this.measureEndPoint.dec,

      // Width and height in arcseconds (for rectangular measurements)
      widthArcseconds: widthArcseconds,
      heightArcseconds: heightArcseconds,

      // Length in pixels needed to recreate the measurement
      length: length,

      // Formatted distance string
      distance: this.measureDistance,

      // Shape visualization preferences
      showCircle: this.showCurrentCircle,
      showRectangle: this.showCurrentRectangle,

      // Timestamp for sorting
      timestamp: Date.now(),

      // We need these fields for the interface, but they'll be recalculated on load
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      midX: 0,
      midY: 0,
      startLabelX: 0,
      startLabelY: 0,
      endLabelX: 0,
      endLabelY: 0
    };

    // Open the modal
    try {
      const modalRef = this.modalService.open(SaveMeasurementModalComponent, {
        keyboard: false
      });
      modalRef.componentInstance.measurementData = measurementData;
      modalRef.componentInstance.defaultName = defaultName;

      // Handle the result when the modal is closed
      modalRef.result.then(result => {
        this.currentUser$.pipe(take(1)).subscribe(user => {
          if (user && "id" in user) {
            // Create the base preset object
            const preset: MeasurementPresetInterface = {
              name: result.name,
              notes: result.notes,
              user: user && "id" in user ? user.id : null
            };

            // Only include width/height when they are valid measurements
            if (measurementData.widthArcseconds !== null && measurementData.widthArcseconds !== undefined) {
              preset.widthArcseconds = measurementData.widthArcseconds;
            }

            if (measurementData.heightArcseconds !== null && measurementData.heightArcseconds !== undefined) {
              preset.heightArcseconds = measurementData.heightArcseconds;
            }

            // Update the current measurement's name and notes for display
            this.newMeasurementName = result.name;
            this.saveMeasurementNotes = result.notes;

            // Dispatch action to save preset
            this.store$.dispatch(new CreateMeasurementPreset({ preset }));
          }
        });
      });
    } catch (error) {
      console.error("Error opening modal:", error);
    }
  }

  /**
   * Save a previous measurement directly to the presets
   */
  savePreviousMeasurement(event: MouseEvent, index: number): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Check if we have a valid advanced solution matrix needed for saving
    if (!this.isValidSolutionMatrix()) {
      this.popNotificationsService.error(
        this.translateService.instant(
          "Measurement presets cannot be saved on images without valid advanced plate-solving data"
        )
      );
      return;
    }

    // Check if user is logged in
    let isLoggedIn = false;
    this.currentUser$.pipe(take(1)).subscribe(user => {
      isLoggedIn = !!user;
    });

    if (!isLoggedIn) {
      return;
    }

    if (index >= 0 && index < this.previousMeasurements.length) {
      const originalMeasurement = this.previousMeasurements[index];

      // Generate a default name
      let defaultName = originalMeasurement.distance; // Fallback

      // Calculate measurement length (needed for recreation)
      const length = this.calculateDistance(
        originalMeasurement.startX,
        originalMeasurement.startY,
        originalMeasurement.endX,
        originalMeasurement.endY
      );

      // Calculate width and height in arcseconds if we have celestial coordinates
      let widthArcseconds = null;
      let heightArcseconds = null;

      // Always calculate width and height regardless of display mode
      if (originalMeasurement.startRa !== null && originalMeasurement.endRa !== null &&
        originalMeasurement.startDec !== null && originalMeasurement.endDec !== null) {

        // For rectangular measurements, calculate width and height
        if (this.advancedSolutionMatrix) {
          // Calculate width in arcseconds (horizontal component)
          const minX = Math.min(originalMeasurement.startX, originalMeasurement.endX);
          const maxX = Math.max(originalMeasurement.startX, originalMeasurement.endX);
          const midY = (originalMeasurement.startY + originalMeasurement.endY) / 2;

          const leftCoords = this.boundCalculateCoordinatesAtPoint(minX, midY);
          const rightCoords = this.boundCalculateCoordinatesAtPoint(maxX, midY);

          if (leftCoords && rightCoords) {
            const angularWidth = this.astroUtilsService.calculateAngularDistance(
              leftCoords.ra, leftCoords.dec,
              rightCoords.ra, rightCoords.dec
            );

            // Convert to arcseconds
            widthArcseconds = angularWidth * 3600;
          }

          // Calculate height in arcseconds (vertical component)
          const minY = Math.min(originalMeasurement.startY, originalMeasurement.endY);
          const maxY = Math.max(originalMeasurement.startY, originalMeasurement.endY);
          const midX = (originalMeasurement.startX + originalMeasurement.endX) / 2;

          const topCoords = this.boundCalculateCoordinatesAtPoint(midX, minY);
          const bottomCoords = this.boundCalculateCoordinatesAtPoint(midX, maxY);

          if (topCoords && bottomCoords) {
            const angularHeight = this.astroUtilsService.calculateAngularDistance(
              topCoords.ra, topCoords.dec,
              bottomCoords.ra, bottomCoords.dec
            );

            // Convert to arcseconds
            heightArcseconds = angularHeight * 3600;
          }

          // Set the default name to width x height = diagonal using astronomical format
          if (widthArcseconds !== null && heightArcseconds !== null) {
            // Format using proper astronomical angle notation
            const widthFormatted = this.astroUtilsService.formatAstronomicalAngle(widthArcseconds);
            const heightFormatted = this.astroUtilsService.formatAstronomicalAngle(heightArcseconds);

            // The diagonal measurement is already calculated and stored in measureDistance
            const diagonalFormatted = this.measureDistance || originalMeasurement?.distance;

            defaultName = `${widthFormatted} × ${heightFormatted} = ${diagonalFormatted}`;
          }
        }
      }

      // Create simplified measurement data with just what's needed to recreate the measurement
      const measurementData: MeasurementData = {
        // We only need one of these coordinates if we recreate in the center
        startRa: originalMeasurement.startRa,
        startDec: originalMeasurement.startDec,
        endRa: originalMeasurement.endRa,
        endDec: originalMeasurement.endDec,

        // Width and height in arcseconds (for rectangular measurements)
        widthArcseconds: widthArcseconds,
        heightArcseconds: heightArcseconds,

        // Length in pixels needed to recreate the measurement
        length: length,

        // Formatted distance string
        distance: originalMeasurement.distance,

        // Shape visualization preferences
        showCircle: originalMeasurement.showCircle,
        showRectangle: originalMeasurement.showRectangle,

        // Timestamp for sorting
        timestamp: Date.now(),

        // We need these fields for the interface, but they'll be recalculated on load
        startX: 0,
        startY: 0,
        endX: 0,
        endY: 0,
        midX: 0,
        midY: 0,
        startLabelX: 0,
        startLabelY: 0,
        endLabelX: 0,
        endLabelY: 0
      };

      // Open the modal
      try {
        const modalRef = this.modalService.open(SaveMeasurementModalComponent, {
          keyboard: false
        });
        modalRef.componentInstance.measurementData = measurementData;
        modalRef.componentInstance.defaultName = defaultName;

        // Handle the result when the modal is closed
        modalRef.result.then(result => {
          this.currentUser$.pipe(take(1)).subscribe(user => {
            if (user && "id" in user) {
              const preset: MeasurementPresetInterface = {
                name: result.name,
                notes: result.notes,
                user: user && "id" in user ? user.id : null
              };

              // Only include width/height when they are valid measurements
              if (measurementData.widthArcseconds !== null && measurementData.widthArcseconds !== undefined) {
                preset.widthArcseconds = measurementData.widthArcseconds;
              }

              if (measurementData.heightArcseconds !== null && measurementData.heightArcseconds !== undefined) {
                preset.heightArcseconds = measurementData.heightArcseconds;
              }

              // Dispatch action to save preset using NgRx
              this.store$.dispatch(new CreateMeasurementPreset({ preset }));
            }
          });
        });
      } catch (error) {
        console.error("Error opening modal:", error);
      }
    }
  }

  /**
   * Save the current measurement with the given name
   *
   * Note: This is used by the saved measurements panel form, not the modal.
   * For the save button on the measurement itself, see openSaveCurrentMeasurement.
   */
  saveMeasurement(): void {
    // Check if we have a valid advanced solution matrix needed for saving
    if (!this.isValidSolutionMatrix()) {
      this.popNotificationsService.error(
        this.translateService.instant(
          "Measurement presets cannot be saved on images without valid advanced plate-solving data"
        )
      );
      return;
    }

    // Check if user is logged in
    let isLoggedIn = false;
    this.currentUser$.pipe(take(1)).subscribe(user => {
      isLoggedIn = !!user;
    });

    if (!isLoggedIn) {
      return;
    }

    if (!this.newMeasurementName || !this.measureDistance || !this.measureStartPoint || !this.measureEndPoint) {
      return;
    }

    // Calculate measurement length (needed for recreation)
    const length = this.calculateDistance(
      this.measureStartPoint.x,
      this.measureStartPoint.y,
      this.measureEndPoint.x,
      this.measureEndPoint.y
    );

    // Calculate width and height in arcseconds if we have celestial coordinates
    let widthArcseconds = null;
    let heightArcseconds = null;

    if (this.measureStartPoint.ra !== null && this.measureEndPoint.ra !== null &&
      this.measureStartPoint.dec !== null && this.measureEndPoint.dec !== null &&
      this.showCurrentRectangle) {

      // For rectangular measurements, calculate width and height
      if (this.advancedSolutionMatrix) {
        // Calculate width in arcseconds (horizontal component)
        const minX = Math.min(this.measureStartPoint.x, this.measureEndPoint.x);
        const maxX = Math.max(this.measureStartPoint.x, this.measureEndPoint.x);
        const midY = (this.measureStartPoint.y + this.measureEndPoint.y) / 2;

        const leftCoords = this.boundCalculateCoordinatesAtPoint(minX, midY);
        const rightCoords = this.boundCalculateCoordinatesAtPoint(maxX, midY);

        if (leftCoords && rightCoords) {
          const angularWidth = this.astroUtilsService.calculateAngularDistance(
            leftCoords.ra, leftCoords.dec,
            rightCoords.ra, rightCoords.dec
          );

          // Convert to arcseconds
          widthArcseconds = angularWidth * 3600;
        }

        // Calculate height in arcseconds (vertical component)
        const minY = Math.min(this.measureStartPoint.y, this.measureEndPoint.y);
        const maxY = Math.max(this.measureStartPoint.y, this.measureEndPoint.y);
        const midX = (this.measureStartPoint.x + this.measureEndPoint.x) / 2;

        const topCoords = this.boundCalculateCoordinatesAtPoint(midX, minY);
        const bottomCoords = this.boundCalculateCoordinatesAtPoint(midX, maxY);

        if (topCoords && bottomCoords) {
          const angularHeight = this.astroUtilsService.calculateAngularDistance(
            topCoords.ra, topCoords.dec,
            bottomCoords.ra, bottomCoords.dec
          );

          // Convert to arcseconds
          heightArcseconds = angularHeight * 3600;
        }
      }
    }

    // Create simplified measurement data for saving
    const measurementData: MeasurementData = {
      // Celestial coordinates
      startRa: this.measureStartPoint.ra,
      startDec: this.measureStartPoint.dec,
      endRa: this.measureEndPoint.ra,
      endDec: this.measureEndPoint.dec,

      // Width and height in arcseconds (for rectangular measurements)
      widthArcseconds: widthArcseconds,
      heightArcseconds: heightArcseconds,

      // Length in pixels needed for recreation
      length: length,

      // Formatted distance string
      distance: this.measureDistance,

      // Shape visualization preferences
      showCircle: this.showCurrentCircle,
      showRectangle: this.showCurrentRectangle,

      // Timestamp for sorting
      timestamp: Date.now(),

      // We need these fields for the interface, but they'll be recalculated on load
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      midX: 0,
      midY: 0,
      startLabelX: 0,
      startLabelY: 0,
      endLabelX: 0,
      endLabelY: 0
    };

    // Create the measurement preset
    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (user && "id" in user) {
        // Create the base preset object
        const preset: MeasurementPresetInterface = {
          name: this.newMeasurementName,
          notes: this.saveMeasurementNotes, // Include notes in the preset
          user: user && "id" in user ? user.id : null
        };

        // Only include width/height when they are valid measurements
        if (measurementData.widthArcseconds !== null && measurementData.widthArcseconds !== undefined) {
          preset.widthArcseconds = measurementData.widthArcseconds;
        }

        if (measurementData.heightArcseconds !== null && measurementData.heightArcseconds !== undefined) {
          preset.heightArcseconds = measurementData.heightArcseconds;
        }

        // Dispatch action to save preset
        this.store$.dispatch(new CreateMeasurementPreset({ preset }));

        // Reset name and notes fields
        this.newMeasurementName = "";
        this.saveMeasurementNotes = "";
      }
    });
  }

  /**
   * Load a saved measurement
   */
  loadMeasurement(preset: MeasurementPresetInterface): void {
    // Set loading state
    this.loadingMeasurement = true;

    // Check if user is logged in
    let isLoggedIn = false;
    this.currentUser$.pipe(take(1)).subscribe(user => {
      isLoggedIn = !!user;
    });

    if (!isLoggedIn) {
      this.loadingMeasurement = false;
      return;
    }

    // Check if we have a solution matrix, required for loading measurements
    if (!this.advancedSolutionMatrix) {
      this.popNotificationsService.error(
        this.translateService.instant(
          "Measurement presets cannot be loaded on images without advanced plate-solving data. Use the measuring tool to create pixel-based measurements instead."
        )
      );
      this.loadingMeasurement = false;
      return;
    }

    // Use the direct image element reference - no querySelector needed
    let imageElement = this.imageElement?.nativeElement;

    if (!imageElement) {
      this.popNotificationsService.error(
        this.translateService.instant("Cannot locate image element")
      );
      this.loadingMeasurement = false;
      return;
    }

    console.log("IMAGE ELEMENT STATUS:", {
      available: !!imageElement,
      width: imageElement?.getBoundingClientRect()?.width || 0,
      height: imageElement?.getBoundingClientRect()?.height || 0,
      tagName: imageElement?.tagName
    });

    // Get the center of the image for positioning, not the viewport
    const imgRect = imageElement.getBoundingClientRect();
    const centerX = imgRect.left + (imgRect.width / 2);
    const centerY = imgRect.top + (imgRect.height / 2);

    // Check if we have width and height in arcseconds from the preset
    const hasArcsecondDimensions = !!preset.widthArcseconds && !!preset.heightArcseconds;

    if (hasArcsecondDimensions) {
      // Calculate coordinates at the center of the image
      const centerCoords = this.boundCalculateCoordinatesAtPoint(centerX, centerY);
      if (!centerCoords) {
        this.popNotificationsService.error(
          this.translateService.instant("Error calculating coordinates at image center")
        );
        return;
      }

      if (!this.solution.advancedPixscale) {
        this.popNotificationsService.error(
          this.translateService.instant("Invalid pixel scale in image solution")
        );
        return;
      }

      // Get the plate scale directly from the plate solution
      // advancedPixscale is already in arcseconds per pixel, so we don't need to invert it
      const arcsecPerPixel = parseFloat(this.solution?.advancedPixscale);

      // If for some reason the pixscale is unavailable or invalid
      if (isNaN(arcsecPerPixel) || arcsecPerPixel <= 0) {
        this.popNotificationsService.error(
          this.translateService.instant("Invalid plate scale in image solution")
        );
        return;
      }

      // Calculate pixel dimensions based on the saved arcsecond dimensions
      // First convert to natural image dimensions
      const naturalPixelWidth = preset.widthArcseconds / arcsecPerPixel;
      const naturalPixelHeight = preset.heightArcseconds / arcsecPerPixel;

      // Now account for the current zoom level by comparing the image element size to the natural size
      let zoomFactor = 1.0;
      if (this.naturalWidth && imageElement) {
        const displayWidth = imageElement.clientWidth || imageElement.getBoundingClientRect().width;
        zoomFactor = displayWidth / this.naturalWidth;
      }

      // Apply the zoom factor to get the actual display pixel dimensions
      const pixelWidth = naturalPixelWidth * zoomFactor;
      const pixelHeight = naturalPixelHeight * zoomFactor;

      // Calculate half dimensions for corner placement
      const halfWidth = pixelWidth / 2;
      const halfHeight = pixelHeight / 2;

      // Calculate coordinates for the corners of the rectangle from the center
      const startX = centerX - halfWidth;
      const startY = centerY - halfHeight;
      const endX = centerX + halfWidth;
      const endY = centerY + halfHeight;

      // Validate the measurement is large enough (at least 50 display pixels in either dimension)
      if (pixelWidth < 50 || pixelHeight < 50) {
        this.popNotificationsService.error(
          this.translateService.instant("Measurement is too small for this image.")
        );
        this.loadingMeasurement = false;
        return;
      }

      // Get image boundaries
      const imgBounds = imageElement.getBoundingClientRect();

      // Check if any point would be outside the image boundaries
      if (
        startX < imgBounds.left || startX > imgBounds.right ||
        startY < imgBounds.top || startY > imgBounds.bottom ||
        endX < imgBounds.left || endX > imgBounds.right ||
        endY < imgBounds.top || endY > imgBounds.bottom
      ) {
        this.popNotificationsService.error(
          this.translateService.instant("Measurement could not be placed within the image boundaries.")
        );
        this.loadingMeasurement = false;
        return;
      }

      // Set the start and end points
      this.measureStartPoint = {
        x: startX,
        y: startY,
        ra: null,
        dec: null
      };

      this.measureEndPoint = {
        x: endX,
        y: endY,
        ra: null,
        dec: null
      };

      // Calculate celestial coordinates for the points
      const startCoords = this.boundCalculateCoordinatesAtPoint(startX, startY);
      if (startCoords) {
        this.measureStartPoint.ra = startCoords.ra;
        this.measureStartPoint.dec = startCoords.dec;
      } else {
        // Could not calculate coordinates at start point
        this.popNotificationsService.error(
          this.translateService.instant("Could not calculate coordinates at start point")
        );
        this.loadingMeasurement = false;
        return;
      }

      const endCoords = this.boundCalculateCoordinatesAtPoint(endX, endY);
      if (endCoords) {
        this.measureEndPoint.ra = endCoords.ra;
        this.measureEndPoint.dec = endCoords.dec;
      } else {
        // Could not calculate coordinates at end point
        this.popNotificationsService.error(
          this.translateService.instant("Could not calculate coordinates at end point")
        );
        this.loadingMeasurement = false;
        return;
      }

      // First improve the accuracy of point placement using the known exact width/height
      if (preset.widthArcseconds && preset.heightArcseconds && this.measureStartPoint && this.measureEndPoint) {
        // We're targeting exact width and height in arcseconds, but our pixel placement might be off
        // due to rounding or small errors in coordinate transformation

        // Get the current points
        const centerX = (this.measureStartPoint.x + this.measureEndPoint.x) / 2;
        const centerY = (this.measureStartPoint.y + this.measureEndPoint.y) / 2;

        // Use arcsecPerPixel already calculated from the solution, accounting for zoom
        const targetNaturalWidthPixels = preset.widthArcseconds / arcsecPerPixel;
        const targetNaturalHeightPixels = preset.heightArcseconds / arcsecPerPixel;

        // Reuse the same zoom factor calculated earlier
        const targetWidthPixels = targetNaturalWidthPixels * zoomFactor;
        const targetHeightPixels = targetNaturalHeightPixels * zoomFactor;

        // Calculate the adjustment needed (ratio between target and current dimensions)
        const currentWidthPixels = Math.abs(this.measureEndPoint.x - this.measureStartPoint.x);
        const currentHeightPixels = Math.abs(this.measureEndPoint.y - this.measureStartPoint.y);

        // Apply correction by repositioning the end point (keep start fixed)
        const adjustedEndX = this.measureStartPoint.x +
          (this.measureEndPoint.x - this.measureStartPoint.x) *
          (targetWidthPixels / Math.max(0.1, currentWidthPixels));

        const adjustedEndY = this.measureStartPoint.y +
          (this.measureEndPoint.y - this.measureStartPoint.y) *
          (targetHeightPixels / Math.max(0.1, currentHeightPixels));

        // Update the end point position
        this.measureEndPoint.x = adjustedEndX;
        this.measureEndPoint.y = adjustedEndY;

        // Recalculate celestial coordinates for the adjusted end point
        const adjustedEndCoords = this.boundCalculateCoordinatesAtPoint(adjustedEndX, adjustedEndY);
        if (adjustedEndCoords) {
          this.measureEndPoint.ra = adjustedEndCoords.ra;
          this.measureEndPoint.dec = adjustedEndCoords.dec;
        }
      }

      // Now calculate distance based on adjusted RA/Dec coordinates
      // Use the current points which may have been adjusted above
      if (this.measureStartPoint.ra !== null && this.measureEndPoint.ra !== null) {
        // Use the direct angular distance between start and end points (which may have been adjusted)
        const angularDistance = this.astroUtilsService.calculateAngularDistance(
          this.measureStartPoint.ra, this.measureStartPoint.dec,
          this.measureEndPoint.ra, this.measureEndPoint.dec
        );

        // Format this distance using our standard formatter
        this.measureDistance = this.astroUtilsService.formatAngularDistance(angularDistance);
      }
        // This is the fallback if for some reason we couldn't get RA/Dec values
      // from the measurement points directly
      else if (startCoords && endCoords) {
        // Use the original coordinate calculations from earlier in the function
        const angularDistance = this.astroUtilsService.calculateAngularDistance(
          startCoords.ra, startCoords.dec,
          endCoords.ra, endCoords.dec
        );
        this.measureDistance = this.astroUtilsService.formatAngularDistance(angularDistance);
      }
      // Last resort - show an error message
      else {
        this.popNotificationsService.error(
          this.translateService.instant("Could not calculate distance for the measurement")
        );
        this.loadingMeasurement = false;
        return;
      }

      // Instead of enabling current rectangle, save as a previous measurement
      // and reset the current measurement to provide better visual styling

      // Prepare a nice label with both dimensions if available
      let displayDistance = this.measureDistance;

      // First create a previous measurement from the loaded data
      const loadedMeasurement: MeasurementData = {
        startX: this.measureStartPoint.x,
        startY: this.measureStartPoint.y,
        endX: this.measureEndPoint.x,
        endY: this.measureEndPoint.y,
        midX: (this.measureStartPoint.x + this.measureEndPoint.x) / 2,
        midY: (this.measureStartPoint.y + this.measureEndPoint.y) / 2,
        distance: displayDistance,
        timestamp: Date.now(),
        startRa: this.measureStartPoint.ra,
        startDec: this.measureStartPoint.dec,
        endRa: this.measureEndPoint.ra,
        endDec: this.measureEndPoint.dec,
        startLabelX: 0,
        startLabelY: 0,
        endLabelX: 0,
        endLabelY: 0,
        showCircle: false,
        showRectangle: true,
        // Store the original width/height from the preset for future reference
        widthArcseconds: preset.widthArcseconds,
        heightArcseconds: preset.heightArcseconds,
        // Include name and notes from the preset
        name: preset.name,
        notes: preset.notes
      };

      // Update label positions
      this.updateCoordinateLabelPositions(loadedMeasurement);

      // Add to previous measurements
      this.previousMeasurements.push(loadedMeasurement);

      // Reset current measurement
      this.measureStartPoint = null;
      this.measureEndPoint = null;
      this.measureDistance = null;

      // Close the saved measurements panel
      if (this.showSavedMeasurements) {
        this.toggleSavedMeasurements();
      }

      // Reset loading state
      this.loadingMeasurement = false;
    } else {
      // No arcsecond dimensions in preset
      this.popNotificationsService.error(
        this.translateService.instant("Invalid measurement preset: missing width/height dimensions")
      );
      this.loadingMeasurement = false;
      return;
    }
  }

  /**
   * Delete a saved measurement with confirmation dialog
   */
  deleteSavedMeasurement(index: number): void {
    // Check if user is logged in
    let isLoggedIn = false;
    this.currentUser$.pipe(take(1)).subscribe(user => {
      isLoggedIn = !!user;
    });

    if (!isLoggedIn) {
      return;
    }

    if (index >= 0 && index < this.savedMeasurements.length) {
      const preset = this.savedMeasurements[index];

      // Open confirmation dialog
      const modalRef = this.modalService.open(ConfirmationDialogComponent, {
        centered: true,
        backdrop: "static"
      });

      // Configure dialog
      modalRef.componentInstance.title = this.translateService.instant("Delete measurement");
      modalRef.componentInstance.message = this.translateService.instant(
        "This action cannot be undone."
      );
      modalRef.componentInstance.confirmLabel = this.translateService.instant("Delete");

      // Subscribe to dialog result
      modalRef.result.then(
        () => {
          // Modal closed with confirm button
          if (preset.id) {
            // Dispatch action to delete preset
            this.store$.dispatch(new DeleteMeasurementPreset({ presetId: preset.id }));
          }
        },
        () => {
          // Modal dismissed, do nothing
        }
      );
    }
  }

  /**
   * Reset the resize warning state when creating new measurements
   * Called when starting a new measurement
   */
  resetResizeWarningState(): void {
    if (this.measurementsAffectedByResize) {
      this.measurementsAffectedByResize = false;

      if (this.isBrowser) {
        this._prevWindowWidth = window.innerWidth;
        this._prevWindowHeight = window.innerHeight;
      }

      this.cdRef.detectChanges();
    }
  }

  /**
   * Handle window resize event
   * Shows a warning if there are measurements visible
   */
  handleWindowResize(event: UIEvent): void {
    // Ensure we're in browser environment before accessing window properties
    if (!this.isBrowser) {
      return;
    }

    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    // Check for significant size changes to avoid unnecessary warnings
    // (e.g., when soft keyboard appears on mobile)
    const widthDiff = Math.abs(newWidth - this._prevWindowWidth);
    const heightDiff = Math.abs(newHeight - this._prevWindowHeight);

    // Only show warning if the size change is significant (more than 50px)
    if ((widthDiff > 50 || heightDiff > 50) &&
      (this.previousMeasurements.length > 0 ||
        (this.measureStartPoint && this.measureEndPoint))) {
      // Set flag to mark measurements as potentially incorrect
      this.measurementsAffectedByResize = true;

      // Show warning notification
      this.showResizeWarning();

      // Update UI to reflect the warning state
      this.cdRef.detectChanges();

      // Update stored dimensions
      this._prevWindowWidth = newWidth;
      this._prevWindowHeight = newHeight;
    }
  }

  /**
   * Clears all measurements and closes the resize warning
   * Called from the "Clear All Measurements" button in the warning
   */
  clearAllAndCloseWarning(): void {
    // Clear all measurements
    this.previousMeasurements = [];

    // Close the warning
    this.closeResizeWarning();

    // Reset the resize warning state
    this.measurementsAffectedByResize = false;
  }

  /**
   * Closes the resize warning modal
   * Called from the "Got it" button in the warning
   */
  closeResizeWarning(): void {
    this.showResizeWarningModal = false;
    this.cdRef.detectChanges();
  }

  /**
   * Opens a modal to display the full notes
   * Called when the user clicks on the "See more" link
   */
  openFullNotesModal(event: MouseEvent, notes: string): void {
    // Prevent default link behavior and event propagation
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Open the modal using the InformationDialogComponent
    const modalRef = this.modalService.open(InformationDialogComponent, {
      centered: true,
      scrollable: true,
      size: "md"
    });

    // Configure the modal
    modalRef.componentInstance.title = this.translateService.instant("Measurement Notes");
    modalRef.componentInstance.message = notes;

    // Add safe event handling
    try {
      event.stopImmediatePropagation();
    } catch (e) {
      // Ignore errors
    }
  }

  /**
   * Checks and adjusts horizontal label position to avoid overlap with the measurement box
   * This positions the horizontal distance label to avoid overlap with the center box
   *
   * Works with both current measurements and previous measurements
   */
  checkHorizontalLabelPosition(y: number, measurement?: MeasurementData): number {
    if (!this.isBrowser) {
      return y;
    }

    // Use provided measurement if available, otherwise use the current measurement
    const startPoint = measurement ? { x: measurement.startX, y: measurement.startY } : this.measureStartPoint;
    const endPoint = measurement ? { x: measurement.endX, y: measurement.endY } : this.measureEndPoint;

    if (!startPoint || !endPoint) {
      return y;
    }

    // Calculate midpoint of the rectangle
    const midX = (startPoint.x + endPoint.x) / 2;
    const midY = (startPoint.y + endPoint.y) / 2;

    // Find all measure-distance elements
    const measureDistanceElements = Array.from(
      document.querySelectorAll(".measure-distance")
    ) as HTMLElement[];

    // Calculate position and dimensions of the horizontal distance label
    const horizontalLabelX = midX; // X position at the middle of width
    const horizontalLabelY = y; // Proposed Y position below rectangle

    // Approximate dimensions of the horizontal distance label
    const horizontalLabelWidth = 100; // Typical width of the distance label
    const horizontalLabelHeight = 20; // Typical height of the distance label

    // Define the bounding box of the horizontal label
    const horizontalLabelBox = {
      left: horizontalLabelX - horizontalLabelWidth / 2, // Center aligned text
      right: horizontalLabelX + horizontalLabelWidth / 2,
      top: horizontalLabelY - horizontalLabelHeight / 2,
      bottom: horizontalLabelY + horizontalLabelHeight / 2
    };

    let overlaps = false;
    let overlappingElement: HTMLElement | null = null;

    // Check if this horizontal label would overlap with any .measure-distance element
    for (const element of measureDistanceElements) {
      const rect = element.getBoundingClientRect();

      // Create a box with some margin around the element
      const elementBox = {
        left: rect.left - 5,
        right: rect.right + 5,
        top: rect.top - 5,
        bottom: rect.bottom + 5
      };

      // Check for overlap between the horizontal label and the element
      if (!(horizontalLabelBox.right < elementBox.left ||
        horizontalLabelBox.left > elementBox.right ||
        horizontalLabelBox.bottom < elementBox.top ||
        horizontalLabelBox.top > elementBox.bottom)) {
        overlaps = true;
        overlappingElement = element;
        break;
      }
    }

    // If there's an overlap, adjust the position to move further down
    if (overlaps && overlappingElement) {
      const elementRect = overlappingElement.getBoundingClientRect();
      // Move below the element with extra padding
      return elementRect.bottom + horizontalLabelHeight + 10;
    }

    return y;
  }

  /**
   * Checks and adjusts vertical label position to avoid overlap with the measurement box
   * This positions the vertical measurement label to avoid the center box with name/distance/notes
   *
   * Works with both current measurements and previous measurements
   */
  checkVerticalLabelPosition(y: number, measurement?: MeasurementData): number {
    if (!this.isBrowser) {
      return y;
    }

    // Use provided measurement if available, otherwise use the current measurement
    const startPoint = measurement ? { x: measurement.startX, y: measurement.startY } : this.measureStartPoint;
    const endPoint = measurement ? { x: measurement.endX, y: measurement.endY } : this.measureEndPoint;

    if (!startPoint || !endPoint) {
      return y;
    }

    // Calculate midpoint and rectangle edges
    const midX = (startPoint.x + endPoint.x) / 2;
    const midY = (startPoint.y + endPoint.y) / 2;
    const rightEdgeX = Math.max(startPoint.x, endPoint.x);
    const height = Math.abs(endPoint.y - startPoint.y);

    // Find the actual .measure-distance element at the center of the measurement
    // This is the element we need to avoid overlapping with
    const measureDistanceElements = Array.from(
      document.querySelectorAll(".measure-distance")
    ) as HTMLElement[];

    // Calculate position and dimensions of the vertical distance label
    const verticalLabelX = rightEdgeX + 35; // X position of vertical label
    const verticalLabelY = y; // Proposed Y position of the vertical label

    // Approximate dimensions of the vertical distance label
    const verticalLabelWidth = 70; // Typical width of the distance label
    const verticalLabelHeight = 20; // Typical height of the distance label

    // Define the bounding box of the vertical label
    const verticalLabelBox = {
      left: verticalLabelX - 5, // Add a small buffer
      right: verticalLabelX + verticalLabelWidth,
      top: verticalLabelY - verticalLabelHeight / 2,
      bottom: verticalLabelY + verticalLabelHeight / 2
    };

    let overlaps = false;
    let overlappingElement: HTMLElement | null = null;

    // Check if this vertical label would overlap with any .measure-distance element
    for (const element of measureDistanceElements) {
      const rect = element.getBoundingClientRect();

      // Create a box with some margin around the element
      const elementBox = {
        left: rect.left - 5,
        right: rect.right + 5,
        top: rect.top - 5,
        bottom: rect.bottom + 5
      };

      // Check for overlap between the vertical label and the element
      if (!(verticalLabelBox.right < elementBox.left ||
        verticalLabelBox.left > elementBox.right ||
        verticalLabelBox.bottom < elementBox.top ||
        verticalLabelBox.top > elementBox.bottom)) {
        overlaps = true;
        overlappingElement = element;
        break;
      }
    }

    // If there's an overlap, adjust the position
    if (overlaps && overlappingElement) {
      const elementRect = overlappingElement.getBoundingClientRect();
      const distanceToTop = Math.abs(elementRect.top - verticalLabelY);
      const distanceToBottom = Math.abs(elementRect.bottom - verticalLabelY);

      if (distanceToTop < distanceToBottom) {
        // Move above the element if closer to top
        return elementRect.top - verticalLabelHeight - 10;
      } else {
        // Move below the element if closer to bottom
        return elementRect.bottom + verticalLabelHeight + 10;
      }
    }

    // If the label isn't overlapping with a .measure-distance element,
    // use a simpler method based on the rectangle's height
    if (measurement || (this.measureStartPoint && this.measureEndPoint)) {
      const rectangleTop = Math.min(startPoint.y, endPoint.y);

      // Check if vertical label is near the midpoint
      if (Math.abs(y - midY) < 30) {
        if (midY - rectangleTop < height / 2) {
          // Move label down if we're in the upper half of the rectangle
          return y + 60;
        } else {
          // Move label up if we're in the lower half of the rectangle
          return y - 60;
        }
      }
    }

    return y;
  }

  /**
   * Open a modal to export measurement coordinates
   */
  openExportMeasurementModal(event: MouseEvent, measurement: MeasurementData): void {
    // Prevent the event from propagating to parent elements
    event.preventDefault();
    event.stopPropagation();

    if (!this.isValidSolutionMatrix() || !measurement) {
      return;
    }

    // Get the coordinates for all points of the measurement
    let exportData = {
      centerCoordinates: {
        text: "N/A",
        ra: null,
        dec: null
      },
      corners: {
        topLeft: {
          text: "N/A",
          ra: null,
          dec: null
        },
        topRight: {
          text: "N/A",
          ra: null,
          dec: null
        },
        bottomLeft: {
          text: "N/A",
          ra: null,
          dec: null
        },
        bottomRight: {
          text: "N/A",
          ra: null,
          dec: null
        }
      }
    };

    // Calculate center coordinates
    const centerX = (measurement.startX + measurement.endX) / 2;
    const centerY = (measurement.startY + measurement.endY) / 2;
    const centerCoords = this.boundCalculateCoordinatesAtPoint(centerX, centerY);

    if (centerCoords) {
      exportData.centerCoordinates = {
        text: this.coordinatesFormatter.formatCoordinatesVerbose(centerCoords.ra, centerCoords.dec),
        ra: centerCoords.ra,
        dec: centerCoords.dec
      };
    }

    // For rectangle measurements, calculate the four corners
    if (measurement.showRectangle) {
      const minX = Math.min(measurement.startX, measurement.endX);
      const maxX = Math.max(measurement.startX, measurement.endX);
      const minY = Math.min(measurement.startY, measurement.endY);
      const maxY = Math.max(measurement.startY, measurement.endY);

      const topLeft = this.boundCalculateCoordinatesAtPoint(minX, minY);
      const topRight = this.boundCalculateCoordinatesAtPoint(maxX, minY);
      const bottomLeft = this.boundCalculateCoordinatesAtPoint(minX, maxY);
      const bottomRight = this.boundCalculateCoordinatesAtPoint(maxX, maxY);

      if (topLeft) {
        exportData.corners.topLeft = {
          text: this.coordinatesFormatter.formatCoordinatesVerbose(topLeft.ra, topLeft.dec),
          ra: topLeft.ra,
          dec: topLeft.dec
        };
      }

      if (topRight) {
        exportData.corners.topRight = {
          text: this.coordinatesFormatter.formatCoordinatesVerbose(topRight.ra, topRight.dec),
          ra: topRight.ra,
          dec: topRight.dec
        };
      }

      if (bottomLeft) {
        exportData.corners.bottomLeft = {
          text: this.coordinatesFormatter.formatCoordinatesVerbose(bottomLeft.ra, bottomLeft.dec),
          ra: bottomLeft.ra,
          dec: bottomLeft.dec
        };
      }

      if (bottomRight) {
        exportData.corners.bottomRight = {
          text: this.coordinatesFormatter.formatCoordinatesVerbose(bottomRight.ra, bottomRight.dec),
          ra: bottomRight.ra,
          dec: bottomRight.dec
        };
      }
    }

    // Open the modal with the export data
    const modalRef = this.modalService.open(ExportMeasurementModalComponent, {
      centered: true,
      size: "lg",
      backdrop: true,
      keyboard: false
    });

    modalRef.componentInstance.measurementData = exportData;
    modalRef.componentInstance.windowRefService = this.windowRefService;
    modalRef.componentInstance.translateService = this.translateService;
    modalRef.componentInstance.coordinatesFormatter = this.coordinatesFormatter;
  }

  /**
   * Validates that the event is within the image boundaries
   */
  private _validateMeasurementArea(event: MouseEvent): boolean {
    // Ensure we're in browser environment before accessing DOM
    if (!this.isBrowser) {
      return false;
    }

    // Get the offset of the image element - use the cached element as we now have a direct reference
    const imageElement = this.cachedImageElement;
    if (!imageElement) {
      return false;
    }

    // Check if the mouse down is within the bounds of the image
    const imageRect = imageElement.getBoundingClientRect();
    return !(
      event.clientX < imageRect.left ||
      event.clientX > imageRect.right ||
      event.clientY < imageRect.top ||
      event.clientY > imageRect.bottom
    );
  }

  /**
   * Reset the current measurement state for starting a new measurement
   */
  private _resetCurrentMeasurement(): void {
    this.measureStartPoint = null;
    this.measureEndPoint = null;
    this.measureDistance = null;

    // Reset resize warning state for new measurements
    this.resetResizeWarningState();
  }

  /**
   * Initialize the starting point for a measurement
   */
  private _initializeStartPoint(event: MouseEvent): void {
    // Set the start point on mousedown
    this.measureStartPoint = {
      x: event.clientX,
      y: event.clientY,
      ra: null,
      dec: null
    };

    // Emit event to signal measurement has started
    this.measurementStarted.emit();

    // Initialize mouse position to match the cursor position immediately
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;

    // Calculate celestial coordinates if possible
    this._updatePointCelestialCoordinates(this.measureStartPoint, event.clientX, event.clientY);

    // Update boundary status after adding the start point
    this.updateBoundaryStatus();
  }

  /**
   * Updates celestial coordinates for a measurement point
   */
  private _updatePointCelestialCoordinates(point: MeasurementPoint, x: number, y: number): void {
    if (this.isValidSolutionMatrix()) {
      const coords = this.boundCalculateCoordinatesAtPoint(x, y);
      if (coords) {
        point.ra = coords.ra;
        point.dec = coords.dec;
      } else {
        // If we can't calculate coordinates, set to null
        point.ra = null;
        point.dec = null;
      }
    } else {
      // If we don't have a valid solution matrix, set to null
      point.ra = null;
      point.dec = null;
    }
  }

  /**
   * Setup drag tracking and handlers for measurement creation
   */
  private _setupDragTracking(event: MouseEvent, startX: number, startY: number): void {
    // Only set up DOM listeners in browser environment
    if (!this.isBrowser) {
      return;
    }

    // Keep track of whether we've moved enough to consider this a drag
    let hasDraggedEnough = false;

    // Track if we're in a drag operation (don't set flag yet)
    let isDragging = false;

    // Add mouse move event listener to track the mouse position
    const mouseMoveHandler = (moveEvent: MouseEvent) => {
      this._handleMeasurementDragMove(moveEvent, startX, startY, this.DRAG_THRESHOLD, hasDraggedEnough, isDragging);

      // Update tracking variables based on movement
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const distanceMoved = Math.sqrt(dx * dx + dy * dy);

      // If we've moved enough, consider this a drag operation
      if (distanceMoved >= this.DRAG_THRESHOLD) {
        hasDraggedEnough = true;
        isDragging = true;

        // Set the drag flag to prevent the click handler from running
        this._dragInProgress = true;
      }
    };

    // Add mouse up event listener to complete the measurement
    const mouseUpHandler = (upEvent: MouseEvent) => {
      this._handleMeasurementDragEnd(upEvent, startX, startY, hasDraggedEnough, isDragging);

      // Clean up event listeners
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", mouseUpHandler);

      // Reset drag state
      this._dragInProgress = false;

      // Small delay to prevent accidental double measurements
      this.windowRefService.utilsService.delay(100).subscribe(() => {
        this._preventNextClick = false;
      });
    };

    // Add the event listeners
    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler, { once: true });
  }

  /**
   * Handle mouse movement during measurement drag
   */
  private _handleMeasurementDragMove(
    moveEvent: MouseEvent,
    startX: number,
    startY: number,
    dragThreshold: number,
    hasDraggedEnough: boolean,
    isDragging: boolean
  ): void {
    // Always update the mouse position for the dashed line preview
    this.mouseX = moveEvent.clientX;
    this.mouseY = moveEvent.clientY;
  }

  /**
   * Handle the end of a measurement drag operation
   */
  private _handleMeasurementDragEnd(
    upEvent: MouseEvent,
    startX: number,
    startY: number,
    hasDraggedEnough: boolean,
    isDragging: boolean
  ): void {
    // Calculate final distance moved
    const dx = upEvent.clientX - startX;
    const dy = upEvent.clientY - startY;
    const distanceMoved = Math.sqrt(dx * dx + dy * dy);

    // Only complete the measurement if we dragged far enough
    if (hasDraggedEnough && isDragging) {
      this._createEndPoint(upEvent);
      this._finalizeMeasurement();
      this._preventNextClick = true;
    } else if (distanceMoved < this.DRAG_THRESHOLD) {
      // If we didn't drag far enough, it's treated like a normal click
      // Keep the start point set (so it appears immediately) but don't set end point
      // The user can set the end point with a second click
      this.measureEndPoint = null;
    }
  }

  /**
   * Create an end point for the measurement at the specified event position
   */
  private _createEndPoint(event: MouseEvent): void {
    // Set the end point at the mouse up position
    this.measureEndPoint = {
      x: event.clientX,
      y: event.clientY,
      ra: null,
      dec: null
    };

    // Calculate celestial coordinates if possible
    this._updatePointCelestialCoordinates(this.measureEndPoint, event.clientX, event.clientY);

    // Update boundary status after adding the end point
    this.updateBoundaryStatus();
  }

  /**
   * Handle a click when starting a new measurement (resetting previous one)
   */
  private _handleNewMeasurementClick(event: MouseEvent): void {
    // Reset current measurement
    this._resetCurrentMeasurement();

    // Set first point immediately on this click
    this.measureStartPoint = {
      x: event.clientX,
      y: event.clientY,
      ra: null,
      dec: null
    };

    // Initialize mouse position for dashed line display
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;

    // Calculate celestial coordinates if possible
    this._updatePointCelestialCoordinates(this.measureStartPoint, event.clientX, event.clientY);

    // Update boundary status after adding the start point
    this.updateBoundaryStatus();
  }

  /**
   * Handle the first click of a measurement to set the starting point
   */
  private _handleFirstPointClick(event: MouseEvent): void {
    // Set start point
    this.measureStartPoint = {
      x: event.clientX,
      y: event.clientY,
      ra: null,
      dec: null
    };

    // Emit event to signal measurement has started
    this.measurementStarted.emit();

    // Initialize mouse position for dashed line display
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;

    // Calculate celestial coordinates if possible
    this._updatePointCelestialCoordinates(this.measureStartPoint, event.clientX, event.clientY);

    // Update boundary status after adding the start point
    this.updateBoundaryStatus();
  }

  /**
   * Handle the second click of a measurement to set the ending point
   */
  private _handleSecondPointClick(event: MouseEvent): void {
    // Set end point (for two-click measurements)
    this._createEndPoint(event);

    // Finalize the measurement
    this._finalizeMeasurement();

    // Note: We don't need to call updateBoundaryStatus() here because
    // _finalizeMeasurement will already call it after adding to previousMeasurements
  }

  /**
   * Update the start point position during drag
   */
  private _updateDraggedStartPoint(event: MouseEvent): void {
    if (!this.measureStartPoint) {
      return;
    }

    // Update point position
    this.measureStartPoint.x = event.clientX + this.dragOffsetX;
    this.measureStartPoint.y = event.clientY + this.dragOffsetY;

    // Update celestial coordinates
    if (this.isValidSolutionMatrix()) {
      // Account for rotation when calculating coordinates during drag
      const coords = this.boundCalculateCoordinatesAtPoint(
        event.clientX + this.dragOffsetX,
        event.clientY + this.dragOffsetY,
        true
      );

      if (coords) {
        this.measureStartPoint.ra = coords.ra;
        this.measureStartPoint.dec = coords.dec;
      }
    }

    // Recalculate distance if we have an end point
    if (this.measureEndPoint) {
      this._recalculateMeasurementDistance();
    }
  }

  /**
   * Update the end point position during drag
   */
  private _updateDraggedEndPoint(event: MouseEvent): void {
    if (!this.measureEndPoint) {
      return;
    }

    // Update point position
    this.measureEndPoint.x = event.clientX + this.dragOffsetX;
    this.measureEndPoint.y = event.clientY + this.dragOffsetY;

    // Update celestial coordinates
    if (this.isValidSolutionMatrix()) {
      // Account for rotation when calculating coordinates during drag
      const coords = this.boundCalculateCoordinatesAtPoint(
        event.clientX + this.dragOffsetX,
        event.clientY + this.dragOffsetY,
        true
      );

      if (coords) {
        this.measureEndPoint.ra = coords.ra;
        this.measureEndPoint.dec = coords.dec;
      }
    }

    // Recalculate distance if we have a start point
    if (this.measureStartPoint) {
      this._recalculateMeasurementDistance();
    }
  }

  /**
   * Recalculate the measurement distance after point movement
   */
  private _recalculateMeasurementDistance(): void {
    if (!this.measureStartPoint || !this.measureEndPoint) {
      return;
    }

    // Calculate pixel distance
    const pixelDistance = this.calculateDistance(
      this.measureStartPoint.x,
      this.measureStartPoint.y,
      this.measureEndPoint.x,
      this.measureEndPoint.y
    );

    // Format the distance based on whether we have valid celestial coordinates
    if (this.isValidSolutionMatrix() &&
      this.measureStartPoint.ra !== null &&
      this.measureEndPoint.ra !== null) {
      this.measureDistance = this.formatAngularDistance(pixelDistance);
    } else {
      this.measureDistance = `${Math.round(pixelDistance)} px`;
    }
  }

  /**
   * Update label positions for start and end points
   */
  private _updateLabelPositions(): void {
    if (this.measureStartPoint && this.measureEndPoint) {
      const startLabelX = this.calculateStartLabelX();
      const startLabelY = this.calculateStartLabelY();
      const endLabelX = this.calculateEndLabelX();
      const endLabelY = this.calculateEndLabelY();
    }
  }

  /**
   * Extract measurement info from the drag state
   */
  private _getPreviousMeasurementInfo(): { measurement: MeasurementData, index: number, pointType: string } | null {
    const parts = this.isDraggingPoint.split("-");
    const index = parseInt(parts[1], 10);

    if (isNaN(index) || index < 0 || index >= this.previousMeasurements.length) {
      return null;
    }

    const measurement = this.previousMeasurements[index];
    const pointType = this.isDraggingPoint.startsWith("prevStart") ? "start" : "end";

    return { measurement, index, pointType };
  }

  /**
   * Update the start point of a previous measurement
   */
  private _updatePreviousMeasurementStartPoint(measurement: MeasurementData, event: MouseEvent): void {
    measurement.startX = event.clientX + this.dragOffsetX;
    measurement.startY = event.clientY + this.dragOffsetY;

    // Update celestial coordinates if we have valid plate solution data
    if (this.isValidSolutionMatrix()) {
      // Account for rotation when calculating coordinates
      const coords = this.boundCalculateCoordinatesAtPoint(
        event.clientX + this.dragOffsetX,
        event.clientY + this.dragOffsetY,
        true
      );

      if (coords) {
        measurement.startRa = coords.ra;
        measurement.startDec = coords.dec;
      }
    }
  }

  /**
   * Update the end point of a previous measurement
   */
  private _updatePreviousMeasurementEndPoint(measurement: MeasurementData, event: MouseEvent): void {
    measurement.endX = event.clientX + this.dragOffsetX;
    measurement.endY = event.clientY + this.dragOffsetY;

    // Update celestial coordinates if we have valid plate solution data
    if (this.isValidSolutionMatrix()) {
      // Account for rotation when calculating coordinates
      const coords = this.boundCalculateCoordinatesAtPoint(
        event.clientX + this.dragOffsetX,
        event.clientY + this.dragOffsetY,
        true
      );

      if (coords) {
        measurement.endRa = coords.ra;
        measurement.endDec = coords.dec;
      }
    }
  }

  /**
   * Update shared properties for a measurement after point movement
   */
  private _updatePreviousMeasurementProperties(measurement: MeasurementData): void {
    // Update distance calculation
    const pixelDistance = this.calculateDistance(
      measurement.startX,
      measurement.startY,
      measurement.endX,
      measurement.endY
    );

    // Format the distance based on whether we have valid celestial coordinates
    if (this.isValidSolutionMatrix() && measurement.startRa !== null && measurement.endRa !== null) {
      // If we have RA/Dec coordinates, calculate angular distance
      const angularDistance = this.astroUtilsService.calculateAngularDistance(
        measurement.startRa,
        measurement.startDec,
        measurement.endRa,
        measurement.endDec
      );

      // Convert to arcseconds and use consistent formatting
      const arcseconds = angularDistance * 3600;

      // Use the standardized astronomical angle formatter
      measurement.distance = this.astroUtilsService.formatAstronomicalAngle(arcseconds);
    } else {
      measurement.distance = `${Math.round(pixelDistance)} px`;
    }

    // Update middle point for the distance label
    measurement.midX = (measurement.startX + measurement.endX) / 2;
    measurement.midY = (measurement.startY + measurement.endY) / 2;

    // Update label positions
    this.updateCoordinateLabelPositions(measurement);
  }

  /**
   * Encode measurements for URL sharing
   * We'll create a compact representation with only the necessary fields
   */
  private encodeMeasurementsForUrl(measurements: MeasurementData[]): string {
    // Create a minimal representation of each measurement
    const minimalMeasurements = measurements.map(m => {
      return {
        // Required for positioning
        sX: Math.round(m.startX),
        sY: Math.round(m.startY),
        eX: Math.round(m.endX),
        eY: Math.round(m.endY),

        // Optional celestial coordinates (if available)
        sRa: m.startRa !== null ? Number(m.startRa.toFixed(6)) : null,
        sDec: m.startDec !== null ? Number(m.startDec.toFixed(6)) : null,
        eRa: m.endRa !== null ? Number(m.endRa.toFixed(6)) : null,
        eDec: m.endDec !== null ? Number(m.endDec.toFixed(6)) : null,

        // Display options
        sC: m.showCircle || false,
        sR: m.showRectangle || false,

        // Optional metadata (only if present)
        n: m.name || undefined,
        no: m.notes || undefined
      };
    });

    // JSON stringify and compress using base64 encoding
    return btoa(JSON.stringify(minimalMeasurements));
  }

  /**
   * Load measurements from URL parameter
   */
  private loadMeasurementsFromUrl(encodedData: string): void {
    // First, try to decode the data to avoid delays if it's invalid
    let measurementsData;
    try {
      // Make sure the loading state is set
      this.loadingUrlMeasurements = true; // CRITICAL: Set loading flag directly
      this.showLoadingIndicator();

      console.log("DECODING MEASUREMENTS FROM URL - Base64 length:", encodedData.length);

      // First decode from base64
      const decodedString = atob(encodedData);
      console.log("DECODED MEASUREMENTS STRING - Length:", decodedString.length);

      // Then parse as JSON
      measurementsData = JSON.parse(decodedString);
      console.log("PARSED MEASUREMENTS - Type:", Array.isArray(measurementsData) ? 'Array' : typeof measurementsData, "Length:", Array.isArray(measurementsData) ? measurementsData.length : 0);

      if (!Array.isArray(measurementsData)) {
        throw new Error("Invalid measurements data format");
      }
    } catch (e) {
      console.error("Failed to decode measurements:", e);
      this.popNotificationsService.error(
        this.translateService.instant("Failed to load shared measurements from URL: {{message}}",
          { message: "Could not decode measurement data. The URL may be incomplete or invalid." })
      );
      this.loadingUrlMeasurements = false; // CRITICAL: Clear loading flag directly
      this.hideLoadingIndicator();
      return;
    }

    // Function to process and load the measurements
    const processAndLoadMeasurements = () => {
      try {
        // Safety check for the solution matrix
        if (!this.isValidSolutionMatrix()) {
          console.warn("Solution matrix not ready yet during measurement loading");
        }

        // Clear existing measurements
        this.previousMeasurements = [];

        if (measurementsData.length === 0) {
          return; // Nothing to load
        }

        // Reconstruct each measurement
        measurementsData.forEach(m => {
          // Validate required fields
          if (typeof m.sX !== "number" || typeof m.sY !== "number" ||
            typeof m.eX !== "number" || typeof m.eY !== "number") {
            console.warn("Skipping invalid measurement with missing coordinates");
            return;
          }

          // Create a full measurement data object from the data
          let startX, startY, endX, endY;

          // We'll try to use celestial coordinates if possible, but we need to handle the case
          // where the coordinates can't be accurately converted to pixels

          // Get the image element for reference - use it directly since we changed to static image
          let imageElement = this.imageElement?.nativeElement as HTMLElement;

          // Log image element status
          console.log("IMAGE ELEMENT STATUS:", {
            available: !!imageElement,
            width: imageElement?.getBoundingClientRect()?.width || 0,
            height: imageElement?.getBoundingClientRect()?.height || 0,
            tagName: imageElement?.tagName
          });

          // If we don't have a valid image element, we can't properly place the measurement
          if (!imageElement || imageElement.getBoundingClientRect().width === 0) {
            console.warn("No valid image element found, cannot place measurement");
            return;
          }

          // Get the center coordinates from the image element
          const centerX = imageElement.getBoundingClientRect().width / 2;
          const centerY = imageElement.getBoundingClientRect().height / 2;

          // If we have valid celestial coordinates and a solution matrix, use them to position the measurement
          if (this.isValidSolutionMatrix() &&
              m.sRa !== null && m.sDec !== null &&
              m.eRa !== null && m.eDec !== null) {
            try {
              console.debug("Using celestial coordinates to position measurement:",
                `Start: RA=${m.sRa.toFixed(6)}, Dec=${m.sDec.toFixed(6)}`,
                `End: RA=${m.eRa.toFixed(6)}, Dec=${m.eDec.toFixed(6)}`);

              // Calculate pixel positions for start and end points using recursive search with the solution
              const startPoint = this.astroUtilsService.calculatePixelPositionFromCoordinates(
                m.sRa, m.sDec,
                this.advancedSolutionMatrix,
                imageElement
              );

              const endPoint = this.astroUtilsService.calculatePixelPositionFromCoordinates(
                m.eRa, m.eDec,
                this.advancedSolutionMatrix,
                imageElement
              );

              console.debug("Calculated positions:",
                startPoint ? `Start(${startPoint.x.toFixed(1)}, ${startPoint.y.toFixed(1)})` : "Start(null)",
                endPoint ? `End(${endPoint.x.toFixed(1)}, ${endPoint.y.toFixed(1)})` : "End(null)");

              // If we successfully calculated both positions, use them
              if (startPoint && endPoint) {
                startX = startPoint.x;
                startY = startPoint.y;
                endX = endPoint.x;
                endY = endPoint.y;
                console.debug("Positioned measurement using celestial coordinates at:",
                  `Start: (${startX.toFixed(1)}, ${startY.toFixed(1)})`,
                  `End: (${endX.toFixed(1)}, ${endY.toFixed(1)})`);
              } else {
                // Fall back to using the angular distance to create a properly sized measurement
                console.debug("Could not calculate pixel positions directly, using angular distance instead");

                // Get the angular distance between the points
                const angularDistance = this.astroUtilsService.calculateAngularDistance(
                  m.sRa, m.sDec, m.eRa, m.eDec
                );

                // Convert to arcseconds
                const arcseconds = angularDistance * 3600;
                console.debug(`Angular distance: ${angularDistance.toFixed(6)}° (${arcseconds.toFixed(2)} arcsec)`);

                // Create a line of the proper length (this preserves the measurement size)
                let scale = 100; // Default fallback length in pixels

                // Get the pixel scale from the solution
                if (this.solution) {
                  const pixscale = this.astroUtilsService.getPixelScale(this.solution);
                  if (pixscale > 0) {
                    scale = arcseconds / pixscale;
                    console.debug(`Using pixel scale: ${pixscale.toFixed(2)} arcsec/pixel, resulting length: ${scale.toFixed(1)} pixels`);
                  }
                }

                // Create a horizontal line starting from center with the correct length
                startX = centerX - scale / 2;
                startY = centerY;
                endX = centerX + scale / 2;
                endY = centerY;
                console.debug("Positioned measurement at center with correct angular size:",
                  `Center at (${centerX.toFixed(1)}, ${centerY.toFixed(1)}), length: ${scale.toFixed(1)} pixels`);
              }

              console.log("Created measurement with proper angular size at center of image");
            } catch (e) {
              // Fall back to pixel positions if anything goes wrong
              startX = m.sX;
              startY = m.sY;
              endX = m.eX;
              endY = m.eY;
              console.warn("Error creating measurement from celestial coordinates:", e);
            }
          } else {
            // Fall back to pixel positions
            startX = m.sX;
            startY = m.sY;
            endX = m.eX;
            endY = m.eY;
            console.log("Using pixel positions (no coordinates or solution matrix)");
          }

          const measurement: MeasurementData = {
            startX,
            startY,
            endX,
            endY,
            midX: (startX + endX) / 2,
            midY: (startY + endY) / 2,
            timestamp: Date.now(),
            distance: this.calculateDistanceText(startX, startY, endX, endY, m.sRa, m.sDec, m.eRa, m.eDec),
            startRa: m.sRa,
            startDec: m.sDec,
            endRa: m.eRa,
            endDec: m.eDec,
            showCircle: Boolean(m.sC),
            showRectangle: Boolean(m.sR),
            name: m.n || "",
            notes: m.no || "",

            // Initialize label positions
            startLabelX: 0,
            startLabelY: 0,
            endLabelX: 0,
            endLabelY: 0
          };

          // Calculate label positions (same logic as in updateCoordinateLabelPositions)
          this.updateCoordinateLabelPositions(measurement);

          // Add to previous measurements
          this.previousMeasurements.push(measurement);

          // Log the added measurement for debugging
          console.log("ADDED MEASUREMENT:", {
            startX: measurement.startX,
            startY: measurement.startY,
            endX: measurement.endX,
            endY: measurement.endY,
            distance: measurement.distance,
            hasCelestialCoords: !!(measurement.startRa && measurement.startDec && measurement.endRa && measurement.endDec)
          });
        });

        if (this.previousMeasurements.length > 0) {
          console.log("SUCCESSFULLY ADDED MEASUREMENTS - Count:", this.previousMeasurements.length);

          // Force change detection to make sure measurements appear
          this.cdRef.markForCheck();
          this.cdRef.detectChanges();

          // After a brief delay, show success notification
          this.windowRefService.utilsService.delay(100).subscribe(() => {
            this.cdRef.markForCheck();
            this.cdRef.detectChanges();

            // Show success notification
            this.popNotificationsService.success(
              this.translateService.instant("Loaded {{count}} shared measurements.", { count: this.previousMeasurements.length })
            );
          });
        }

        // Clear loading indicator
        this.loadingUrlMeasurements = false; // CRITICAL: Clear loading flag directly
        this.hideLoadingIndicator();

        // Update view
        this.cdRef.markForCheck();
      } catch (error) {
        console.error("Failed to process measurements:", error);
        this.popNotificationsService.error(
          this.translateService.instant("Failed to load shared measurements from URL: {{message}}", { message: error.message })
        );
        // Clear loading indicator on error
        this.loadingUrlMeasurements = false; // CRITICAL: Clear loading flag directly
        this.hideLoadingIndicator();
      }
    };

    // Implement a retry mechanism for solution matrix initialization
    const attemptWithRetry = (retryCount = 0, maxRetries = 5) => {
      console.log(`LOAD MEASUREMENTS - Attempt ${retryCount + 1} of ${maxRetries + 1}`);

      // Check if the image element is available first
      if (!this.cachedImageElement) {
        console.warn("LOAD MEASUREMENTS - Image element not available yet, trying to find it");
        this.cachedImageElement = this.imageElement?.nativeElement;

        if (!this.cachedImageElement) {
          if (retryCount >= maxRetries) {
            console.warn("LOAD MEASUREMENTS - Image element never became available, trying without it");
            processAndLoadMeasurements();
            return;
          }

          console.log("LOAD MEASUREMENTS - Will retry for image element");
          this.windowRefService.utilsService.delay(300 * Math.pow(1.5, retryCount)).subscribe(() => {
            attemptWithRetry(retryCount + 1, maxRetries);
          });
          return;
        }
      }

      // Image element is available, now check solution matrix
      if (this.isValidSolutionMatrix()) {
        console.log("LOAD MEASUREMENTS - Solution matrix is valid, processing measurements");
        processAndLoadMeasurements();
        return;
      }

      // If we've exceeded max retries, try to process anyway
      if (retryCount >= maxRetries) {
        console.warn(`LOAD MEASUREMENTS - Solution matrix not ready after ${maxRetries} attempts. Trying to load measurements anyway.`);
        processAndLoadMeasurements();
        return;
      }

      // Otherwise retry after a delay, with exponential backoff
      console.log(`LOAD MEASUREMENTS - Solution matrix not ready, retry attempt ${retryCount + 1} of ${maxRetries}`);
      this.windowRefService.utilsService.delay(300 * Math.pow(1.5, retryCount)).subscribe(() => {
        attemptWithRetry(retryCount + 1, maxRetries);
      }); // Exponential backoff starting at 300ms
    };

    // Start the retry process
    console.log("LOAD MEASUREMENTS - Starting retry process");
    attemptWithRetry();
  }

  /**
   * Helper method to calculate the displayed distance text
   */
  private calculateDistanceText(
    startX: number, startY: number, endX: number, endY: number,
    startRa: number | null, startDec: number | null,
    endRa: number | null, endDec: number | null
  ): string {
    // Calculate pixel distance
    const pixelDistance = Math.round(
      Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))
    );

    // If we have valid coordinates and solution matrix, calculate angular distance
    if (this.isValidSolutionMatrix() &&
      startRa !== null && startDec !== null &&
      endRa !== null && endDec !== null) {
      const angularDistance = this.astroUtilsService.calculateAngularDistance(
        startRa, startDec, endRa, endDec
      );

      // Convert to arcseconds and format
      const arcseconds = angularDistance * 3600;
      return this.astroUtilsService.formatAstronomicalAngle(arcseconds);
    }

    // Fallback to pixel distance
    return `${pixelDistance} px`;
  }

  // Helper method to detect collisions between labels
  private doLabelsOverlap(label1: LabelBoundingBox, label2: LabelBoundingBox): boolean {
    return (
      label1.x < label2.x + label2.width &&
      label1.x + label1.width > label2.x &&
      label1.y < label2.y + label2.height &&
      label1.y + label1.height > label2.y
    );
  }

  // Helper method to resolve collisions by moving labels
  private resolveCollision(label1: LabelBoundingBox, label2: LabelBoundingBox): { x: number, y: number } {
    // Determine which label to move (higher priority number gets moved)
    const labelToMove = label1.priority > label2.priority ? label1 : label2;
    const fixedLabel = label1.priority > label2.priority ? label2 : label1;

    // Calculate overlap amounts
    const overlapX = Math.min(
      labelToMove.x + labelToMove.width - fixedLabel.x,
      fixedLabel.x + fixedLabel.width - labelToMove.x
    );

    const overlapY = Math.min(
      labelToMove.y + labelToMove.height - fixedLabel.y,
      fixedLabel.y + fixedLabel.height - labelToMove.y
    );

    // Determine which direction requires less movement
    let newX = labelToMove.x;
    let newY = labelToMove.y;

    // For point labels, we prefer to move in the same direction as their original offset
    if (labelToMove.type === "point") {
      // Check if the point is to the left/right of what it's colliding with
      const isRightOfFixed = labelToMove.x > fixedLabel.x + fixedLabel.width / 2;
      const isBelowFixed = labelToMove.y > fixedLabel.y + fixedLabel.height / 2;

      // Move horizontally for wider collisions, vertically for taller ones
      if (overlapX < overlapY) {
        newX = isRightOfFixed ?
          fixedLabel.x + fixedLabel.width + 5 :
          fixedLabel.x - labelToMove.width - 5;
      } else {
        newY = isBelowFixed ?
          fixedLabel.y + fixedLabel.height + 5 :
          fixedLabel.y - labelToMove.height - 5;
      }
    }
    // For dimension labels, we have specific positioning needs
    else if (labelToMove.type === "dimension") {
      // Dimension labels should mostly move vertically
      newY = labelToMove.y > fixedLabel.y ?
        fixedLabel.y + fixedLabel.height + 5 :
        fixedLabel.y - labelToMove.height - 5;
    }

    return { x: newX, y: newY };
  }

  /**
   * Checks if the advancedSolutionMatrix is valid and has all required non-null properties
   * @returns true if the matrix is valid and can be used for calculations
   */
  private isValidSolutionMatrix(): boolean {
    const isValid = this.astroUtilsService.isValidSolutionMatrix(this.advancedSolutionMatrix);

    // Add detailed logging to troubleshoot solution matrix issues
    console.log("SOLUTION MATRIX STATUS:", {
      hasMatrix: !!this.advancedSolutionMatrix,
      isValid: isValid,
      serviceAvailable: !!this.astroUtilsService
    });

    return isValid;
  }

  /**
   * Shows the loading indicator with guaranteed visibility
   * This method ensures the loading indicator appears through multiple
   * change detection strategies
   */
  private showLoadingIndicator(): void {
    // Set the flag (ensure it's set)
    this.loadingUrlMeasurements = true;
    console.debug("Setting loadingUrlMeasurements=true via showLoadingIndicator()");

    // Force immediate change detection
    this.cdRef.markForCheck();
    this.cdRef.detectChanges();

    // Double-check in next JS event cycle to ensure it's visible
    this.windowRefService.utilsService.delay(10).subscribe(() => {
      this.loadingUrlMeasurements = true;
      this.cdRef.markForCheck();
      this.cdRef.detectChanges();
    });

    // As a fallback, also ensure the indicator stays visible for at least a minimum time
    // This helps users see it even if operations finish very quickly
    this.windowRefService.utilsService.delay(100).subscribe(() => {
      // Ensure the indicator is still shown by forcing another change detection cycle
      if (this.loadingUrlMeasurements) {
        console.debug("Refreshing loading indicator visibility");
        this.cdRef.markForCheck();
        this.cdRef.detectChanges();
      }
    });
  }

  /**
   * Hides the loading indicator with guaranteed update
   */
  private hideLoadingIndicator(): void {
    this.loadingUrlMeasurements = false;
    console.debug("Setting loadingUrlMeasurements=false via hideLoadingIndicator()");

    // Force change detection
    this.cdRef.markForCheck();
    this.cdRef.detectChanges();

    // Double-check in next JS event cycle to ensure flag is properly cleared
    this.windowRefService.utilsService.delay(300).subscribe(() => {
      this.loadingUrlMeasurements = false;
      this.cdRef.markForCheck();
      this.cdRef.detectChanges();
    });
  }

  /**
   * Helper method to finalize a measurement after both points are placed
   * This calculates distance, creates the measurement object, and resets for the next measurement
   */
  private _finalizeMeasurement(): void {
    if (!this.measureStartPoint || !this.measureEndPoint) {
      return;
    }

    // Calculate distance
    const pixelDistance = this.calculateDistance(
      this.measureStartPoint.x,
      this.measureStartPoint.y,
      this.measureEndPoint.x,
      this.measureEndPoint.y
    );

    // Format the distance for display (pixels or angular distance if plate-solved)
    if (this.advancedSolutionMatrix && this.measureStartPoint.ra !== null && this.measureEndPoint.ra !== null) {
      this.measureDistance = this.formatAngularDistance(pixelDistance);
    } else {
      this.measureDistance = `${Math.round(pixelDistance)} px`;
    }

    // Create measurement data object for saving
    const midX = (this.measureStartPoint.x + this.measureEndPoint.x) / 2;
    const midY = (this.measureStartPoint.y + this.measureEndPoint.y) / 2;

    const measurementData: MeasurementData = {
      startX: this.measureStartPoint.x,
      startY: this.measureStartPoint.y,
      endX: this.measureEndPoint.x,
      endY: this.measureEndPoint.y,
      midX: midX,
      midY: midY,
      distance: this.measureDistance,
      timestamp: Date.now(),
      startRa: this.measureStartPoint.ra,
      startDec: this.measureStartPoint.dec,
      endRa: this.measureEndPoint.ra,
      endDec: this.measureEndPoint.dec,
      startLabelX: 0, // Will be calculated
      startLabelY: 0, // Will be calculated
      endLabelX: 0, // Will be calculated
      endLabelY: 0, // Will be calculated
      showCircle: this.showCurrentCircle,
      showRectangle: this.showCurrentRectangle
    };

    // Calculate label positions
    this.updateCoordinateLabelPositions(measurementData);

    // Check if the measurement is outside boundaries before adding it
    measurementData.outOfBounds =
      this._checkPointOutsideBoundaries(measurementData.startX, measurementData.startY) ||
      this._checkPointOutsideBoundaries(measurementData.endX, measurementData.endY);

    // Save measurement to previous list
    this.previousMeasurements.push(measurementData);

    // No need to emit a separate finished event - measurementComplete already signals completion

    // Get the current shape preference first
    const currentCircle = this.showCurrentCircle;
    const currentRectangle = this.showCurrentRectangle;

    // Reset current measurement points after adding to previous measurements
    // This prevents duplicate display of the current measurement
    this.measureStartPoint = null;
    this.measureEndPoint = null;
    this.measureDistance = null;

    // Keep the shape preference settings so they apply to the next measurement
    this.showCurrentCircle = currentCircle;
    this.showCurrentRectangle = currentRectangle;

    // Update boundary status for all measurements
    this.updateBoundaryStatus();

    // Emit the completed measurement
    this.measurementComplete.emit(measurementData);
  }

  /**
   * Save the user's shape preference to a cookie
   */
  private saveMeasurementShapePreference(): void {
    if (!this.isBrowser) {
      return;
    }

    let preference = "none";

    if (this.showCurrentCircle) {
      preference = "circle";
    } else if (this.showCurrentRectangle) {
      preference = "rectangle";
    }

    // Save preference with 1 year expiration
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);

    this.cookieService.put(
      this.MEASUREMENT_SHAPE_COOKIE_NAME,
      preference,
      { expires: expirationDate }
    );
  }

  /**
   * Load the user's shape preference from a cookie
   */
  private loadMeasurementShapePreference(): void {
    if (this.isBrowser) {
      const preference = this.cookieService.get(this.MEASUREMENT_SHAPE_COOKIE_NAME);

      if (preference === "circle") {
        this.showCurrentCircle = true;
        this.showCurrentRectangle = false;
      } else if (preference === "rectangle") {
        this.showCurrentCircle = false;
        this.showCurrentRectangle = true;
      } else {
        // Default to no shape
        this.showCurrentCircle = false;
        this.showCurrentRectangle = false;
      }
    } else {
      // Default to no shape for SSR
      this.showCurrentCircle = false;
      this.showCurrentRectangle = false;
    }
  }

  /**
   * Helper method to save the current measurement to previous measurements
   */
  private saveToPreviousMeasurements(): void {
    if (!this.measureStartPoint || !this.measureEndPoint || !this.measureDistance) {
      return;
    }

    const measurementData: MeasurementData = {
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
      startLabelX: 0,
      startLabelY: 0,
      endLabelX: 0,
      endLabelY: 0,
      showCircle: this.showCurrentCircle,
      showRectangle: this.showCurrentRectangle
    };

    // Update label positions
    this.updateCoordinateLabelPositions(measurementData);

    // Save to previous measurements
    this.previousMeasurements.push(measurementData);
  }

  /**
   * Shows a warning modal about window resizing affecting measurements
   * Uses a direct approach with a custom modal in the template
   */
  private showResizeWarning(): void {
    if (!this.isBrowser) {
      return;
    }

    // Show the modal
    this.showResizeWarningModal = true;

    // Force change detection to ensure the modal appears immediately
    this.cdRef.detectChanges();
  }
}
