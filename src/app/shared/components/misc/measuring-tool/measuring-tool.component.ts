import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, Input, NgZone, OnDestroy, OnInit, Output, PLATFORM_ID } from "@angular/core";
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
import { take, takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SaveMeasurementModalComponent } from "./save-measurement-modal/save-measurement-modal.component";
import { SolutionInterface } from "@core/interfaces/solution.interface";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { InformationDialogComponent } from "@shared/components/misc/information-dialog/information-dialog.component";
import { isPlatformBrowser } from "@angular/common";

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
export class MeasuringToolComponent extends BaseComponentDirective implements OnInit, OnDestroy {
  @Input() active: boolean = false;
  @Input() imageElement: ElementRef<HTMLElement>;
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
  private destroy$ = new Subject<void>();
  // Bound event handlers
  private _onMeasuringMouseMove: any = null;
  private _onPointDragMove: any = null;
  private _onPointDragEnd: any = null;
  private _onPreviousMeasurementDragMove: any = null;
  private _onPreviousMeasurementDragEnd: any = null;
  private _onShapeDragMove: any = null;
  private _onShapeDragEnd: any = null;
  private _onCurrentShapeDragMove: any = null;
  private _onCurrentShapeDragEnd: any = null;
  private _onWindowResize: any = null;
  private _dragInProgress = false;
  private _preventNextClick = false;
  // Track the previous window dimensions to detect significant changes
  private _prevWindowWidth: number = 0;
  private _prevWindowHeight: number = 0;
  // Cookie name for storing shape preferences
  private readonly MEASUREMENT_SHAPE_COOKIE_NAME = "astrobin-fullscreen-measurement-shape";
  // For debouncing coordinate updates during drag
  private _lastCoordUpdateTime = 0;
  private _coordUpdateDebounceMs = 100; // Update at most every 100ms

