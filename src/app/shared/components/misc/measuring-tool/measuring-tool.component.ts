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

  // For storing original positions during rotation
  private _dragOriginalStart: {x: number, y: number} | null = null;
  private _dragOriginalEnd: {x: number, y: number} | null = null;

  // Image rotation container reference
  private _imageRotationContainer: HTMLElement | null = null;

  // Rotation increment for mouse wheel in degrees
  private readonly WHEEL_ROTATION_INCREMENT = 5;

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

  // Helper function to stabilize floating point values
  private _stabilizeValue(value: number, decimals: number = 4): number {
    return parseFloat(value.toFixed(decimals));
  }
  
  /**
   * Format angular distance consistently across the component
   * This method applies stabilization to prevent flickering from floating point issues
   */
  private _formatStableAngularDistance(angularDistance: number): string {
    // Stabilize the input value to reduce flickering
    const stableAngularDistance = this._stabilizeValue(angularDistance);
    
    // Format based on size, with stable thresholds
    const arcminThreshold = this._stabilizeValue(1/60);
    const degreeThreshold = 1;
    
    if (stableAngularDistance < arcminThreshold) {
      // Less than 1 arcminute, show in arcseconds
      const arcseconds = this._stabilizeValue(stableAngularDistance * 3600);
      
      // For very small values, prevent unnecessary frequent changes by rounding more
      if (arcseconds < 1) {
        return `${arcseconds.toFixed(2)}″`;
      } else {
        return `${arcseconds.toFixed(1)}″`;
      }
    } else if (stableAngularDistance < degreeThreshold) {
      // Less than 1 degree, show in arcminutes
      const arcminutes = this._stabilizeValue(stableAngularDistance * 60);
      return `${arcminutes.toFixed(1)}′`;
    } else {
      // Show in degrees
      return `${stableAngularDistance.toFixed(2)}°`;
    }
  }
  
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
      console.log('Solution matrix (debugging):', this.advancedSolutionMatrix);

      // Test coordinate calculation at a sample point in the center of the screen
      setTimeout(() => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const coords = this.calculateCoordinatesAtPoint(centerX, centerY, false);
        console.log('Sample coordinates at center:', coords);
      }, 1000);
    } else {
      console.warn('No solution matrix available! Coordinates will not be displayed.');
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

    // Clean up image rotation container if it exists
    if (this._imageRotationContainer && this._imageRotationContainer.parentElement) {
      // Find the original image element and restore its opacity
      const imageElement = this.imageElement?.nativeElement?.querySelector(".ngxImageZoomContainer img");
      if (imageElement) {
        (imageElement as HTMLElement).style.opacity = '1';
      }

      // Remove the rotation container
      this._imageRotationContainer.parentElement.removeChild(this._imageRotationContainer);
      this._imageRotationContainer = null;
    }
  }

  /**
   * Handle mouse down on the measurement overlay to start measuring
   */
  handleMeasurementMouseDown(event: MouseEvent): void {
    console.log('Measurement mousedown:', event);
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
          console.log('Drag point update - Start point coords:', {
            before: { ra: this.measureStartPoint.ra, dec: this.measureStartPoint.dec },
            after: { ra: coords.ra, dec: coords.dec }
          });
          this.measureStartPoint.ra = coords.ra;
          this.measureStartPoint.dec = coords.dec;
        } else {
          console.log('Failed to calculate start coordinates during drag');
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
          console.log('Drag point update - End point coords:', {
            before: { ra: this.measureEndPoint.ra, dec: this.measureEndPoint.dec },
            after: { ra: coords.ra, dec: coords.dec }
          });
          this.measureEndPoint.ra = coords.ra;
          this.measureEndPoint.dec = coords.dec;
        } else {
          console.log('Failed to calculate end coordinates during drag');
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
          console.log('Previous measurement drag - Start point coords:', {
            before: { ra: measurement.startRa, dec: measurement.startDec },
            after: { ra: coords.ra, dec: coords.dec }
          });
          measurement.startRa = coords.ra;
          measurement.startDec = coords.dec;
        } else {
          console.log('Failed to calculate previous measurement start coordinates during drag');
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
          console.log('Previous measurement drag - End point coords:', {
            before: { ra: measurement.endRa, dec: measurement.endDec },
            after: { ra: coords.ra, dec: coords.dec }
          });
          measurement.endRa = coords.ra;
          measurement.endDec = coords.dec;
        } else {
          console.log('Failed to calculate previous measurement end coordinates during drag');
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
          
          // Update the distance calculation
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
          
          console.log('Final update of RA/Dec coordinates for previous measurement after drag', {
            startRa: measurement.startRa,
            startDec: measurement.startDec,
            endRa: measurement.endRa,
            endDec: measurement.endDec
          });
          
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
      
      // Update distance calculation
      if (this.measureStartPoint.ra !== null && this.measureEndPoint.ra !== null) {
        const angularDistance = this.calculateAngularDistance(
          this.measureStartPoint.ra,
          this.measureStartPoint.dec,
          this.measureEndPoint.ra,
          this.measureEndPoint.dec
        );
        
        // Use consistent stable formatting for angular distances
        this.measureDistance = this._formatStableAngularDistance(angularDistance);
      }
      
      console.log('Final update of RA/Dec coordinates for current measurement after drag', {
        startRa: this.measureStartPoint.ra,
        startDec: this.measureStartPoint.dec,
        endRa: this.measureEndPoint.ra,
        endDec: this.measureEndPoint.dec
      });
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
   * Handle rotation by rotating the image instead of manipulating marker positions
   * This approach keeps the markers in place and rotates the view under them
   */
  handleRectangleRotateStart(event: MouseEvent, index?: number): void {
    // Prevent all default behaviors and event bubbling
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    // Prevent subsequent click events
    this._preventNextClick = true;

    // Get the image element to rotate
    const imageElement = this.imageElement?.nativeElement?.querySelector(".ngxImageZoomContainer img");
    if (!imageElement) {
      console.error('Could not find image element to rotate');
      return;
    }

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

    // Set up state for rotation
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

    // Create or get a rotation container for the image
    // This approach creates a wrapper that holds the image, which we can rotate
    if (!this._imageRotationContainer) {
      // Get the image's parent container
      const imageContainer = imageElement.parentElement;
      if (!imageContainer) {
        console.error('Cannot find image container for rotation');
        return;
      }

      // Create a wrapper element for rotation
      this._imageRotationContainer = document.createElement('div');
      this._imageRotationContainer.className = 'image-rotation-container';
      this._imageRotationContainer.style.position = 'absolute';
      this._imageRotationContainer.style.top = '0';
      this._imageRotationContainer.style.left = '0';
      this._imageRotationContainer.style.width = '100%';
      this._imageRotationContainer.style.height = '100%';
      this._imageRotationContainer.style.display = 'flex';
      this._imageRotationContainer.style.alignItems = 'center';
      this._imageRotationContainer.style.justifyContent = 'center';
      
      // Calculate the exact center of the image, not the rectangle
      const imgBounds = imageElement.getBoundingClientRect();
      const imageCenterX = imgBounds.width / 2;
      const imageCenterY = imgBounds.height / 2;
      
      // Set the transform origin to the exact center of the image
      this._imageRotationContainer.style.transformOrigin = `${imageCenterX}px ${imageCenterY}px`;
      
      this._imageRotationContainer.style.transition = 'transform 0.05s ease-out';
      this._imageRotationContainer.style.zIndex = '0';

      // Apply initial rotation if any (in opposite direction)
      this._imageRotationContainer.style.transform = `rotate(${-1 * originalRotation}deg)`;

      // Save the image's original parent node, size, and position
      const originalParent = imageElement.parentNode;
      const parentRect = (originalParent as HTMLElement).getBoundingClientRect();

      // Position the image container relative to its parent
      imageContainer.style.position = 'relative';

      // Clone the image for rotation
      // This approach avoids modifying the original image element
      const clonedImage = imageElement.cloneNode(true) as HTMLImageElement;

      // Capture all the computed styles from the original image
      const computedStyle = window.getComputedStyle(imageElement);

      // Apply those styles to the cloned image
      clonedImage.style.position = 'absolute';
      clonedImage.style.width = computedStyle.width;
      clonedImage.style.height = computedStyle.height;
      clonedImage.style.left = '0';
      clonedImage.style.top = '0';
      clonedImage.style.objectFit = computedStyle.objectFit;
      clonedImage.style.objectPosition = computedStyle.objectPosition;

      // Add the cloned image to the rotation container
      this._imageRotationContainer.appendChild(clonedImage);

      // Add the rotation container to the image container
      imageContainer.appendChild(this._imageRotationContainer);

      // Hide the original image
      (imageElement as HTMLElement).style.opacity = '0';
    } else {
      // Calculate the exact center of the image, not the rectangle
      const imgBounds = imageElement.getBoundingClientRect();
      const imageCenterX = imgBounds.width / 2;
      const imageCenterY = imgBounds.height / 2;
      
      // Update the transform origin to the exact center of the image
      this._imageRotationContainer.style.transformOrigin = `${imageCenterX}px ${imageCenterY}px`;

      // Reset to the current rotation (in opposite direction)
      this._imageRotationContainer.style.transform = `rotate(${-1 * originalRotation}deg)`;
    }

    // Mouse move handler - rotate the image container instead of the markers
    const handleMouseMove = (moveEvent: MouseEvent) => {
      // Stop event propagation
      moveEvent.preventDefault();
      moveEvent.stopPropagation();

      // Calculate the current angle
      const currentAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * 180 / Math.PI;

      // Calculate the angle delta in degrees
      const angleDelta = currentAngle - initialAngle;

      // Calculate the new rotation for the image only (opposite direction)
      // We rotate the image in the opposite direction of the rectangle
      // so that the image appears to rotate while the rectangle stays fixed
      const imageRotation = -1 * (originalRotation + angleDelta) % 360;

      // Apply rotation to the image container only
      if (this._imageRotationContainer) {
        this._imageRotationContainer.style.transform = `rotate(${imageRotation}deg)`;
      }

      // Calculate the new rotation angle
      const newRotation = originalRotation + angleDelta;

      // Store the rectangle's conceptual rotation angle in our model
      // and update celestial coordinates based on the rotation
      if (index !== undefined && measurement) {
        // Calculate the delta from previous position to update coordinates
        const previousRotation = measurement.rectangleRotation;
        const rotationDelta = newRotation - previousRotation;

        // Update the rotation
        measurement.rectangleRotation = newRotation;

        // Update celestial coordinates based on rotation
        this.updateCoordinatesForRotation(measurement, centerX, centerY, rotationDelta);

        // Update distance calculation based on new coordinates
        if (measurement.startRa !== null && measurement.endRa !== null) {
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
        }

        // Force update of coordinate labels by recalculating their positions
        this.updateCoordinateLabelPositions(measurement);
      } else if (this.measureStartPoint && this.measureEndPoint) {
        // Calculate the delta from previous position to update coordinates
        const previousRotation = this.currentRectangleRotation;
        const rotationDelta = newRotation - previousRotation;

        // Update the rotation
        this.currentRectangleRotation = newRotation;

        // Create a measurement data object to update coordinates
        const currentMeasurement: MeasurementData = {
          startX: this.measureStartPoint.x,
          startY: this.measureStartPoint.y,
          endX: this.measureEndPoint.x,
          endY: this.measureEndPoint.y,
          midX: centerX,
          midY: centerY,
          distance: this.measureDistance || '',
          timestamp: Date.now(),
          startRa: this.measureStartPoint.ra,
          startDec: this.measureStartPoint.dec,
          endRa: this.measureEndPoint.ra,
          endDec: this.measureEndPoint.dec,
          startLabelX: 0,
          startLabelY: 0,
          endLabelX: 0,
          endLabelY: 0,
          rectangleRotation: newRotation
        };

        // Update the coordinates
        this.updateCoordinatesForRotation(currentMeasurement, centerX, centerY, rotationDelta);

        // Update the current measurement points with new coordinates
        if (currentMeasurement.startRa !== null) {
          this.measureStartPoint.ra = currentMeasurement.startRa;
        }
        if (currentMeasurement.startDec !== null) {
          this.measureStartPoint.dec = currentMeasurement.startDec;
        }
        if (currentMeasurement.endRa !== null) {
          this.measureEndPoint.ra = currentMeasurement.endRa;
        }
        if (currentMeasurement.endDec !== null) {
          this.measureEndPoint.dec = currentMeasurement.endDec;
        }

        // Update the distance calculation for the current measurement
        if (this.measureStartPoint.ra !== null && this.measureEndPoint.ra !== null) {
          const pixelDistance = this.calculateDistance(
            this.measureStartPoint.x,
            this.measureStartPoint.y,
            this.measureEndPoint.x,
            this.measureEndPoint.y
          );

          const angularDistance = this.calculateAngularDistance(
            this.measureStartPoint.ra,
            this.measureStartPoint.dec,
            this.measureEndPoint.ra,
            this.measureEndPoint.dec
          );

          // Format based on size
          if (angularDistance < 1/60) {
            // Less than 1 arcminute, show in arcseconds
            this.measureDistance = `${(angularDistance * 3600).toFixed(1)}″`;
          } else if (angularDistance < 1) {
            // Less than 1 degree, show in arcminutes
            this.measureDistance = `${(angularDistance * 60).toFixed(1)}′`;
          } else {
            // Show in degrees
            this.measureDistance = `${angularDistance.toFixed(2)}°`;
          }
        }
      }

      console.log(`Rotating image: ${imageRotation}deg around (${centerX}, ${centerY})`);

      // Force change detection
      this.cdRef.markForCheck();
    };

    // Mouse up handler - cleanup
    const handleMouseUp = (upEvent: MouseEvent) => {
      // Remove the event listeners immediately
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = originalCursor;

      // Save the final rotation angle
      const finalRotation = index !== undefined && measurement
                            ? measurement.rectangleRotation
                            : this.currentRectangleRotation;

      console.log(`Final rotation: ${finalRotation}deg`);

      // Reset our state flags
      this.isRotatingRectangle = false;
      this.isDraggingPoint = null;
      this._dragInProgress = false;

      // Force change detection
      this.cdRef.markForCheck();
      this.cdRef.detectChanges();

      // Allow clicks after a short delay
      setTimeout(() => {
        this._preventNextClick = false;
      }, 100);
    };

    // Attach event handlers to document for reliable capture
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
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
  /**
   * Calculate celestial coordinates at a given screen position
   */
  calculateCoordinatesAtPoint(x: number, y: number, accountForRotation: boolean = true): { ra: number; dec: number } | null {
    console.log("Measuring tool: Calculating coordinates at point:", x, y);
    try {
      if (!this.advancedSolutionMatrix) {
        console.log("No advanced solution matrix available for coordinate calculation");
        return null;
      }

      // Find the image element
      let imageElement = this.imageElement?.nativeElement?.querySelector(".ngxImageZoomFullContainer img");
      if (!imageElement || imageElement.getBoundingClientRect().width === 0) {
        imageElement = this.imageElement?.nativeElement?.querySelector(".ngxImageZoomContainer img");
      }

      if (!imageElement) {
        console.log("No image element found");
        return null;
      }

      // Get the image dimensions
      const imgBounds = imageElement.getBoundingClientRect();

      // Apply rotation adjustment if needed
      let adjustedX = x;
      let adjustedY = y;

      if (accountForRotation && this._imageRotationContainer) {
        // Always use the exact center of the image for rotation
        // This ensures consistency with how the image is actually rotated
        const centerX = imgBounds.left + imgBounds.width / 2;
        const centerY = imgBounds.top + imgBounds.height / 2;

        // Get rotation angle
        const rotationStyle = this._imageRotationContainer.style.transform;
        const rotationMatch = rotationStyle.match(/rotate\(([-\d.]+)deg\)/);

        if (rotationMatch && rotationMatch[1]) {
          const rotationDegrees = parseFloat(rotationMatch[1]);
          const rotationRadians = (-rotationDegrees * Math.PI) / 180;

          // Rotate the point
          const originalPoint = this.rotatePointAroundCenter(
            { x, y },
            { x: centerX, y: centerY },
            rotationRadians
          );

          adjustedX = originalPoint.x;
          adjustedY = originalPoint.y;
        }
      }

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
        console.log('coordinatesFormatter.calculateRawCoordinates failed to calculate coordinates');
        return null;
      }

      // Convert the raw coordinate data to decimal format
      const raData = result.coordinates.ra;
      const decData = result.coordinates.dec;
      
      // Convert HMS to decimal hours
      const raDecimal = raData.hours + (raData.minutes / 60) + (raData.seconds / 3600);
      
      // Convert DMS to decimal degrees
      const decDecimal = decData.sign * (decData.degrees + (decData.minutes / 60) + (decData.seconds / 3600));
      
      console.log('Using raw RA/Dec from service:', {
        raComponents: [raData.hours, raData.minutes, raData.seconds],
        decComponents: [decData.sign, decData.degrees, decData.minutes, decData.seconds],
        converted: {
          ra: raDecimal,
          dec: decDecimal
        }
      });
      
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

    // If we couldn't calculate celestial coordinates, return empty string
    // The template will fall back to showing pixel distance
    return '';
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
   * Update celestial coordinates (RA/Dec) based on image rotation
   * This uses the plate solving solution to recalculate coordinates at the rotated positions
   */
  private updateCoordinatesForRotation(measurement: MeasurementData, centerX: number, centerY: number, rotationDelta: number): void {
    console.log('updateCoordinatesForRotation called with delta:', rotationDelta, 'center:', centerX, centerY);
    console.log('Original coordinates:', {
      start: { ra: measurement.startRa, dec: measurement.startDec },
      end: { ra: measurement.endRa, dec: measurement.endDec }
    });

    // Skip if we don't have a plate solution
    if (!this.advancedSolutionMatrix) {
      console.log('No plate solution available for coordinate update during rotation');
      return;
    }

    // Convert rotation delta to radians
    const rotationRadians = (rotationDelta * Math.PI) / 180;

    // Calculate the rotated start point position
    const startPointRotated = this.rotatePointAroundCenter(
      { x: measurement.startX, y: measurement.startY },
      { x: centerX, y: centerY },
      rotationRadians
    );

    // Calculate the rotated end point position
    const endPointRotated = this.rotatePointAroundCenter(
      { x: measurement.endX, y: measurement.endY },
      { x: centerX, y: centerY },
      rotationRadians
    );

    console.log('Original points:', {
      start: { x: measurement.startX, y: measurement.startY },
      end: { x: measurement.endX, y: measurement.endY }
    });
    console.log('Rotated points:', {
      start: startPointRotated,
      end: endPointRotated
    });

    // Get the image element for the actual image dimensions
    let imageElement = this.imageElement?.nativeElement;
    if (!imageElement) {
      console.log('No image element available for coordinate calculation during rotation');
      return;
    }

    // Create synthetic mouse positions for the start and end points
    // Pass accountForRotation=false since we're already manually doing the rotation transformation
    const startCoords = this.calculateCoordinatesAtPoint(startPointRotated.x, startPointRotated.y, false);
    if (startCoords) {
      const oldStartRa = measurement.startRa;
      const oldStartDec = measurement.startDec;

      measurement.startRa = startCoords.ra;  // RA is now in hours (0-24) format
      measurement.startDec = startCoords.dec;

      console.log('Updated start point coordinates:', {
        before: { ra: oldStartRa, dec: oldStartDec },
        after: { ra: startCoords.ra, dec: startCoords.dec }
      });
    } else {
      console.log('Failed to calculate new start point coordinates');
    }

    // Calculate new celestial coordinates for the rotated end point
    const endCoords = this.calculateCoordinatesAtPoint(endPointRotated.x, endPointRotated.y, false);
    if (endCoords) {
      const oldEndRa = measurement.endRa;
      const oldEndDec = measurement.endDec;

      measurement.endRa = endCoords.ra;  // RA is now in hours (0-24) format
      measurement.endDec = endCoords.dec;

      console.log('Updated end point coordinates:', {
        before: { ra: oldEndRa, dec: oldEndDec },
        after: { ra: endCoords.ra, dec: endCoords.dec }
      });
    } else {
      console.log('Failed to calculate new end point coordinates');
    }

    // Update the mid-point coordinates (needed for distance labels)
    const midX = (measurement.startX + measurement.endX) / 2;
    const midY = (measurement.startY + measurement.endY) / 2;
    measurement.midX = midX;
    measurement.midY = midY;
  }

  /**
   * Helper method to rotate a point around a center
   */
  private rotatePointAroundCenter(
    point: { x: number, y: number },
    center: { x: number, y: number },
    angleRadians: number
  ): { x: number, y: number } {
    const sin = Math.sin(angleRadians);
    const cos = Math.cos(angleRadians);

    // Translate point to origin
    const translatedX = point.x - center.x;
    const translatedY = point.y - center.y;

    // Rotate point around origin
    const rotatedX = translatedX * cos - translatedY * sin;
    const rotatedY = translatedX * sin + translatedY * cos;

    // Translate point back
    return {
      x: rotatedX + center.x,
      y: rotatedY + center.y
    };
  }

  /**
   * Handle rotation via mouse wheel on rotation handles
   */
  handleRotationWheel(event: WheelEvent, index?: number): void {
    // Prevent default scrolling
    event.preventDefault();
    event.stopPropagation();

    // Determine which rotation we're working with
    let centerX: number;
    let centerY: number;
    let currentRotation: number;
    let measurement: MeasurementData | null = null;

    // Get the measurement and center point
    if (index !== undefined) {
      // Previous measurement
      if (index < 0 || index >= this.previousMeasurements.length) {
        console.error('Invalid measurement index:', index);
        return;
      }

      measurement = this.previousMeasurements[index];
      centerX = (measurement.startX + measurement.endX) / 2;
      centerY = (measurement.startY + measurement.endY) / 2;
      currentRotation = measurement.rectangleRotation || 0;
    } else {
      // Current measurement
      if (!this.measureStartPoint || !this.measureEndPoint) {
        console.error('No current measurement to rotate');
        return;
      }

      centerX = (this.measureStartPoint.x + this.measureEndPoint.x) / 2;
      centerY = (this.measureStartPoint.y + this.measureEndPoint.y) / 2;
      currentRotation = this.currentRectangleRotation;
    }

    // Determine rotation direction and amount based on wheel delta
    // Negative delta means scrolling down, positive means scrolling up
    const direction = event.deltaY > 0 ? -1 : 1;
    const rotationChange = direction * this.WHEEL_ROTATION_INCREMENT;

    // Calculate the new rotation angle
    const newRotation = (currentRotation + rotationChange) % 360;

    // Update the image rotation (in opposite direction)
    if (this._imageRotationContainer) {
      // Find the image element
      let imageElement = this.imageElement?.nativeElement?.querySelector(".ngxImageZoomFullContainer img");
      if (!imageElement) {
        imageElement = this.imageElement?.nativeElement?.querySelector(".ngxImageZoomContainer img");
      }
      
      if (imageElement) {
        // Calculate the exact center of the image
        const imgBounds = imageElement.getBoundingClientRect();
        const imageCenterX = imgBounds.width / 2;
        const imageCenterY = imgBounds.height / 2;
        
        // Set transform origin to the exact center of the image
        this._imageRotationContainer.style.transformOrigin = `${imageCenterX}px ${imageCenterY}px`;
      }
      
      this._imageRotationContainer.style.transform = `rotate(${-1 * newRotation}deg)`;
    }

    // Update rotation in the data model
    if (index !== undefined && measurement) {
      measurement.rectangleRotation = newRotation;

      // Update the RA/Dec coordinates based on rotation
      this.updateCoordinatesForRotation(measurement, centerX, centerY, rotationChange);

      // Update distance calculation based on new coordinates
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

      // Force update of coordinate labels by recalculating their positions
      this.updateCoordinateLabelPositions(measurement);
    } else if (this.measureStartPoint && this.measureEndPoint) {
      this.currentRectangleRotation = newRotation;

      // Update current measurement RA/Dec based on rotation
      const currentMeasurement: MeasurementData = {
        startX: this.measureStartPoint.x,
        startY: this.measureStartPoint.y,
        endX: this.measureEndPoint.x,
        endY: this.measureEndPoint.y,
        midX: centerX,
        midY: centerY,
        distance: this.measureDistance || '',
        timestamp: Date.now(),
        startRa: this.measureStartPoint.ra,
        startDec: this.measureStartPoint.dec,
        endRa: this.measureEndPoint.ra,
        endDec: this.measureEndPoint.dec,
        startLabelX: 0,
        startLabelY: 0,
        endLabelX: 0,
        endLabelY: 0,
        rectangleRotation: newRotation
      };

      this.updateCoordinatesForRotation(currentMeasurement, centerX, centerY, rotationChange);

      // Update the current measurement points with new coordinates
      if (currentMeasurement.startRa !== null) {
        this.measureStartPoint.ra = currentMeasurement.startRa;
      }
      if (currentMeasurement.startDec !== null) {
        this.measureStartPoint.dec = currentMeasurement.startDec;
      }
      if (currentMeasurement.endRa !== null) {
        this.measureEndPoint.ra = currentMeasurement.endRa;
      }
      if (currentMeasurement.endDec !== null) {
        this.measureEndPoint.dec = currentMeasurement.endDec;
      }

      // Update the distance calculation for the current measurement
      if (this.measureStartPoint.ra !== null && this.measureEndPoint.ra !== null) {
        const angularDistance = this.calculateAngularDistance(
          this.measureStartPoint.ra,
          this.measureStartPoint.dec,
          this.measureEndPoint.ra,
          this.measureEndPoint.dec
        );

        // Format based on size
        if (angularDistance < 1/60) {
          // Less than 1 arcminute, show in arcseconds
          this.measureDistance = `${(angularDistance * 3600).toFixed(1)}″`;
        } else if (angularDistance < 1) {
          // Less than 1 degree, show in arcminutes
          this.measureDistance = `${(angularDistance * 60).toFixed(1)}′`;
        } else {
          // Show in degrees
          this.measureDistance = `${angularDistance.toFixed(2)}°`;
        }
      }

      // Force update for coordinate label positions
      // This is what makes the coordinate labels reposition properly
      if (this.measureStartPoint && this.measureEndPoint) {
        // Force coordinate label position updates
        this.calculateStartLabelX();
        this.calculateStartLabelY();
        this.calculateEndLabelX();
        this.calculateEndLabelY();
      }
    }

    console.log(`Wheel rotation: ${newRotation}deg, increment: ${rotationChange}deg`);

    // Force change detection
    this.cdRef.markForCheck();
    this.cdRef.detectChanges();
  }

  /**
   * Exit measuring mode
   */
  exitMeasuring(): void {
    // Clean up the image rotation container before exiting
    if (this._imageRotationContainer && this._imageRotationContainer.parentElement) {
      // Find the original image element and restore its opacity
      const imageElement = this.imageElement?.nativeElement?.querySelector(".ngxImageZoomContainer img");
      if (imageElement) {
        (imageElement as HTMLElement).style.opacity = '1';
      }

      // Remove the rotation container
      this._imageRotationContainer.parentElement.removeChild(this._imageRotationContainer);
      this._imageRotationContainer = null;
    }

    this.exitMeasuringMode.emit();
  }
}
