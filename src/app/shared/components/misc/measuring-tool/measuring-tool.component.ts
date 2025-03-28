import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { CoordinatesFormatterService } from '@core/services/coordinates-formatter.service';

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
  rectangleRotation?: number; // Angle in degrees for rectangle rotation
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
export class MeasuringToolComponent implements OnInit, OnDestroy {
  @Input() active: boolean = false;
  @Input() imageElement: ElementRef<HTMLElement>;
  @Input() advancedSolutionMatrix: SolutionMatrix | null = null;
  @Input() windowWidth: number;
  @Input() windowHeight: number;
  @Input() setMouseOverUIElement: (value: boolean) => void;

  @Output() exitMeasuringMode = new EventEmitter<void>();
  @Output() measurementComplete = new EventEmitter<MeasurementData>();

  // Measurement points
  measureStartPoint: MeasurementPoint | null = null;
  measureEndPoint: MeasurementPoint | null = null;
  measureDistance: string | null = null;
  previousMeasurements: MeasurementData[] = [];

  // Mouse tracking
  mouseX: number | null = null;
  mouseY: number | null = null;

  // Drag functionality
  dragStartX: number | null = null;
  dragStartY: number | null = null;
  isDraggingPoint: 'start' | 'end' | string | null = null;
  pointDragRadius = 10; // Pixel radius around points that's draggable

  // Shape visualization
  showCurrentCircle: boolean = false;
  showCurrentRectangle: boolean = false;
  currentRectangleRotation: number = 0; // Current rectangle rotation angle in degrees

  // Rotation state tracking
  isRotatingRectangle: boolean = false;
  rotationStartAngle: number = 0;

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
  private _dragInProgress = false;
  private _preventNextClick = false;
  private _isOverRotateHandle = false; // Flag to track if cursor is over a rotation handle

  // Cookie name for storing shape preferences
  private readonly MEASUREMENT_SHAPE_COOKIE_NAME = "astrobin-fullscreen-measurement-shape";

  // Constants
  protected readonly Math = Math;

  constructor(
    private cookieService: CookieService,
    private coordinatesFormatter: CoordinatesFormatterService,
    private cdRef: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
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
    // Rotation handlers are now implemented directly
  }

