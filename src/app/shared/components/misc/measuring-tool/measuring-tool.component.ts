import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { CoordinatesFormatterService } from '@core/services/coordinates-formatter.service';
import { Store, select } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { PopNotificationsService } from '@core/services/pop-notifications.service';
import { TranslateService } from '@ngx-translate/core';
import {
  CreateMeasurementPreset,
  DeleteMeasurementPreset,
  LoadMeasurementPresets,
  SelectMeasurementPreset,
  ToggleSavedMeasurements
} from './store/measurement-preset.actions';
import {
  selectAllMeasurementPresets,
  selectShowSavedMeasurements
} from './store/measurement-preset.selectors';
import { MeasurementPresetInterface } from './measurement-preset.interface';
import { take, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { BaseComponentDirective } from '@shared/components/base-component.directive';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SaveMeasurementModalComponent } from './save-measurement-modal/save-measurement-modal.component';

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
  notes?: string;                   // Optional user notes about the measurement
}

export interface SolutionMatrix {
  matrixRect: string;
  matrixDelta: number;
  raMatrix: string;
  decMatrix: string;
}

@Component({
  selector: 'astrobin-measuring-tool',
  templateUrl: './measuring-tool.component.html',
  styleUrls: ['./measuring-tool.component.scss']
})
export class MeasuringToolComponent extends BaseComponentDirective implements OnInit, OnDestroy {
  @Input() active: boolean = false;
  @Input() imageElement: ElementRef<HTMLElement>;
  @Input() advancedSolutionMatrix: SolutionMatrix | null = null;
  @Input() windowWidth: number;
  @Input() windowHeight: number;
  @Input() setMouseOverUIElement: (value: boolean) => void;

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
  newMeasurementName: string = '';
  savedMeasurements: MeasurementPresetInterface[] = [];
  private destroy$ = new Subject<void>();

  // Mouse tracking
  mouseX: number | null = null;
  mouseY: number | null = null;

  // Drag functionality
  dragStartX: number | null = null;
  dragStartY: number | null = null;
  isDraggingPoint: 'start' | 'end' | string | null = null;

  // Shape visualization
  showCurrentCircle: boolean = false;
  showCurrentRectangle: boolean = false;

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

  // Flag to track if window has been resized (affecting measurement accuracy)
  public measurementsAffectedByResize: boolean = false;

  // Flag to control the visibility of the resize warning modal
  public showResizeWarningModal: boolean = false;

  // Cookie name for storing shape preferences
  private readonly MEASUREMENT_SHAPE_COOKIE_NAME = "astrobin-fullscreen-measurement-shape";

  // Constants
  protected readonly Math = Math;

  // Helper function to stabilize floating point values
  private _stabilizeValue(value: number, decimals: number = 4): number {
    return parseFloat(value.toFixed(decimals));
  }

  /**
   * Formats astronomical angles according to standard notation
   * - Less than 60 arcseconds: shows as arcseconds only
   * - Less than 60 arcminutes: shows as arcminutes and arcseconds
   * - Otherwise: shows as degrees, arcminutes, and arcseconds
   * Always rounds to the nearest arcsecond with no decimal places
   */
  formatAstronomicalAngle(arcseconds: number): string {
    // Round to the nearest arcsecond
    const totalArcseconds = Math.round(arcseconds);

    // Calculate components
    const degrees = Math.floor(totalArcseconds / 3600);
    const arcminutes = Math.floor((totalArcseconds % 3600) / 60);
    const remainingArcseconds = totalArcseconds % 60;

    // Format based on size
    if (totalArcseconds < 60) {
      // Less than 1 arcminute: show only arcseconds
      return `${remainingArcseconds}″`;
    } else if (totalArcseconds < 3600) {
      // Less than 1 degree: show arcminutes and arcseconds
      return `${arcminutes}′ ${remainingArcseconds}″`;
    } else {
      // 1 degree or more: show degrees, arcminutes, and arcseconds
      return `${degrees}° ${arcminutes}′ ${remainingArcseconds}″`;
    }
  }

  /**
   * Format angular distance consistently across the component
   */
  private _formatStableAngularDistance(angularDistance: number): string {
    // Stabilize the input value to reduce flickering
    const stableAngularDistance = this._stabilizeValue(angularDistance);

    // Convert to arcseconds - this is what formatAstronomicalAngle expects
    const arcseconds = stableAngularDistance * 3600;

    // Use the standardized astronomical angle formatter
    return this.formatAstronomicalAngle(arcseconds);
  }

  constructor(
    public readonly store$: Store<MainState>,
    public readonly cookieService: CookieService,
    public readonly coordinatesFormatter: CoordinatesFormatterService,
    public readonly cdRef: ChangeDetectorRef,
    public readonly ngZone: NgZone,
    private modalService: NgbModal,
    private popNotificationsService: PopNotificationsService,
    private translateService: TranslateService
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
  }

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

    // Add document level mouse move event listener when active
    if (this.active) {
      document.addEventListener('mousemove', this._onMeasuringMouseMove);
    }

    // Add window resize listener to maintain measurements when window is resized
    window.addEventListener('resize', this._onWindowResize);