  constructor(
    public readonly store$: Store<MainState>,
    public readonly cookieService: CookieService,
    public readonly coordinatesFormatter: CoordinatesFormatterService,
    public readonly astroUtilsService: AstroUtilsService,
    public readonly cdRef: ChangeDetectorRef,
    public readonly ngZone: NgZone,
    private modalService: NgbModal,
    private popNotificationsService: PopNotificationsService,
    private translateService: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    super(store$);

    // Initialize bound handlers
    this._onMeasuringMouseMove = this.handleMeasuringMouseMove.bind(this);
    this._onPointDragMove = this.handlePointDragMove.bind(this);
    this._onPointDragEnd = this.handlePointDragEnd.bind(this);
    this._onPreviousMeasurementDragMove = this.handlePreviousMeasurementDragMove.bind(this);
    this._onPreviousMeasurementDragEnd = this.handlePreviousMeasurementDragEnd.bind(this);
    this._onShapeDragMove = this.handleShapeDragMove.bind(this);
    this._onShapeDragEnd = this.handleShapeDragEnd.bind(this);
    this._onCurrentShapeDragMove = this.handleCurrentShapeDragMove.bind(this);
    this._onCurrentShapeDragEnd = this.handleCurrentShapeDragEnd.bind(this);
    this._onWindowResize = this.handleWindowResize.bind(this);

    // For SSR compatibility
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // Bound methods for use in pipes
  public boundCalculateCoordinatesAtPoint = (x: number, y: number, accountForRotation: boolean = false) => {
    if (!this.isValidSolutionMatrix()) {
      return null;
    }

    // Find the image element
    let imageElement = this.imageElement?.nativeElement?.querySelector(".ngxImageZoomFullContainer img");
    if (!imageElement || imageElement.getBoundingClientRect().width === 0) {
      imageElement = this.imageElement?.nativeElement?.querySelector(".ngxImageZoomContainer img");
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

    this.loadMeasurementShapePreference();

    // Subscribe to state changes
    this.store$.pipe(
      select(selectShowSavedMeasurements),
      takeUntil(this.destroy$)
    ).subscribe(showSavedMeasurements => {
      this.showSavedMeasurements = showSavedMeasurements;
    });

    this.store$.pipe(
      select(selectAllMeasurementPresets),
      takeUntil(this.destroy$)
    ).subscribe(presets => {
      this.savedMeasurements = presets;
    });

    // Load presets when the component initializes
    this.currentUser$.pipe(
      take(1),
      takeUntil(this.destroy$)
    ).subscribe(user => {
      if (user) {
        this.store$.dispatch(new LoadMeasurementPresets({ userId: user.id }));
      }
    });

    // Only add browser-specific event listeners when in browser environment
    if (this.isBrowser) {
      // Add document level mouse move event listener when active
      if (this.active) {
        document.addEventListener("mousemove", this._onMeasuringMouseMove);
      }

      // Add window resize listener to maintain measurements when window is resized
      window.addEventListener("resize", this._onWindowResize);

      // Initialize previous window dimensions
      this._prevWindowWidth = window.innerWidth;
      this._prevWindowHeight = window.innerHeight;
    }
  }

  ngOnDestroy(): void {
    // Only remove browser-specific event listeners when in browser environment
    if (this.isBrowser) {
      // Clean up all event listeners
      document.removeEventListener("mousemove", this._onMeasuringMouseMove);
      document.removeEventListener("mousemove", this._onPointDragMove);
      document.removeEventListener("mouseup", this._onPointDragEnd);
      document.removeEventListener("mousemove", this._onPreviousMeasurementDragMove);
      document.removeEventListener("mouseup", this._onPreviousMeasurementDragEnd);
      document.removeEventListener("mousemove", this._onShapeDragMove);
      document.removeEventListener("mouseup", this._onShapeDragEnd);
      document.removeEventListener("mousemove", this._onCurrentShapeDragMove);
      document.removeEventListener("mouseup", this._onCurrentShapeDragEnd);
      window.removeEventListener("resize", this._onWindowResize);
    }

    // Complete the destroy subject
    this.destroy$.next();
    this.destroy$.complete();

    // Call parent class ngOnDestroy
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

    // Get the offset of the image element
    const imageElement = this.imageElement?.nativeElement?.querySelector(".ngxImageZoomContainer img");
    if (!imageElement) {
      return;
    }

    // Check if the mouse down is within the bounds of the image
    const imageRect = imageElement.getBoundingClientRect();
    if (
      event.clientX < imageRect.left ||
      event.clientX > imageRect.right ||
      event.clientY < imageRect.top ||
      event.clientY > imageRect.bottom
    ) {
      return;
    }

    // Prevent text selection during drag
    event.preventDefault();

    // If already in the middle of a two-click measurement (start point exists but no end point),
    // don't start a new measurement with mouse down
    if (this.measureStartPoint && !this.measureEndPoint) {
      return;
    }

    // If we already have a start and end point, this is a new measurement
    if (this.measureStartPoint && this.measureEndPoint) {
      // Reset for a new measurement
      this.measureStartPoint = null;
      this.measureEndPoint = null;
      this.measureDistance = null;

      // Reset resize warning state for new measurements
      this.resetResizeWarningState();
    }

    // Store starting position to check if this is a click or drag
    const startX = event.clientX;
    const startY = event.clientY;

    // Keep track of whether we've moved enough to consider this a drag
    let hasDraggedEnough = false;
    const dragThreshold = 10; // Minimum pixels to move before considering it a drag

    // Track if we're in a drag operation (don't set flag yet)
    let isDragging = false;

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

    // If we have valid solution data, calculate celestial coordinates for this point
    if (this.isValidSolutionMatrix()) {
      const coords = this.boundCalculateCoordinatesAtPoint(event.clientX, event.clientY);
      if (coords) {
        this.measureStartPoint.ra = coords.ra;
        this.measureStartPoint.dec = coords.dec;
      } else {
        // If we can't calculate coordinates, set to null
        this.measureStartPoint.ra = null;
        this.measureStartPoint.dec = null;
      }
    } else {
      // If we don't have a valid solution matrix, set to null
      this.measureStartPoint.ra = null;
      this.measureStartPoint.dec = null;
    }

    // Add mouse move event listener to track the mouse position
    const mouseMoveHandler = (moveEvent: MouseEvent) => {
      // Calculate distance moved
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const distanceMoved = Math.sqrt(dx * dx + dy * dy);

      // If we've moved enough, consider this a drag operation
      if (distanceMoved >= dragThreshold) {
        hasDraggedEnough = true;
        isDragging = true;

        // Set the drag flag to prevent the click handler from running
        this._dragInProgress = true;
      }

      // Always update the mouse position for the dashed line preview
      this.mouseX = moveEvent.clientX;
      this.mouseY = moveEvent.clientY;
    };

    // Add mouse up event listener to complete the measurement
    const mouseUpHandler = (upEvent: MouseEvent) => {
      // Calculate final distance moved
      const dx = upEvent.clientX - startX;
      const dy = upEvent.clientY - startY;
      const distanceMoved = Math.sqrt(dx * dx + dy * dy);

      // Only complete the measurement if we dragged far enough
      if (hasDraggedEnough && isDragging) {
        // Set the end point at the mouse up position
        this.measureEndPoint = {
          x: upEvent.clientX,
          y: upEvent.clientY,
          ra: null,
          dec: null
        };

        // If we have valid solution data, calculate celestial coordinates for this point
        if (this.isValidSolutionMatrix()) {
          const coords = this.boundCalculateCoordinatesAtPoint(upEvent.clientX, upEvent.clientY);
          if (coords) {
            this.measureEndPoint.ra = coords.ra;
            this.measureEndPoint.dec = coords.dec;
          } else {
            // If we can't calculate coordinates, set to null
            this.measureEndPoint.ra = null;
            this.measureEndPoint.dec = null;
          }
        } else {
          // If we don't have a valid solution matrix, set to null
          this.measureEndPoint.ra = null;
          this.measureEndPoint.dec = null;
        }

        // Finalize the measurement
        this._finalizeMeasurement();

        // Set flag to prevent click handler from running
        this._preventNextClick = true;
      } else if (distanceMoved < dragThreshold) {
        // If we didn't drag far enough, it's treated like a normal click
        // Keep the start point set (so it appears immediately) but don't set end point
        // The user can set the end point with a second click
        this.measureEndPoint = null;
      }

      // Clean up event listeners
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", mouseUpHandler);

      // Reset drag state
      this._dragInProgress = false;

      // Small delay to prevent accidental double measurements
      setTimeout(() => {
        this._preventNextClick = false;
      }, 100);
    };

    // Add the event listeners
    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler, { once: true });
  }

  /**
   * Handle clicks on the measurement overlay to place points
   */
  handleMeasurementClick(event: MouseEvent): void {
    // Skip if this click should be prevented (e.g., it's part of a drag operation)
    if (this._preventNextClick) {
      this._preventNextClick = false;
      return;
    }

    // Skip if dragging is in progress
    if (this._dragInProgress) {
      return;
    }

    // Get the offset of the image element
    const imageElement = this.imageElement?.nativeElement?.querySelector(".ngxImageZoomContainer img");
    if (!imageElement) {
      return;
    }

    // Check if the click is within the bounds of the image
    const imageRect = imageElement.getBoundingClientRect();
    if (
      event.clientX < imageRect.left ||
      event.clientX > imageRect.right ||
      event.clientY < imageRect.top ||
      event.clientY > imageRect.bottom
    ) {
      return;
    }

    // If we have a completed measurement, start a new one
    if (this.measureStartPoint && this.measureEndPoint) {
      this.measureStartPoint = null;
      this.measureEndPoint = null;
      this.measureDistance = null;

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

      // If we have valid solution data, calculate celestial coordinates for this point
      if (this.isValidSolutionMatrix()) {
        const coords = this.boundCalculateCoordinatesAtPoint(event.clientX, event.clientY);
        if (coords) {
          this.measureStartPoint.ra = coords.ra;
          this.measureStartPoint.dec = coords.dec;
        } else {
          // If we can't calculate coordinates, set to null
          this.measureStartPoint.ra = null;
          this.measureStartPoint.dec = null;
        }
      } else {
        // If we don't have a valid solution matrix, set to null
        this.measureStartPoint.ra = null;
        this.measureStartPoint.dec = null;
      }
      return;
    }

    // Set first point if needed
    if (!this.measureStartPoint) {
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

      // If we have valid solution data, calculate celestial coordinates for this point
      if (this.isValidSolutionMatrix()) {
        const coords = this.boundCalculateCoordinatesAtPoint(event.clientX, event.clientY);
        if (coords) {
          this.measureStartPoint.ra = coords.ra;
          this.measureStartPoint.dec = coords.dec;
        } else {
          // If we can't calculate coordinates, set to null
          this.measureStartPoint.ra = null;
          this.measureStartPoint.dec = null;
        }
      } else {
        // If we don't have a valid solution matrix, set to null
        this.measureStartPoint.ra = null;
        this.measureStartPoint.dec = null;
      }
    }
    // Set second point if we already have first point
    else if (!this.measureEndPoint) {
      // Set end point (for two-click measurements)
      this.measureEndPoint = {
        x: event.clientX,
        y: event.clientY,
        ra: null,
        dec: null
      };

      // If we have valid solution data, calculate celestial coordinates for this point
      if (this.isValidSolutionMatrix()) {
        const coords = this.boundCalculateCoordinatesAtPoint(event.clientX, event.clientY);
        if (coords) {
          this.measureEndPoint.ra = coords.ra;
          this.measureEndPoint.dec = coords.dec;
        } else {
          // If we can't calculate coordinates, set to null
          this.measureEndPoint.ra = null;
          this.measureEndPoint.dec = null;
        }
      } else {
        // If we don't have a valid solution matrix, set to null
        this.measureEndPoint.ra = null;
        this.measureEndPoint.dec = null;
      }

      // Finalize the measurement
      this._finalizeMeasurement();
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

    // Add event listeners for drag move and end
    document.addEventListener("mousemove", this._onPointDragMove);
    document.addEventListener("mouseup", this._onPointDragEnd);

    // Signal that dragging has started
    this._dragInProgress = true;
    this._preventNextClick = true;
  }

  /**
   * Handle point dragging movement
   */
  handlePointDragMove(event: MouseEvent): void {
    if (!this.isDraggingPoint || !this._dragInProgress) {
      return;
    }

    event.preventDefault();

    // Update the position of the point being dragged, maintaining the original offset
    if (this.isDraggingPoint === "start" && this.measureStartPoint) {
      this.measureStartPoint.x = event.clientX + this.dragOffsetX;
      this.measureStartPoint.y = event.clientY + this.dragOffsetY;

      // Update celestial coordinates if we have valid plate solution data
      if (this.isValidSolutionMatrix()) {
        // Account for rotation when calculating coordinates during drag
        const coords = this.boundCalculateCoordinatesAtPoint(event.clientX + this.dragOffsetX, event.clientY + this.dragOffsetY, true);
        if (coords) {
          this.measureStartPoint.ra = coords.ra;
          this.measureStartPoint.dec = coords.dec;
        }
      }

      // Update the distance calculation
      if (this.measureEndPoint) {
        const pixelDistance = this.calculateDistance(
          this.measureStartPoint.x,
          this.measureStartPoint.y,
          this.measureEndPoint.x,
          this.measureEndPoint.y
        );

        // Format the distance based on whether we have valid celestial coordinates
        if (this.isValidSolutionMatrix() && this.measureStartPoint.ra !== null && this.measureEndPoint.ra !== null) {
          this.measureDistance = this.formatAngularDistance(pixelDistance);
        } else {
          this.measureDistance = `${Math.round(pixelDistance)} px`;
        }
      }
    } else if (this.isDraggingPoint === "end" && this.measureEndPoint) {
      this.measureEndPoint.x = event.clientX + this.dragOffsetX;
      this.measureEndPoint.y = event.clientY + this.dragOffsetY;

      // Update celestial coordinates if we have valid plate solution data
      if (this.isValidSolutionMatrix()) {
        // Account for rotation when calculating coordinates during drag
        const coords = this.boundCalculateCoordinatesAtPoint(event.clientX + this.dragOffsetX, event.clientY + this.dragOffsetY, true);
        if (coords) {
          this.measureEndPoint.ra = coords.ra;
          this.measureEndPoint.dec = coords.dec;
        }
      }

      // Update the distance calculation
      if (this.measureStartPoint) {
        const pixelDistance = this.calculateDistance(
          this.measureStartPoint.x,
          this.measureStartPoint.y,
          this.measureEndPoint.x,
          this.measureEndPoint.y
        );

        // Format the distance based on whether we have valid celestial coordinates
        if (this.isValidSolutionMatrix() && this.measureStartPoint.ra !== null && this.measureEndPoint.ra !== null) {
          this.measureDistance = this.formatAngularDistance(pixelDistance);
        } else {
          this.measureDistance = `${Math.round(pixelDistance)} px`;
        }
      }
    }

    // Force label position calculation and change detection
    if (this.measureStartPoint && this.measureEndPoint) {
      const startLabelX = this.calculateStartLabelX();
      const startLabelY = this.calculateStartLabelY();
      const endLabelX = this.calculateEndLabelX();
      const endLabelY = this.calculateEndLabelY();
    }
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
    document.removeEventListener("mousemove", this._onPointDragMove);
    document.removeEventListener("mouseup", this._onPointDragEnd);

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

    // Add event listeners for drag move and end
    document.addEventListener("mousemove", this._onPreviousMeasurementDragMove);
    document.addEventListener("mouseup", this._onPreviousMeasurementDragEnd);

    // Signal that dragging has started
    this._dragInProgress = true;
    this._preventNextClick = true;
  }

  /**
   * Handle previous measurement point drag movement
   */
  handlePreviousMeasurementDragMove(event: MouseEvent): void {
    if (!this.isDraggingPoint || !this._dragInProgress || !this.isDraggingPoint.startsWith("prev")) {
      return;
    }

    event.preventDefault();

    // Extract the index from the drag state string (prevStart-1 or prevEnd-1 -> 1)
    const parts = this.isDraggingPoint.split("-");
    const index = parseInt(parts[1], 10);

    if (isNaN(index) || index < 0 || index >= this.previousMeasurements.length) {
      return;
    }

    const measurement = this.previousMeasurements[index];

    // Update the position of the point being dragged, maintaining the offset
    if (this.isDraggingPoint.startsWith("prevStart")) {
      measurement.startX = event.clientX + this.dragOffsetX;
      measurement.startY = event.clientY + this.dragOffsetY;

      // Update celestial coordinates if we have valid plate solution data
      if (this.isValidSolutionMatrix()) {
        // Account for rotation when calculating coordinates
        const coords = this.boundCalculateCoordinatesAtPoint(event.clientX + this.dragOffsetX, event.clientY + this.dragOffsetY, true);
        if (coords) {
          measurement.startRa = coords.ra;
          measurement.startDec = coords.dec;
        }
      }
    } else if (this.isDraggingPoint.startsWith("prevEnd")) {
      measurement.endX = event.clientX + this.dragOffsetX;
      measurement.endY = event.clientY + this.dragOffsetY;

      // Update celestial coordinates if we have valid plate solution data
      if (this.isValidSolutionMatrix()) {
        // Account for rotation when calculating coordinates
        const coords = this.boundCalculateCoordinatesAtPoint(event.clientX + this.dragOffsetX, event.clientY + this.dragOffsetY, true);
        if (coords) {
          measurement.endRa = coords.ra;
          measurement.endDec = coords.dec;
        }
      }
    }

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
   * Handle end of previous measurement point drag
   */
  handlePreviousMeasurementDragEnd(event: MouseEvent): void {
    if (!this._dragInProgress) {
      return;
    }

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
    document.removeEventListener("mousemove", this._onPreviousMeasurementDragMove);
    document.removeEventListener("mouseup", this._onPreviousMeasurementDragEnd);

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

    // Add event listeners for drag move and end
    document.addEventListener("mousemove", this._onShapeDragMove);
    document.addEventListener("mouseup", this._onShapeDragEnd);

    // Signal that dragging has started
    this._dragInProgress = true;
    this._preventNextClick = true;
  }

  /**
   * Handle shape drag movement
   */
  handleShapeDragMove(event: MouseEvent): void {
    if (!this.isDraggingPoint || !this._dragInProgress || !this.isDraggingPoint.startsWith("prevShape")) {
      return;
    }

    event.preventDefault();

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

    // Update coordinates in real-time during drag, with debouncing
    // Only update if we have valid solution data and enough time has passed since last update
    const now = Date.now();
    if (this.isValidSolutionMatrix() && (now - this._lastCoordUpdateTime > this._coordUpdateDebounceMs)) {
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
    document.removeEventListener("mousemove", this._onShapeDragMove);
    document.removeEventListener("mouseup", this._onShapeDragEnd);

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

    // Add event listeners for drag move and end
    document.addEventListener("mousemove", this._onCurrentShapeDragMove);
    document.addEventListener("mouseup", this._onCurrentShapeDragEnd);

    // Signal that dragging has started
    this._dragInProgress = true;
    this._preventNextClick = true;
  }

  /**
   * Handle current shape drag movement
   */
  handleCurrentShapeDragMove(event: MouseEvent): void {
    if (!this.isDraggingPoint || !this._dragInProgress || this.isDraggingPoint !== "currentShape") {
      return;
    }

    event.preventDefault();

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

    // Update coordinates in real-time during drag, with debouncing
    // Only update if we have solution data and enough time has passed since last update
    const now = Date.now();
    if (this.advancedSolutionMatrix && (now - this._lastCoordUpdateTime > this._coordUpdateDebounceMs)) {
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
    document.removeEventListener("mousemove", this._onCurrentShapeDragMove);
    document.removeEventListener("mouseup", this._onCurrentShapeDragEnd);

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
      setTimeout(() => {
        console.log("Circle visualization toggled for measurement", index, ":", measurement.showCircle);
      }, 0);
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
      setTimeout(() => {
        console.log("Rectangle visualization toggled for measurement", index, ":", measurement.showRectangle);
      }, 0);
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
    setTimeout(() => {
      console.log("Current circle visualization toggled:", this.showCurrentCircle);
    }, 0);
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
    setTimeout(() => {
      console.log("Current rectangle visualization toggled:", this.showCurrentRectangle);
    }, 0);
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
    this.exitMeasuringMode.emit();
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
      const modalRef = this.modalService.open(SaveMeasurementModalComponent);
      modalRef.componentInstance.measurementData = measurementData;
      modalRef.componentInstance.defaultName = defaultName;

      // Handle the result when the modal is closed
      modalRef.result.then(result => {
        this.currentUser$.pipe(take(1)).subscribe(user => {
          if (user) {
            // Create the base preset object
            const preset: MeasurementPresetInterface = {
              name: result.name,
              notes: result.notes,
              user: user.id
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
        const modalRef = this.modalService.open(SaveMeasurementModalComponent);
        modalRef.componentInstance.measurementData = measurementData;
        modalRef.componentInstance.defaultName = defaultName;

        // Handle the result when the modal is closed
        modalRef.result.then(result => {
          this.currentUser$.pipe(take(1)).subscribe(user => {
            if (user) {
              const preset: MeasurementPresetInterface = {
                name: result.name,
                notes: result.notes,
                user: user.id
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
      if (user) {
        // Create the base preset object
        const preset: MeasurementPresetInterface = {
          name: this.newMeasurementName,
          notes: this.saveMeasurementNotes, // Include notes in the preset
          user: user.id
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
    // Check if user is logged in
    let isLoggedIn = false;
    this.currentUser$.pipe(take(1)).subscribe(user => {
      isLoggedIn = !!user;
    });

    if (!isLoggedIn) {
      return;
    }

    // Check if we have a solution matrix, required for loading measurements
    if (!this.advancedSolutionMatrix) {
      this.popNotificationsService.error(
        this.translateService.instant(
          "Measurement presets cannot be loaded on images without advanced plate-solving data. Use the measuring tool to create pixel-based measurements instead."
        )
      );
      return;
    }

    // We need to find the image element for proper centering
    let imageElement = this.imageElement?.nativeElement?.querySelector(".ngxImageZoomFullContainer img");

    if (!imageElement || imageElement.getBoundingClientRect().width === 0) {
      imageElement = this.imageElement?.nativeElement?.querySelector(".ngxImageZoomContainer img");
    }

    if (!imageElement) {
      this.popNotificationsService.error(
        this.translateService.instant("Cannot locate image element")
      );
      return;
    }

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
      }

      const endCoords = this.boundCalculateCoordinatesAtPoint(endX, endY);
      if (endCoords) {
        this.measureEndPoint.ra = endCoords.ra;
        this.measureEndPoint.dec = endCoords.dec;
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
    } else {
      // No arcsecond dimensions in preset
      this.popNotificationsService.error(
        this.translateService.instant("Invalid measurement preset: missing width/height dimensions")
      );
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
    this.clearAllMeasurements();

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
    return this.astroUtilsService.isValidSolutionMatrix(this.advancedSolutionMatrix);
  }

  // Helper function to stabilize floating point values
  private _stabilizeValue(value: number, decimals: number = 4): number {
    return parseFloat(value.toFixed(decimals));
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