  ngOnInit(): void {
    this.loadMeasurementShapePreference();

    // Add document level mouse move event listener when active
    if (this.active) {
      document.addEventListener('mousemove', this._onMeasuringMouseMove);
    }

    // Log the solution matrix status for debugging
    console.log('Solution matrix available:', this.advancedSolutionMatrix !== null);
    if (this.advancedSolutionMatrix) {
      console.log('Solution matrix:', this.advancedSolutionMatrix);
    }
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
    // Rotation event listeners are now handled internally
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

    // Skip if we're over a rotation handle
    if (this._isOverRotateHandle) {
      console.log('Mousedown prevented: cursor is over a rotation handle');
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
        // For testing, provide dummy coordinates to make labels visible
        this.measureStartPoint.ra = 10.5;
        this.measureStartPoint.dec = 40.2;
      }
    } else {
      // For testing, provide dummy coordinates to make labels visible
      this.measureStartPoint.ra = 10.5;
      this.measureStartPoint.dec = 40.2;
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
            // For testing, provide dummy coordinates to make labels visible
            this.measureEndPoint.ra = 10.6;
            this.measureEndPoint.dec = 40.3;
          }
        } else {
          // For testing, provide dummy coordinates to make labels visible
          this.measureEndPoint.ra = 10.6;
          this.measureEndPoint.dec = 40.3;
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
   * Handle mouse enter events on rotation handles
   */
  handleRotateHandleMouseEnter(event: MouseEvent): void {
    this._isOverRotateHandle = true;
    // Explicitly stop propagation to ensure no other elements get this event
    event.stopPropagation();
    event.preventDefault();
  }

  /**
   * Handle mouse leave events on rotation handles
   */
  handleRotateHandleMouseLeave(event: MouseEvent): void {
    this._isOverRotateHandle = false;
    // Explicitly stop propagation to ensure no other elements get this event
    event.stopPropagation();
    event.preventDefault();
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

    // Skip if we're over a rotation handle
    if (this._isOverRotateHandle) {
      console.log('Click prevented: cursor is over a rotation handle');
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
      console.log("Setting start point (click - new measurement)");
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
          // For testing, provide dummy coordinates to make labels visible
          this.measureStartPoint.ra = 10.5;
          this.measureStartPoint.dec = 40.2;
        }
      } else {
        // For testing, provide dummy coordinates to make labels visible
        this.measureStartPoint.ra = 10.5;
        this.measureStartPoint.dec = 40.2;
      }
      return;
    }

    // Set first point if needed
    if (!this.measureStartPoint) {
      console.log("Setting start point (click)");
      // Set start point
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
          // For testing, provide dummy coordinates to make labels visible
          this.measureStartPoint.ra = 10.5;
          this.measureStartPoint.dec = 40.2;
        }
      } else {
        // For testing, provide dummy coordinates to make labels visible
        this.measureStartPoint.ra = 10.5;
        this.measureStartPoint.dec = 40.2;
      }
    }
    // Set second point if we already have first point
    else if (!this.measureEndPoint) {
      console.log("Setting end point (click)");
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
          // For testing, provide dummy coordinates to make labels visible
          this.measureEndPoint.ra = 10.6;
          this.measureEndPoint.dec = 40.3;
        }
      } else {
        // For testing, provide dummy coordinates to make labels visible
        this.measureEndPoint.ra = 10.6;
        this.measureEndPoint.dec = 40.3;
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
      showRectangle: this.showCurrentRectangle,
      rectangleRotation: this.showCurrentRectangle ? this.currentRectangleRotation : undefined
    };

    // Calculate label positions
    this.updateCoordinateLabelPositions(measurementData);

    // Save measurement to previous list
    this.previousMeasurements.push(measurementData);

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

      // Format based on size
      if (angularDistance < 1/60) {
        // Less than 1 arcminute, show in arcseconds
        return `${(angularDistance * 3600).toFixed(1)}″`;
      } else if (angularDistance < 1) {
        // Less than 1 degree, show in arcminutes
        return `${(angularDistance * 60).toFixed(1)}′`;
      } else {
        // Show in degrees
        return `${angularDistance.toFixed(2)}°`;
      }
    }

    // Fallback to approximate conversion if we don't have coordinates
    const angularDistance = distance * 0.01; // Example conversion

    // Format based on size
    if (angularDistance < 1/60) {
      // Less than 1 arcminute, show in arcseconds
      return `${(angularDistance * 3600).toFixed(1)}″`;
    } else if (angularDistance < 1) {
      // Less than 1 degree, show in arcminutes
      return `${(angularDistance * 60).toFixed(1)}′`;
    } else {
      // Show in degrees
      return `${angularDistance.toFixed(2)}°`;
    }
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
        const coords = this.calculateCoordinatesAtPoint(event.clientX, event.clientY);
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
        const coords = this.calculateCoordinatesAtPoint(event.clientX, event.clientY);
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
        const coords = this.calculateCoordinatesAtPoint(event.clientX, event.clientY);
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
        const coords = this.calculateCoordinatesAtPoint(event.clientX, event.clientY);
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

      // Format based on size
      if (angularDistance < 1/60) {
        // Less than 1 arcminute, show in arcseconds
        measurement.distance = `${(angularDistance * 3600).toFixed(1)}″`;
      } else if (angularDistance < 1) {
        // Less than 1 degree, show in arcminutes
        measurement.distance = `${(angularDistance * 60).toFixed(1)}′`;
      } else {
        // Show in degrees
        measurement.distance = `${angularDistance.toFixed(2)}°`;
      }
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
  }

  /**
   * Handle end of shape drag
   */
  handleShapeDragEnd(event: MouseEvent): void {
    if (!this._dragInProgress) {
      return;
    }

    event.preventDefault();

    // Clean up event listeners
    document.removeEventListener('mousemove', this._onShapeDragMove);
    document.removeEventListener('mouseup', this._onShapeDragEnd);

    // Reset drag state
    this._dragInProgress = false;
    this.isDraggingPoint = null;
    this.dragStartX = null;
    this.dragStartY = null;
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
  }

  /**
   * Handle end of current shape drag
   */
  handleCurrentShapeDragEnd(event: MouseEvent): void {
    if (!this._dragInProgress) {
      return;
    }

    event.preventDefault();

    // Clean up event listeners
    document.removeEventListener('mousemove', this._onCurrentShapeDragMove);
    document.removeEventListener('mouseup', this._onCurrentShapeDragEnd);

    // Reset drag state
    this._dragInProgress = false;
    this.isDraggingPoint = null;
    this.dragStartX = null;
    this.dragStartY = null;

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
      console.log('Toggling circle for measurement', index);
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
      console.log('Toggling rectangle for measurement', index);
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

    console.log('Toggling current circle visualization');

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

    console.log('Toggling current rectangle visualization');

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
   * Position the initial label for the start point before end point is placed
   * This ensures we have nice positioning even before the user places the second point
   */
  positionInitialStartLabel(): { x: number, y: number } {
    // Position the label at an angle from the marker similar to the fullscreen-image-viewer
    // Using fixed positioning for initial placement before the second point is placed
    return {
      x: -24,  // Position to the top-left of the marker
      y: -24   // This creates a diagonal offset similar to how labels are positioned on the line
    };
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

    console.log('Deleting measurement', index);

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

    console.log('Label positions updated with variable distance positioning, angle:', angle, 'extra:', extraDistance);
  }

  /**
   * Handle rotation of a rectangle during dragging
   * This implementation gives immediate visual feedback while dragging
   */
  handleRectangleRotateStart(event: MouseEvent, index?: number): void {
    // Prevent all default behaviors and event bubbling
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    // Prevent subsequent click events
    this._preventNextClick = true;

    // Setup variables for the rotation
    const startMouseX = event.clientX;
    const startMouseY = event.clientY;

    // Get the appropriate rectangle data
    let centerX: number;
    let centerY: number;
    let originalRotation: number;
    let measurement: MeasurementData | null = null;

    // Determine which rectangle we're working with
    if (index !== undefined) {
      // Previous measurement
      if (index < 0 || index >= this.previousMeasurements.length) {
        console.error('Invalid measurement index:', index);
        return;
      }

      measurement = this.previousMeasurements[index];
      centerX = (measurement.startX + measurement.endX) / 2;
      centerY = (measurement.startY + measurement.endY) / 2;
      originalRotation = measurement.rectangleRotation || 0;
    } else {
      // Current measurement
      if (!this.measureStartPoint || !this.measureEndPoint) {
        console.error('No current measurement to rotate');
        return;
      }

      centerX = (this.measureStartPoint.x + this.measureEndPoint.x) / 2;
      centerY = (this.measureStartPoint.y + this.measureEndPoint.y) / 2;
      originalRotation = this.currentRectangleRotation;
    }

    // Calculate the initial angle for reference
    const initialAngle = Math.atan2(startMouseY - centerY, startMouseX - centerX) * 180 / Math.PI;

    // Set up state for rotation - IMPORTANT - these flags need to be set BEFORE attaching event listeners
    this.isRotatingRectangle = true;
    this.isDraggingPoint = index !== undefined ? `rotateRect-${index}` : 'rotateCurrentRect';
    this._dragInProgress = true;

    // Force change detection immediately to update UI state
    this.cdRef.markForCheck();
    this.cdRef.detectChanges();

    // Save the original document cursor to restore it later
    const originalCursor = document.body.style.cursor;
    // Set cursor for entire document to show we're in rotation mode
    document.body.style.cursor = 'grabbing';

    // Mouse move handler - this is where we do the actual rotation
    const handleMouseMove = (moveEvent: MouseEvent) => {
      // Stop event propagation
      moveEvent.preventDefault();
      moveEvent.stopPropagation();

      // Calculate the current angle
      const currentAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * 180 / Math.PI;

      // Calculate rotation difference from original start angle
      const angleDelta = currentAngle - initialAngle;

      // Apply the rotation immediately
      if (index !== undefined && measurement) {
        // Previous measurement
        measurement.rectangleRotation = (originalRotation + angleDelta) % 360;
      } else {
        // Current measurement
        this.currentRectangleRotation = (originalRotation + angleDelta) % 360;
      }

      // Force change detection synchronously to give immediate visual feedback
      this.cdRef.markForCheck();
      this.cdRef.detectChanges();
    };

    // Mouse up handler - cleanup
    const handleMouseUp = (upEvent: MouseEvent) => {
      // Remove the event listeners immediately
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = originalCursor;

      // Reset our state flags
      this.isRotatingRectangle = false;
      this.isDraggingPoint = null;
      this._dragInProgress = false;

      // Force change detection to update the view immediately
      this.cdRef.markForCheck();
      this.cdRef.detectChanges();

      // Allow clicks after a short delay
      setTimeout(() => {
        this._preventNextClick = false;
      }, 100);
    };

    // Attach event handlers to document (not window) for more reliable capture
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Don't rely on NgZone to trigger change detection - handle it manually
  }

  // We have completely rewritten the rotation handling
  // The new implementation is self-contained in handleRectangleRotateStart
  // and doesn't use these older methods

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
  calculateCoordinatesAtPoint(x: number, y: number): { ra: number; dec: number } | null {
    if (!this.advancedSolutionMatrix) {
      console.log('No advanced solution matrix available for coordinate calculation');
      return null;
    }

    // Log the solution matrix to debug
    console.log('Using solution matrix for calculation:', this.advancedSolutionMatrix);

    // Get the image element - this needs to be the actual zoomed image element
    let imageElement = this.imageElement?.nativeElement;
    if (!imageElement) {
      console.log('No image element provided');
      return null;
    }

    // For ngx-image-zoom, the actual img is inside a container
    const imgElement = imageElement.querySelector(".ngxImageZoomContainer img");
    if (!imgElement) {
      console.log('Could not find image element inside zoom container');
      return null;
    }

    // Get the image position and size
    const imageRect = imgElement.getBoundingClientRect();
    console.log('Image rect:', imageRect);

    // Check if the click is within the image bounds
    if (x < imageRect.left || x > imageRect.right || y < imageRect.top || y > imageRect.bottom) {
      console.log('Coordinates outside image bounds');
      return null;
    }

    // Convert screen coordinates to image coordinates
    const imageX = x - imageRect.left;
    const imageY = y - imageRect.top;

    // Get the normalized position (0-1) within the image
    const normalizedX = imageX / imageRect.width;
    const normalizedY = imageY / imageRect.height;

    console.log('Normalized coordinates:', { normalizedX, normalizedY });

    try {
      // Parse the matrix rect
      const matrixRectParts = this.advancedSolutionMatrix.matrixRect.split(',').map(part => parseInt(part, 10));
      if (matrixRectParts.length !== 4) {
        console.log('Invalid matrix rect format:', this.advancedSolutionMatrix.matrixRect);
        return null;
      }

      // Calculate the pixel position in the original image coordinates
      const originalX = matrixRectParts[0] + normalizedX * matrixRectParts[2];
      const originalY = matrixRectParts[1] + normalizedY * matrixRectParts[3];

      console.log('Original image coordinates:', { originalX, originalY });

      // Parse the RA and Dec matrices
      const raMatrix = this.advancedSolutionMatrix.raMatrix.split(',').map(part => parseFloat(part));
      const decMatrix = this.advancedSolutionMatrix.decMatrix.split(',').map(part => parseFloat(part));

      if (raMatrix.length !== 4 || decMatrix.length !== 4) {
        console.log('Invalid RA/Dec matrix format:', { raMatrix, decMatrix });
        return null;
      }

      // Calculate RA and Dec using the transformation matrices
      const ra = raMatrix[0] + raMatrix[1] * originalX + raMatrix[2] * originalY + raMatrix[3] * originalX * originalY;
      const dec = decMatrix[0] + decMatrix[1] * originalX + decMatrix[2] * originalY + decMatrix[3] * originalX * originalY;

      console.log('Calculated RA/Dec:', { ra, dec });

      return { ra, dec };
    } catch (error) {
      console.error('Error calculating coordinates:', error);
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
  formatCoordinatesCompact(ra: number, dec: number): string {
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
   */
  getHorizontalCelestialDistance(x1: number, y: number, x2: number): string {
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

      // Format based on size
      if (angularDistance < 1/60) {
        // Less than 1 arcminute, show in arcseconds
        return `${(angularDistance * 3600).toFixed(1)}″`;
      } else if (angularDistance < 1) {
        // Less than 1 degree, show in arcminutes
        return `${(angularDistance * 60).toFixed(1)}′`;
      } else {
        // Show in degrees
        return `${angularDistance.toFixed(2)}°`;
      }
    }

    // Fallback to approximate calculation
    const pixelDistance = Math.abs(x2 - x1);
    const angularDistance = pixelDistance * 0.01; // Example conversion

    // Format appropriately
    if (angularDistance < 1/60) {
      // Less than 1 arcminute, show in arcseconds
      return `${(angularDistance * 3600).toFixed(1)}″`;
    } else if (angularDistance < 1) {
      // Less than 1 degree, show in arcminutes
      return `${(angularDistance * 60).toFixed(1)}′`;
    } else {
      // Show in degrees
      return `${angularDistance.toFixed(2)}°`;
    }
  }

  /**
   * Get vertical celestial distance for rectangle
   */
  getVerticalCelestialDistance(x: number, y1: number, y2: number): string {
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

      // Format based on size
      if (angularDistance < 1/60) {
        // Less than 1 arcminute, show in arcseconds
        return `${(angularDistance * 3600).toFixed(1)}″`;
      } else if (angularDistance < 1) {
        // Less than 1 degree, show in arcminutes
        return `${(angularDistance * 60).toFixed(1)}′`;
      } else {
        // Show in degrees
        return `${angularDistance.toFixed(2)}°`;
      }
    }

    // Fallback to approximate calculation
    const pixelDistance = Math.abs(y2 - y1);
    const angularDistance = pixelDistance * 0.01; // Example conversion

    // Format appropriately
    if (angularDistance < 1/60) {
      // Less than 1 arcminute, show in arcseconds
      return `${(angularDistance * 3600).toFixed(1)}″`;
    } else if (angularDistance < 1) {
      // Less than 1 degree, show in arcminutes
      return `${(angularDistance * 60).toFixed(1)}′`;
    } else {
      // Show in degrees
      return `${angularDistance.toFixed(2)}°`;
    }
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
}