    // Initialize previous window dimensions
    this._prevWindowWidth = window.innerWidth;
    this._prevWindowHeight = window.innerHeight;
  }

  ngOnDestroy(): void {
    // Clean up all event listeners
    document.removeEventListener('mousemove', this._onMeasuringMouseMove);
    document.removeEventListener('mousemove', this._onPointDragMove);
    document.removeEventListener('mouseup', this._onPointDragEnd);
    document.removeEventListener('mousemove', this._onPreviousMeasurementDragMove);
    document.removeEventListener('mouseup', this._onPreviousMeasurementDragEnd);
    document.removeEventListener('mousemove', this._onShapeDragMove);
    document.removeEventListener('mouseup', this._onShapeDragEnd);
    document.removeEventListener('mousemove', this._onCurrentShapeDragMove);
    document.removeEventListener('mouseup', this._onCurrentShapeDragEnd);
    window.removeEventListener('resize', this._onWindowResize);

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

    // If we have solution data, calculate celestial coordinates for this point
    if (this.advancedSolutionMatrix) {
      const coords = this.calculateCoordinatesAtPoint(event.clientX, event.clientY);
      if (coords) {
        this.measureStartPoint.ra = coords.ra;
        this.measureStartPoint.dec = coords.dec;
      } else {
        // If we can't calculate coordinates, set to null
        this.measureStartPoint.ra = null;
        this.measureStartPoint.dec = null;
      }
    } else {
      // If we don't have a solution matrix, set to null
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

        // If we have solution data, calculate celestial coordinates for this point
        if (this.advancedSolutionMatrix) {
          const coords = this.calculateCoordinatesAtPoint(upEvent.clientX, upEvent.clientY);
          if (coords) {
            this.measureEndPoint.ra = coords.ra;
            this.measureEndPoint.dec = coords.dec;
          } else {
            // If we can't calculate coordinates, set to null
            this.measureEndPoint.ra = null;
            this.measureEndPoint.dec = null;
          }
        } else {
          // If we don't have a solution matrix, set to null
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
      document.removeEventListener('mousemove', mouseMoveHandler);
      document.removeEventListener('mouseup', mouseUpHandler);

      // Reset drag state
      this._dragInProgress = false;

      // Small delay to prevent accidental double measurements
      setTimeout(() => {
        this._preventNextClick = false;
      }, 100);
    };

    // Add the event listeners
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler, { once: true });
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

      // If we have solution data, calculate celestial coordinates for this point
      if (this.advancedSolutionMatrix) {
        const coords = this.calculateCoordinatesAtPoint(event.clientX, event.clientY);
        if (coords) {
          this.measureStartPoint.ra = coords.ra;
          this.measureStartPoint.dec = coords.dec;
        } else {
          // If we can't calculate coordinates, set to null
          this.measureStartPoint.ra = null;
          this.measureStartPoint.dec = null;
        }
      } else {
        // If we don't have a solution matrix, set to null
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

      // If we have solution data, calculate celestial coordinates for this point
      if (this.advancedSolutionMatrix) {
        const coords = this.calculateCoordinatesAtPoint(event.clientX, event.clientY);
        if (coords) {
          this.measureStartPoint.ra = coords.ra;
          this.measureStartPoint.dec = coords.dec;
        } else {
          // If we can't calculate coordinates, set to null
          this.measureStartPoint.ra = null;
          this.measureStartPoint.dec = null;
        }
      } else {
        // If we don't have a solution matrix, set to null
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

      // If we have solution data, calculate celestial coordinates for this point
      if (this.advancedSolutionMatrix) {
        const coords = this.calculateCoordinatesAtPoint(event.clientX, event.clientY);
        if (coords) {
          this.measureEndPoint.ra = coords.ra;
          this.measureEndPoint.dec = coords.dec;
        } else {
          // If we can't calculate coordinates, set to null
          this.measureEndPoint.ra = null;
          this.measureEndPoint.dec = null;
        }
      } else {
        // If we don't have a solution matrix, set to null
        this.measureEndPoint.ra = null;
        this.measureEndPoint.dec = null;
      }

      // Finalize the measurement
      this._finalizeMeasurement();
    }
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
    if (!this.advancedSolutionMatrix) {
      return `${Math.round(distance)} px`;
    }

    // If we have coordinates for both points, use them to calculate the actual angular distance
    if (this.measureStartPoint?.ra !== null && this.measureStartPoint?.dec !== null &&
        this.measureEndPoint?.ra !== null && this.measureEndPoint?.dec !== null) {

      const angularDistance = this.calculateAngularDistance(
        this.measureStartPoint.ra,
        this.measureStartPoint.dec,
        this.measureEndPoint.ra,
        this.measureEndPoint.dec
      );

      // Use the common formatting method to avoid precision issues
      return this._formatStableAngularDistance(angularDistance);
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
  handlePointDragStart(event: MouseEvent, point: 'start' | 'end'): void {
    event.preventDefault();
    event.stopPropagation();

    this.isDraggingPoint = point;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;

    // Add event listeners for drag move and end
    document.addEventListener('mousemove', this._onPointDragMove);
    document.addEventListener('mouseup', this._onPointDragEnd);

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

    // Update the position of the point being dragged
    if (this.isDraggingPoint === 'start' && this.measureStartPoint) {
      this.measureStartPoint.x = event.clientX;
      this.measureStartPoint.y = event.clientY;

      // Update celestial coordinates if we have plate solution data
      if (this.advancedSolutionMatrix) {
        // Account for rotation when calculating coordinates during drag
        const coords = this.calculateCoordinatesAtPoint(event.clientX, event.clientY, true);
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

        // Format the distance based on whether we have celestial coordinates
        if (this.advancedSolutionMatrix && this.measureStartPoint.ra !== null && this.measureEndPoint.ra !== null) {
          this.measureDistance = this.formatAngularDistance(pixelDistance);
        } else {
          this.measureDistance = `${Math.round(pixelDistance)} px`;
        }
      }
    } else if (this.isDraggingPoint === 'end' && this.measureEndPoint) {
      this.measureEndPoint.x = event.clientX;
      this.measureEndPoint.y = event.clientY;

      // Update celestial coordinates if we have plate solution data
      if (this.advancedSolutionMatrix) {
        // Account for rotation when calculating coordinates during drag
        const coords = this.calculateCoordinatesAtPoint(event.clientX, event.clientY, true);
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

        // Format the distance based on whether we have celestial coordinates
        if (this.advancedSolutionMatrix && this.measureStartPoint.ra !== null && this.measureEndPoint.ra !== null) {
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
    document.removeEventListener('mousemove', this._onPointDragMove);
    document.removeEventListener('mouseup', this._onPointDragEnd);

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
  handlePreviousMeasurementDrag(event: MouseEvent, index: number, point: 'start' | 'end'): void {
    event.preventDefault();
    event.stopPropagation();

    this.isDraggingPoint = `prev${point.charAt(0).toUpperCase() + point.slice(1)}-${index}`;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;

    // Add event listeners for drag move and end
    document.addEventListener('mousemove', this._onPreviousMeasurementDragMove);
    document.addEventListener('mouseup', this._onPreviousMeasurementDragEnd);

    // Signal that dragging has started
    this._dragInProgress = true;
    this._preventNextClick = true;
  }

  /**
   * Handle previous measurement point drag movement
   */
  handlePreviousMeasurementDragMove(event: MouseEvent): void {
    if (!this.isDraggingPoint || !this._dragInProgress || !this.isDraggingPoint.startsWith('prev')) {
      return;
    }

    event.preventDefault();

    // Extract the index from the drag state string (prevStart-1 or prevEnd-1 -> 1)
    const parts = this.isDraggingPoint.split('-');
    const index = parseInt(parts[1], 10);

    if (isNaN(index) || index < 0 || index >= this.previousMeasurements.length) {
      return;
    }

    const measurement = this.previousMeasurements[index];

    // Update the position of the point being dragged
    if (this.isDraggingPoint.startsWith('prevStart')) {
      measurement.startX = event.clientX;
      measurement.startY = event.clientY;

      // Update celestial coordinates if we have plate solution data
      if (this.advancedSolutionMatrix) {
        // Account for rotation when calculating coordinates
        const coords = this.calculateCoordinatesAtPoint(event.clientX, event.clientY, true);
        if (coords) {
          measurement.startRa = coords.ra;
          measurement.startDec = coords.dec;
        }
      }
    } else if (this.isDraggingPoint.startsWith('prevEnd')) {
      measurement.endX = event.clientX;
      measurement.endY = event.clientY;

      // Update celestial coordinates if we have plate solution data
      if (this.advancedSolutionMatrix) {
        // Account for rotation when calculating coordinates
        const coords = this.calculateCoordinatesAtPoint(event.clientX, event.clientY, true);
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

    // Format the distance based on whether we have celestial coordinates
    if (this.advancedSolutionMatrix && measurement.startRa !== null && measurement.endRa !== null) {
      // If we have RA/Dec coordinates, calculate angular distance
      const angularDistance = this.calculateAngularDistance(
        measurement.startRa,
        measurement.startDec,
        measurement.endRa,
        measurement.endDec
      );

      // Convert to arcseconds and use consistent formatting
      const arcseconds = angularDistance * 3600;

      // Use the standardized astronomical angle formatter
      measurement.distance = this.formatAstronomicalAngle(arcseconds);
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
    if (this.isDraggingPoint && (this.isDraggingPoint.startsWith('prevStart-') || this.isDraggingPoint.startsWith('prevEnd-'))) {
      const parts = this.isDraggingPoint.split('-');
      const index = parseInt(parts[1], 10);

      if (!isNaN(index) && index >= 0 && index < this.previousMeasurements.length) {
        const measurement = this.previousMeasurements[index];

        // Always calculate on the fly based on current coordinates
        if (measurement.startRa !== null && measurement.endRa !== null) {
          const angularDistance = this.calculateAngularDistance(
            measurement.startRa,
            measurement.startDec,
            measurement.endRa,
            measurement.endDec
          );

          // Use consistent formatting
          measurement.distance = this._formatStableAngularDistance(angularDistance);
        }
      }
    }

    // Clean up event listeners
    document.removeEventListener('mousemove', this._onPreviousMeasurementDragMove);
    document.removeEventListener('mouseup', this._onPreviousMeasurementDragEnd);

    // Reset drag state
    this._dragInProgress = false;
    this.isDraggingPoint = null;
    this.dragStartX = null;
    this.dragStartY = null;
  }

  /**
   * Start dragging a shape (circle or rectangle)
   */
  handleShapeDragStart(event: MouseEvent, index: number, shapeType: 'circle' | 'rectangle'): void {
    event.preventDefault();
    event.stopPropagation();

    this.isDraggingPoint = `prevShape-${index}`;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;

    // Add event listeners for drag move and end
    document.addEventListener('mousemove', this._onShapeDragMove);
    document.addEventListener('mouseup', this._onShapeDragEnd);

    // Signal that dragging has started
    this._dragInProgress = true;
    this._preventNextClick = true;
  }

  // For debouncing coordinate updates during drag
  private _lastCoordUpdateTime = 0;
  private _coordUpdateDebounceMs = 100; // Update at most every 100ms


  /**
   * Handle shape drag movement
   */
  handleShapeDragMove(event: MouseEvent): void {
    if (!this.isDraggingPoint || !this._dragInProgress || !this.isDraggingPoint.startsWith('prevShape')) {
      return;
    }

    event.preventDefault();

    // Extract the index from the drag state string
    const parts = this.isDraggingPoint.split('-');
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
    // Only update if we have solution data and enough time has passed since last update
    const now = Date.now();
    if (this.advancedSolutionMatrix && (now - this._lastCoordUpdateTime > this._coordUpdateDebounceMs)) {
      this._lastCoordUpdateTime = now;

      // Run in ngZone to ensure Angular detects the changes
      this.ngZone.run(() => {
        // Get new RA/Dec for start point
        const startCoords = this.calculateCoordinatesAtPoint(measurement.startX, measurement.startY);
        if (startCoords) {
          measurement.startRa = startCoords.ra;
          measurement.startDec = startCoords.dec;
        }

        // Get new RA/Dec for end point
        const endCoords = this.calculateCoordinatesAtPoint(measurement.endX, measurement.endY);
        if (endCoords) {
          measurement.endRa = endCoords.ra;
          measurement.endDec = endCoords.dec;
        }

        // Update distance calculation if we have valid coordinates
        if (measurement.startRa !== null && measurement.endRa !== null) {
          const angularDistance = this.calculateAngularDistance(
            measurement.startRa,
            measurement.startDec,
            measurement.endRa,
            measurement.endDec
          );

          // Use consistent stable formatting for angular distances
          measurement.distance = this._formatStableAngularDistance(angularDistance);
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
    if (this.isDraggingPoint && this.isDraggingPoint.startsWith('prevShape')) {
      const parts = this.isDraggingPoint.split('-');
      const index = parseInt(parts[1], 10);

      if (!isNaN(index) && index >= 0 && index < this.previousMeasurements.length) {
        const measurement = this.previousMeasurements[index];

        // Ensure final update of celestial coordinates for start and end points
        if (this.advancedSolutionMatrix) {
          // Get new RA/Dec for start point
          const startCoords = this.calculateCoordinatesAtPoint(measurement.startX, measurement.startY);
          if (startCoords) {
            measurement.startRa = startCoords.ra;
            measurement.startDec = startCoords.dec;
          }

          // Get new RA/Dec for end point
          const endCoords = this.calculateCoordinatesAtPoint(measurement.endX, measurement.endY);
          if (endCoords) {
            measurement.endRa = endCoords.ra;
            measurement.endDec = endCoords.dec;
          }

          // Always recalculate based on new coordinates
          // This ensures honest representation of the actual measurement
          if (measurement.startRa !== null && measurement.endRa !== null) {
            const angularDistance = this.calculateAngularDistance(
              measurement.startRa,
              measurement.startDec,
              measurement.endRa,
              measurement.endDec
            );

            // Use consistent stable formatting for angular distances
            measurement.distance = this._formatStableAngularDistance(angularDistance);
          }

          // Force change detection to ensure updates are visible
          this.cdRef.detectChanges();
        }
      }
    }

    // Clean up event listeners
    document.removeEventListener('mousemove', this._onShapeDragMove);
    document.removeEventListener('mouseup', this._onShapeDragEnd);

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
  handleCurrentShapeDragStart(event: MouseEvent, shapeType: 'circle' | 'rectangle'): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.measureStartPoint || !this.measureEndPoint) {
      return;
    }

    this.isDraggingPoint = 'currentShape';
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;

    // Add event listeners for drag move and end
    document.addEventListener('mousemove', this._onCurrentShapeDragMove);
    document.addEventListener('mouseup', this._onCurrentShapeDragEnd);

    // Signal that dragging has started
    this._dragInProgress = true;
    this._preventNextClick = true;
  }

  /**
   * Handle current shape drag movement
   */
  handleCurrentShapeDragMove(event: MouseEvent): void {
    if (!this.isDraggingPoint || !this._dragInProgress || this.isDraggingPoint !== 'currentShape') {
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
        const startCoords = this.calculateCoordinatesAtPoint(this.measureStartPoint.x, this.measureStartPoint.y);
        if (startCoords) {
          this.measureStartPoint.ra = startCoords.ra;
          this.measureStartPoint.dec = startCoords.dec;
        }

        // Get new RA/Dec for end point
        const endCoords = this.calculateCoordinatesAtPoint(this.measureEndPoint.x, this.measureEndPoint.y);
        if (endCoords) {
          this.measureEndPoint.ra = endCoords.ra;
          this.measureEndPoint.dec = endCoords.dec;
        }

        // Update the distance calculation
        if (this.measureStartPoint.ra !== null && this.measureEndPoint.ra !== null) {
          const angularDistance = this.calculateAngularDistance(
            this.measureStartPoint.ra,
            this.measureStartPoint.dec,
            this.measureEndPoint.ra,
            this.measureEndPoint.dec
          );

          // Use consistent stable formatting for angular distances
          this.measureDistance = this._formatStableAngularDistance(angularDistance);
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
      const startCoords = this.calculateCoordinatesAtPoint(this.measureStartPoint.x, this.measureStartPoint.y);
      if (startCoords) {
        this.measureStartPoint.ra = startCoords.ra;
        this.measureStartPoint.dec = startCoords.dec;
      }

      // Recalculate end point RA/Dec
      const endCoords = this.calculateCoordinatesAtPoint(this.measureEndPoint.x, this.measureEndPoint.y);
      if (endCoords) {
        this.measureEndPoint.ra = endCoords.ra;
        this.measureEndPoint.dec = endCoords.dec;
      }

      // Always calculate distances on the fly based on the current coordinates
      else if (this.measureStartPoint.ra !== null && this.measureEndPoint.ra !== null) {
        const angularDistance = this.calculateAngularDistance(
          this.measureStartPoint.ra,
          this.measureStartPoint.dec,
          this.measureEndPoint.ra,
          this.measureEndPoint.dec
        );

        // Use consistent stable formatting for angular distances
        this.measureDistance = this._formatStableAngularDistance(angularDistance);
      }
    }

    // Clean up event listeners
    document.removeEventListener('mousemove', this._onCurrentShapeDragMove);
    document.removeEventListener('mouseup', this._onCurrentShapeDragEnd);

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
        console.log('Circle visualization toggled for measurement', index, ':', measurement.showCircle);
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
        console.log('Rectangle visualization toggled for measurement', index, ':', measurement.showRectangle);
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
      console.log('Current circle visualization toggled:', this.showCurrentCircle);
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
      console.log('Current rectangle visualization toggled:', this.showCurrentRectangle);
    }, 0);
  }

  /**
   * Clear all measurements
   */
  clearAllMeasurements(): void {
    this.previousMeasurements = [];
  }

  /**
   * Delete a specific measurement
   */
  deleteMeasurement(event: MouseEvent, index: number): void {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    // Prevent click from propagating to parent containers
    this._preventNextClick = true;

    // Remove the measurement
    this.previousMeasurements.splice(index, 1);

    // Force change detection
    setTimeout(() => {
      console.log('Measurement deleted, remaining:', this.previousMeasurements.length);
    }, 0);
  }

  /**
   * Calculate display positions for coordinate labels
   */
  updateCoordinateLabelPositions(measurement: MeasurementData): void {
    // Calculate the angle of the line
    const angle = Math.atan2(measurement.endY - measurement.startY, measurement.endX - measurement.startX);

    // Set offset parameters similar to fullscreen-image-viewer
    const pointRadius = 6;
    const labelDistance = 24; // Base distance from the point to place the label

    // Calculate how horizontal the line is
    // 0 = perfectly horizontal, PI/2 = perfectly vertical
    const absAngle = Math.abs(angle);
    const horizontalness = Math.min(
      Math.abs(absAngle), // Angle from positive x-axis
      Math.abs(absAngle - Math.PI) // Angle from negative x-axis
    );

    // Expand what constitutes "nearly horizontal" to include slacker angles
    const isNearlyHorizontal = horizontalness < Math.PI / 8; // Within ~22.5 degrees of horizontal (more forgiving)
    const isNearlyVertical = Math.abs(absAngle - Math.PI/2) < Math.PI / 12; // Within 15 degrees of vertical

    // Calculate extra distance based on how horizontal the line is
    // As the line gets more horizontal (horizontalness approaches 0), increase the distance
    let extraDistance = 0;

    // Calculate a diagonal factor - maximum at 45 and 135 degrees, minimum at 0 or 90 degrees
    // Math.abs ensures we get a positive factor regardless of the line direction
    // This gives us a value between 0 and 1, with 1 being at 45 or 135 degrees
    const diagonalFactor = Math.abs(Math.sin(2 * angle)) / 1.0; // abs(sin(2x)) peaks at 45 and 135 degrees

    // Add some vertical offset based on diagonal factor
    const verticalBoost = labelDistance * 0.8 * diagonalFactor; // 0.8x gives a more noticeable boost

    if (isNearlyHorizontal) {
      // For nearly horizontal lines, add significant extra distance to avoid overlap
      // The closer to horizontal, the larger the extra distance
      const horizontalFactor = 1 - (horizontalness / (Math.PI / 8)); // 0 to 1 factor, adjusted for wider angle
      extraDistance = labelDistance * 3.5 * horizontalFactor + verticalBoost; // Scale up with vertical boost
    } else {
      // For non-horizontal lines, still add the vertical boost
      extraDistance = verticalBoost;
    }

    // Start label - place in opposite direction of the line
    measurement.startLabelX = measurement.startX - (labelDistance + pointRadius + extraDistance) * Math.cos(angle);
    measurement.startLabelY = measurement.startY - (labelDistance + pointRadius + extraDistance) * Math.sin(angle);

    // End label - place in the direction of the line
    measurement.endLabelX = measurement.endX + (labelDistance + pointRadius + extraDistance) * Math.cos(angle);
    measurement.endLabelY = measurement.endY + (labelDistance + pointRadius + extraDistance) * Math.sin(angle);

    // For vertical lines, add a slight horizontal offset to avoid direct overlap
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
  }


  /**
   * Save the user's shape preference to a cookie
   */
  private saveMeasurementShapePreference(): void {
    let preference = 'none';

    if (this.showCurrentCircle) {
      preference = 'circle';
    } else if (this.showCurrentRectangle) {
      preference = 'rectangle';
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
    const preference = this.cookieService.get(this.MEASUREMENT_SHAPE_COOKIE_NAME);

    if (preference === 'circle') {
      this.showCurrentCircle = true;
      this.showCurrentRectangle = false;
    } else if (preference === 'rectangle') {
      this.showCurrentCircle = false;
      this.showCurrentRectangle = true;
    } else {
      // Default to no shape
      this.showCurrentCircle = false;
      this.showCurrentRectangle = false;
    }
  }

  /**
   * Calculate celestial coordinates at a given screen position
   * This depends on the advanced solution matrix being available
   */
  /**
   * Calculate celestial coordinates at a given screen position
   */
  calculateCoordinatesAtPoint(x: number, y: number, accountForRotation: boolean = false): { ra: number; dec: number } | null {
    try {
      if (!this.advancedSolutionMatrix) {
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

      // Get the image dimensions
      const imgBounds = imageElement.getBoundingClientRect();

      let adjustedX = x;
      let adjustedY = y;

      // Create a synthetic mouse event with the adjusted coordinates
      const syntheticEvent = new MouseEvent('mousemove', {
        clientX: adjustedX,
        clientY: adjustedY
      });

      // Use the shared service to calculate raw coordinates
      // This provides a cleaner data structure without HTML parsing
      const result = this.coordinatesFormatter.calculateRawCoordinates(
        syntheticEvent,
        imageElement as HTMLElement,
        this.advancedSolutionMatrix,
        {
          useClientCoords: true,
          naturalWidth: (imageElement as HTMLImageElement).naturalWidth
        }
      );

      if (!result || !result.coordinates) {
        return null;
      }

      // Convert the raw coordinate data to decimal format
      const raData = result.coordinates.ra;
      const decData = result.coordinates.dec;

      // Convert HMS to decimal hours
      const raDecimal = raData.hours + (raData.minutes / 60) + (raData.seconds / 3600);

      // Convert DMS to decimal degrees
      const decDecimal = decData.sign * (decData.degrees + (decData.minutes / 60) + (decData.seconds / 3600));

      return {
        ra: raDecimal,
        dec: decDecimal
      };
    } catch (error) {
      console.error("Error calculating coordinates:", error);
      return null;
    }
  }

  /**
   * Calculate angular distance between two celestial points
   */
  calculateAngularDistance(ra1: number, dec1: number, ra2: number, dec2: number): number {
    // Convert to radians
    const ra1Rad = ra1 * Math.PI / 12; // RA is in hours (0-24), so divide by 12 to get to range 0-2π
    const dec1Rad = dec1 * Math.PI / 180;
    const ra2Rad = ra2 * Math.PI / 12;
    const dec2Rad = dec2 * Math.PI / 180;

    // Use the haversine formula for great circle distance
    const dra = ra2Rad - ra1Rad;
    const ddec = dec2Rad - dec1Rad;
    const a = Math.sin(ddec/2) * Math.sin(ddec/2) +
              Math.cos(dec1Rad) * Math.cos(dec2Rad) *
              Math.sin(dra/2) * Math.sin(dra/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    // Convert to degrees
    return c * 180 / Math.PI;
  }


  /**
   * Format coordinates in a compact display format
   */
  formatCoordinatesCompact(ra: number | null, dec: number | null): string {
    // If either coordinate is null, return empty string
    if (ra === null || dec === null) {
      return '';
    }

    // Convert ra/dec to formatted strings
    const raHours = Math.floor(ra);
    const raMinutes = Math.floor((ra - raHours) * 60);
    const raSeconds = Math.floor(((ra - raHours) * 60 - raMinutes) * 60);

    const decDegrees = Math.floor(Math.abs(dec));
    const decMinutes = Math.floor((Math.abs(dec) - decDegrees) * 60);
    const decSeconds = Math.floor(((Math.abs(dec) - decDegrees) * 60 - decMinutes) * 60);

    const sign = dec >= 0 ? '+' : '-';

    return `${raHours.toString().padStart(2, '0')}h ${raMinutes.toString().padStart(2, '0')}m ${raSeconds.toString().padStart(2, '0')}s, ${sign}${decDegrees.toString().padStart(2, '0')}° ${decMinutes.toString().padStart(2, '0')}' ${decSeconds.toString().padStart(2, '0')}"`;
  }

  /**
   * Get horizontal celestial distance for rectangle
   *
   * @param measurement Optional measurement data containing additional information
   */
  getHorizontalCelestialDistance(x1: number, y: number, x2: number, measurement?: MeasurementData | MeasurementPresetInterface): string {
    // If no advanced solution, return empty (template will show px)
    if (!this.advancedSolutionMatrix) {
      return '';
    }

    // Get the coordinates at both points
    const startCoords = this.calculateCoordinatesAtPoint(x1, y);
    const endCoords = this.calculateCoordinatesAtPoint(x2, y);

    // If we have valid coordinates, calculate angular distance
    if (startCoords && endCoords) {
      const angularDistance = this.calculateAngularDistance(
        startCoords.ra,
        startCoords.dec,
        endCoords.ra,
        endCoords.dec
      );

      // Convert to arcseconds
      const arcseconds = angularDistance * 3600;

      // Format using standardized astronomical notation
      return this.formatAstronomicalAngle(arcseconds);
    }

    // If we couldn't calculate celestial coordinates, return empty string
    // The template will fall back to showing pixel distance
    return '';
  }

  /**
   * Get vertical celestial distance for rectangle
   *
   * @param measurement Optional measurement data containing additional information
   */
  getVerticalCelestialDistance(x: number, y1: number, y2: number, measurement?: MeasurementData | MeasurementPresetInterface): string {
    // If no advanced solution, return empty (template will show px)
    if (!this.advancedSolutionMatrix) {
      return '';
    }

    // Get the coordinates at both points
    const startCoords = this.calculateCoordinatesAtPoint(x, y1);
    const endCoords = this.calculateCoordinatesAtPoint(x, y2);

    // If we have valid coordinates, calculate angular distance
    if (startCoords && endCoords) {
      const angularDistance = this.calculateAngularDistance(
        startCoords.ra,
        startCoords.dec,
        endCoords.ra,
        endCoords.dec
      );

      // Convert to arcseconds
      const arcseconds = angularDistance * 3600;

      // Format using standardized astronomical notation
      return this.formatAstronomicalAngle(arcseconds);
    }

    // If we couldn't calculate celestial coordinates, return empty string
    // The template will fall back to showing pixel distance
    return '';
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
    const isNearlyVertical = Math.abs(absAngle - Math.PI/2) < Math.PI / 12; // Within 15 degrees of vertical

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
    const isNearlyVertical = Math.abs(absAngle - Math.PI/2) < Math.PI / 12; // Within 15 degrees of vertical

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

    if (this.measureStartPoint.ra !== null && this.measureEndPoint.ra !== null &&
        this.measureStartPoint.dec !== null && this.measureEndPoint.dec !== null &&
        this.showCurrentRectangle) {

      // For rectangular measurements, calculate width and height
      if (this.advancedSolutionMatrix) {
        // Calculate width in arcseconds (horizontal component)
        const minX = Math.min(this.measureStartPoint.x, this.measureEndPoint.x);
        const maxX = Math.max(this.measureStartPoint.x, this.measureEndPoint.x);
        const midY = (this.measureStartPoint.y + this.measureEndPoint.y) / 2;

        const leftCoords = this.calculateCoordinatesAtPoint(minX, midY);
        const rightCoords = this.calculateCoordinatesAtPoint(maxX, midY);

        if (leftCoords && rightCoords) {
          const angularWidth = this.calculateAngularDistance(
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

        const topCoords = this.calculateCoordinatesAtPoint(midX, minY);
        const bottomCoords = this.calculateCoordinatesAtPoint(midX, maxY);

        if (topCoords && bottomCoords) {
          const angularHeight = this.calculateAngularDistance(
            topCoords.ra, topCoords.dec,
            bottomCoords.ra, bottomCoords.dec
          );

          // Convert to arcseconds
          heightArcseconds = angularHeight * 3600;
        }

        // Set the default name to width x height using astronomical format
        if (widthArcseconds !== null && heightArcseconds !== null) {
          // Format using proper astronomical angle notation
          const widthFormatted = this.formatAstronomicalAngle(widthArcseconds);
          const heightFormatted = this.formatAstronomicalAngle(heightArcseconds);
          defaultName = `${widthFormatted} × ${heightFormatted}`;
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

            // Dispatch action to save preset
            this.store$.dispatch(new CreateMeasurementPreset({ preset }));
          }
        });
      });
    } catch (error) {
      console.error('Error opening modal:', error);
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

      if (originalMeasurement.startRa !== null && originalMeasurement.endRa !== null &&
          originalMeasurement.startDec !== null && originalMeasurement.endDec !== null &&
          originalMeasurement.showRectangle) {

        // For rectangular measurements, calculate width and height
        if (this.advancedSolutionMatrix) {
          // Calculate width in arcseconds (horizontal component)
          const minX = Math.min(originalMeasurement.startX, originalMeasurement.endX);
          const maxX = Math.max(originalMeasurement.startX, originalMeasurement.endX);
          const midY = (originalMeasurement.startY + originalMeasurement.endY) / 2;

          const leftCoords = this.calculateCoordinatesAtPoint(minX, midY);
          const rightCoords = this.calculateCoordinatesAtPoint(maxX, midY);

          if (leftCoords && rightCoords) {
            const angularWidth = this.calculateAngularDistance(
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

          const topCoords = this.calculateCoordinatesAtPoint(midX, minY);
          const bottomCoords = this.calculateCoordinatesAtPoint(midX, maxY);

          if (topCoords && bottomCoords) {
            const angularHeight = this.calculateAngularDistance(
              topCoords.ra, topCoords.dec,
              bottomCoords.ra, bottomCoords.dec
            );

            // Convert to arcseconds
            heightArcseconds = angularHeight * 3600;
          }

          // Set the default name to width x height using astronomical format
          if (widthArcseconds !== null && heightArcseconds !== null) {
            // Format using proper astronomical angle notation
            const widthFormatted = this.formatAstronomicalAngle(widthArcseconds);
            const heightFormatted = this.formatAstronomicalAngle(heightArcseconds);
            defaultName = `${widthFormatted} × ${heightFormatted}`;
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
        console.error('Error opening modal:', error);
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

        const leftCoords = this.calculateCoordinatesAtPoint(minX, midY);
        const rightCoords = this.calculateCoordinatesAtPoint(maxX, midY);

        if (leftCoords && rightCoords) {
          const angularWidth = this.calculateAngularDistance(
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

        const topCoords = this.calculateCoordinatesAtPoint(midX, minY);
        const bottomCoords = this.calculateCoordinatesAtPoint(midX, maxY);

        if (topCoords && bottomCoords) {
          const angularHeight = this.calculateAngularDistance(
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

        // Reset name field
        this.newMeasurementName = '';
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

    // Check if we have a solution matrix, required for accurate measurements
    if (!this.advancedSolutionMatrix) {
      this.popNotificationsService.info(
        this.translateService.instant("Measurement presets cannot be loaded on images without plate-solving data")
      );
      return;
    }

    // Save current measurement to previous measurements if it exists
    if (this.measureStartPoint && this.measureEndPoint && this.measureDistance) {
      this.saveToPreviousMeasurements();
    }

    // Get the center of the viewport for positioning
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Define default measurements if not provided in preset
    const defaultLength = 200; // pixels

    // Check if we have width and height in arcseconds from the preset
    const hasArcsecondDimensions = !!preset.widthArcseconds && !!preset.heightArcseconds;

    if (hasArcsecondDimensions) {
      // We have width and height in arcseconds, so we need to calculate the pixel dimensions
      // based on the plate scale of the image

      // Create a rectangle at the center of the screen
      // First calculate a reasonable pixel width and height based on the plate scale
      // and the saved arcsecond dimensions

      // We need to determine the plate scale (pixels per arcsecond) to convert
      // the saved arcsecond measurements to screen pixels

      // Let's try a simpler approach to calculate the plate scale

      // Get the center of the visible viewport
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      // Declare variables we'll calculate
      let horizontalPixelsPerArcsec = 0;
      let verticalPixelsPerArcsec = 0;

      // Calculate coordinates at the center
      const centerCoords = this.calculateCoordinatesAtPoint(centerX, centerY);
      if (!centerCoords) {
        this.popNotificationsService.error(
          this.translateService.instant("Error calculating coordinates at image center")
        );

        // If we can't even get center coordinates, use a very conservative estimate
        horizontalPixelsPerArcsec = 0.25;
        verticalPixelsPerArcsec = 0.25;

        // Skip to pixel dimension calculation
        const pixelsPerArcsec = 0.25;
        const pixelWidth = preset.widthArcseconds * pixelsPerArcsec;
        const pixelHeight = preset.heightArcseconds * pixelsPerArcsec;

        // Calculate the rectangle corners
        const halfWidth = pixelWidth / 2;
        const halfHeight = pixelHeight / 2;

        // Set the start and end points
        this.measureStartPoint = {
          x: centerX - halfWidth,
          y: centerY - halfHeight,
          ra: null,
          dec: null
        };

        this.measureEndPoint = {
          x: centerX + halfWidth,
          y: centerY + halfHeight,
          ra: null,
          dec: null
        };

        return;
      }

      // Try points that are shifted slightly from the center
      // Go +/- 10% of the viewport width/height from the center
      const offsetX = window.innerWidth * 0.1;
      const offsetY = window.innerHeight * 0.1;

      // Calculate coordinates at these offset points
      const rightCoords = this.calculateCoordinatesAtPoint(centerX + offsetX, centerY);
      const bottomCoords = this.calculateCoordinatesAtPoint(centerX, centerY + offsetY);

      if (!rightCoords || !bottomCoords) {
        console.error("Failed to calculate coordinates at offset points", {
          centerCoords,
          rightCoords,
          bottomCoords,
          offsetX,
          offsetY
        });

        // Try fallback method with smaller offsets
        const smallerOffsetX = window.innerWidth * 0.05;
        const smallerOffsetY = window.innerHeight * 0.05;

        // Calculate coordinates at these smaller offset points
        const rightCoordsSmall = this.calculateCoordinatesAtPoint(centerX + smallerOffsetX, centerY);
        const bottomCoordsSmall = this.calculateCoordinatesAtPoint(centerX, centerY + smallerOffsetY);

        // If still failed, use a fixed scale estimate as last resort
        if (!rightCoordsSmall || !bottomCoordsSmall) {
          console.warn("Using fallback fixed plate scale estimation");

          // Use a reasonable default plate scale of 0.5 pixels per arcsecond
          const estimatedPixelsPerArcsec = 0.5;

          // Calculate pixel dimensions based on the estimated plate scale
          const pixelWidth = preset.widthArcseconds * estimatedPixelsPerArcsec;
          const pixelHeight = preset.heightArcseconds * estimatedPixelsPerArcsec;

          // Skip to corner calculation
          const halfWidth = pixelWidth / 2;
          const halfHeight = pixelHeight / 2;

          // Calculate coordinates for the corners of the rectangle
          const startX = centerX - halfWidth;
          const startY = centerY - halfHeight;
          const endX = centerX + halfWidth;
          const endY = centerY + halfHeight;

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

          return;
        }

        // Use the smaller offsets
        const horizontalAngularDistanceSmall = this.calculateAngularDistance(
          centerCoords.ra, centerCoords.dec,
          rightCoordsSmall.ra, rightCoordsSmall.dec
        );

        const verticalAngularDistanceSmall = this.calculateAngularDistance(
          centerCoords.ra, centerCoords.dec,
          bottomCoordsSmall.ra, bottomCoordsSmall.dec
        );

        // Convert to arcseconds
        const horizontalArcsecondsSmall = horizontalAngularDistanceSmall * 3600;
        const verticalArcsecondsSmall = verticalAngularDistanceSmall * 3600;

        // Calculate pixels per arcsecond
        const horizontalPixelsPerArcsecSmall = smallerOffsetX / horizontalArcsecondsSmall;
        const verticalPixelsPerArcsecSmall = smallerOffsetY / verticalArcsecondsSmall;

        // Use these values instead
        horizontalPixelsPerArcsec = horizontalPixelsPerArcsecSmall;
        verticalPixelsPerArcsec = verticalPixelsPerArcsecSmall;
      }

      // Calculate angular distances if we have valid coordinates
      if (rightCoords && bottomCoords) {
        const horizontalAngularDistance = this.calculateAngularDistance(
          centerCoords.ra, centerCoords.dec,
          rightCoords.ra, rightCoords.dec
        );

        const verticalAngularDistance = this.calculateAngularDistance(
          centerCoords.ra, centerCoords.dec,
          bottomCoords.ra, bottomCoords.dec
        );

        // Convert to arcseconds
        const horizontalArcseconds = horizontalAngularDistance * 3600;
        const verticalArcseconds = verticalAngularDistance * 3600;

        // Calculate pixels per arcsecond
        horizontalPixelsPerArcsec = offsetX / horizontalArcseconds;
        verticalPixelsPerArcsec = offsetY / verticalArcseconds;
      }

      // Safeguard against zero or very low values
      if (horizontalPixelsPerArcsec <= 0.01) horizontalPixelsPerArcsec = 0.25;
      if (verticalPixelsPerArcsec <= 0.01) verticalPixelsPerArcsec = 0.25;

      // Use the average plate scale for better accuracy, with a minimum value
      const pixelsPerArcsec = Math.max(
        0.25, // minimum reasonable value
        (horizontalPixelsPerArcsec + verticalPixelsPerArcsec) / 2
      );

      // Calculate pixel dimensions based on the saved arcsecond dimensions
      // Important: we need to ensure the measurements are correctly scaled
      const pixelWidth = preset.widthArcseconds * pixelsPerArcsec;
      const pixelHeight = preset.heightArcseconds * pixelsPerArcsec;

      // Calculate half dimensions for corner placement
      const halfWidth = pixelWidth / 2;
      const halfHeight = pixelHeight / 2;

      // Calculate coordinates for the corners of the rectangle
      // For simplicity, we'll use top-left and bottom-right corners
      const startX = centerX - halfWidth;
      const startY = centerY - halfHeight;
      const endX = centerX + halfWidth;
      const endY = centerY + halfHeight;

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
      const startCoords = this.calculateCoordinatesAtPoint(startX, startY);
      if (startCoords) {
        this.measureStartPoint.ra = startCoords.ra;
        this.measureStartPoint.dec = startCoords.dec;
      }

      const endCoords = this.calculateCoordinatesAtPoint(endX, endY);
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

        // Start with a very precise plate scale calculation
        const pixelsPerArcsec = Math.max(
          0.25, // minimum reasonable value
          (horizontalPixelsPerArcsec + verticalPixelsPerArcsec) / 2
        );

        // Get the exact target dimensions in pixels
        const targetWidthPixels = preset.widthArcseconds * pixelsPerArcsec;
        const targetHeightPixels = preset.heightArcseconds * pixelsPerArcsec;

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
        const adjustedEndCoords = this.calculateCoordinatesAtPoint(adjustedEndX, adjustedEndY);
        if (adjustedEndCoords) {
          this.measureEndPoint.ra = adjustedEndCoords.ra;
          this.measureEndPoint.dec = adjustedEndCoords.dec;
        }
      }

      // Now calculate distance based on adjusted RA/Dec coordinates
      // Use the current points which may have been adjusted above
      if (this.measureStartPoint.ra !== null && this.measureEndPoint.ra !== null) {
        // Use the direct angular distance between start and end points (which may have been adjusted)
        const angularDistance = this.calculateAngularDistance(
          this.measureStartPoint.ra, this.measureStartPoint.dec,
          this.measureEndPoint.ra, this.measureEndPoint.dec
        );

        // Format this distance using our standard formatter
        this.measureDistance = this._formatStableAngularDistance(angularDistance);
      }
      // This is the fallback if for some reason we couldn't get RA/Dec values
      // from the measurement points directly
      else if (startCoords && endCoords) {
        // Use the original coordinate calculations from earlier in the function
        const angularDistance = this.calculateAngularDistance(
          startCoords.ra, startCoords.dec,
          endCoords.ra, endCoords.dec
        );
        this.measureDistance = this._formatStableAngularDistance(angularDistance);
      }
      // Last resort - just show pixel distance
      else {
        this.measureDistance = Math.round(defaultLength) + ' px';
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
        heightArcseconds: preset.heightArcseconds
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
      // No arcsecond dimensions, use default pixel based measurements
      // Default horizontal angle
      const angle = 0;

      // Calculate start and end points based on center, length and angle
      const halfLength = defaultLength / 2;
      const startX = centerX - halfLength * Math.cos(angle);
      const startY = centerY - halfLength * Math.sin(angle);
      const endX = centerX + halfLength * Math.cos(angle);
      const endY = centerY + halfLength * Math.sin(angle);

      // Create temporary points to calculate coordinates
      const tempStartPoint = {
        x: startX,
        y: startY,
        ra: null,
        dec: null
      };

      const tempEndPoint = {
        x: endX,
        y: endY,
        ra: null,
        dec: null
      };

      // Calculate celestial coordinates for the points
      const startCoords = this.calculateCoordinatesAtPoint(startX, startY);
      if (startCoords) {
        tempStartPoint.ra = startCoords.ra;
        tempStartPoint.dec = startCoords.dec;
      }

      const endCoords = this.calculateCoordinatesAtPoint(endX, endY);
      if (endCoords) {
        tempEndPoint.ra = endCoords.ra;
        tempEndPoint.dec = endCoords.dec;
      }

      // Determine the measurement distance using the same approach as our main logic
      let distanceText = '';
      if (tempStartPoint.ra !== null && tempEndPoint.ra !== null) {
        // Calculate direct angular distance between start and end points
        const angularDistance = this.calculateAngularDistance(
          tempStartPoint.ra, tempStartPoint.dec,
          tempEndPoint.ra, tempEndPoint.dec
        );
        distanceText = this._formatStableAngularDistance(angularDistance);
      } else {
        // Default to pixel distance if we couldn't calculate angular distance
        distanceText = Math.round(defaultLength) + ' px';
      }

      // Create a previous measurement instead of a current one for better styling
      const loadedMeasurement: MeasurementData = {
        startX: startX,
        startY: startY,
        endX: endX,
        endY: endY,
        midX: (startX + endX) / 2,
        midY: (startY + endY) / 2,
        distance: distanceText,
        timestamp: Date.now(),
        startRa: tempStartPoint.ra,
        startDec: tempStartPoint.dec,
        endRa: tempEndPoint.ra,
        endDec: tempEndPoint.dec,
        startLabelX: 0,
        startLabelY: 0,
        endLabelX: 0,
        endLabelY: 0,
        showCircle: false,
        showRectangle: false
      };

      // Update label positions
      this.updateCoordinateLabelPositions(loadedMeasurement);

      // Add to previous measurements
      this.previousMeasurements.push(loadedMeasurement);
    }

    // No notification needed - the measurement appearing is obvious to the user

    // Track selected preset in store
    this.store$.dispatch(new SelectMeasurementPreset({ preset }));
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
   * Delete a saved measurement
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

      if (preset.id) {
        // Dispatch action to delete preset
        this.store$.dispatch(new DeleteMeasurementPreset({ presetId: preset.id }));
      }
    }
  }

  /**
   * Reset the resize warning state when creating new measurements
   * Called when starting a new measurement
   */
  resetResizeWarningState(): void {
    if (this.measurementsAffectedByResize) {
      this.measurementsAffectedByResize = false;
      this._prevWindowWidth = window.innerWidth;
      this._prevWindowHeight = window.innerHeight;
      this.cdRef.detectChanges();
    }
  }

  /**
   * Handle window resize event
   * Shows a warning if there are measurements visible
   */
  handleWindowResize(event: UIEvent): void {
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
   * Shows a warning modal about window resizing affecting measurements
   * Uses a direct approach with a custom modal in the template
   */
  private showResizeWarning(): void {
    // Show the modal
    this.showResizeWarningModal = true;

    // Force change detection to ensure the modal appears immediately
    this.cdRef.detectChanges();
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
}
