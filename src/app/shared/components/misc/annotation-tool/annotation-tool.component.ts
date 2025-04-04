import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, Input, NgZone, OnDestroy, OnInit, Output, PLATFORM_ID, TemplateRef, ViewChild } from "@angular/core";
import { environment } from "@env/environment";
import { CookieService } from "ngx-cookie";
import { WindowRefService } from "@core/services/window-ref.service";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { TranslateService } from "@ngx-translate/core";
import { debounceTime, filter, switchMap, take, takeUntil, tap } from "rxjs/operators";
import { fromEvent, merge, Subject } from "rxjs";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { NgbModal, NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { isPlatformBrowser } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { UtilsService } from "@core/services/utils/utils.service";
import { Annotation } from "./models/annotation.model";
import { AnnotationService } from "./services/annotation.service";
import { AnnotationShapeType } from "./models/annotation-shape-type.enum";
import { FormBuilder, FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { ImageApiService } from "@core/services/api/classic/images/image/image-api.service";
import { DeviceService } from "@core/services/device.service";
import { ImageInterface, ImageRevisionInterface } from "@core/interfaces/image.interface";

@Component({
  selector: "astrobin-annotation-tool",
  templateUrl: "./annotation-tool.component.html",
  styleUrls: ["./annotation-tool.component.scss"]
})
export class AnnotationToolComponent extends BaseComponentDirective implements OnInit, OnDestroy, AfterViewInit {
  private _lastActionTime = 0;
  private readonly ACTION_DEBOUNCE_MS = 300;
  environment = environment;
  @Input() active: boolean = false;
  @Input() imageElement: ElementRef<HTMLElement>;
  @Input() windowWidth: number;
  @Input() windowHeight: number;
  @Input() setMouseOverUIElement: (value: boolean) => void;
  @Input() naturalWidth: number;
  @Input() naturalHeight: number;
  @Input() imageId: number;
  @Input() isImageOwner: boolean = false;
  @Input() revision: ImageInterface | ImageRevisionInterface;
  @Input() readonly: boolean = false;

  @Output() exitAnnotationMode = new EventEmitter<void>();

  // Types for template use
  readonly AnnotationShapeType = AnnotationShapeType;

  loadingAnnotations: boolean = false;
  savingAnnotations: boolean = false;
  saveSuccess: boolean = false;
  activeAnnotation: Annotation | null = null;
  isDrawing: boolean = false;
  isAddingNote: boolean = false;
  currentDrawingTool: AnnotationShapeType = AnnotationShapeType.RECTANGLE;
  mouseX: number | null = null;
  mouseY: number | null = null;

  // Drag functionality
  dragStartX: number | null = null;
  dragStartY: number | null = null;
  dragOffsetX: number = 0;
  dragOffsetY: number = 0;
  isDraggingItem: string | null = null;
  // Local array to directly track annotations
  annotations = [];
  // Properties for dragging and resizing functionality
  currentlyDragging: any = null;
  dragStartShapeX: number = 0;
  dragStartShapeY: number = 0;
  dragStartShapeWidth: number = 0;
  dragStartShapeHeight: number = 0;
  dragStartShapeRadius: number = 0;
  dragStartClientX: number = 0;
  dragStartClientY: number = 0;
  // Keeps track of container dimensions for calculating percentages
  containerWidth: number = 0;
  containerHeight: number = 0;
  // Determines what is being dragged
  dragMode: "whole" | "start" | "end" | "center" | "resize" | "tl" | "tr" | "bl" | "br" = "whole";
  // Minimum sizes for shapes in percentage
  readonly MIN_SIZE_PERCENT = 5;
  readonly MIN_RADIUS_PERCENT = 2;
  // Message form properties
  messageForm = new FormGroup({});
  messageFields: FormlyFieldConfig[] = [];
  messageModel = { title: "", message: "", color: "" };
  currentAnnotationId: string | null = null;
  pendingShapeData: any = null;
  @ViewChild("annotationFormModal", { static: true }) annotationFormModalRef: TemplateRef<any>;
  @ViewChild("helpContent", { static: true }) helpContentRef: TemplateRef<any>;
  // Constants for reference in templates
  protected readonly Math = Math;
  // Colors for the color picker
  protected colors: string[] = [];
  // Flag to detect browser environment
  protected isBrowser: boolean;
  private readonly DRAG_THRESHOLD = 10;
  private readonly CLICK_PREVENTION_TIMEOUT_MS = 100;
  private readonly RESIZE_DEBOUNCE_MS = 300;
  // Subjects for controlling drag operations
  private _shapeDragStart$ = new Subject<{ event: MouseEvent, id: string }>();
  private _shapeDragEnd$ = new Subject<MouseEvent>();
  private _noteDragStart$ = new Subject<{ event: MouseEvent, id: string }>();
  private _noteDragEnd$ = new Subject<MouseEvent>();
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
  // For keeping track of window dimensions to reposition annotations on resize
  private _prevWindowWidth: number = 0;
  private _prevWindowHeight: number = 0;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly cookieService: CookieService,
    public readonly cdRef: ChangeDetectorRef,
    public readonly ngZone: NgZone,
    public readonly annotationService: AnnotationService,
    public readonly deviceService: DeviceService,
    public readonly utilsService: UtilsService,
    private modalService: NgbModal,
    private offcanvasService: NgbOffcanvas,
    private popNotificationsService: PopNotificationsService,
    private translateService: TranslateService,
    private windowRefService: WindowRefService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private imageApiService: ImageApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    super(store$);
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // Cached image element for performance
  private _cachedImageElement: HTMLElement | null = null;

  /**
   * Get the cached image element for efficient DOM access
   */
  get cachedImageElement(): HTMLElement | null {
    return this._cachedImageElement;
  }

  /**
   * Set the cached image element and update related properties
   */
  set cachedImageElement(element: HTMLElement | null) {
    this._cachedImageElement = element;
  }

  ngOnInit(): void {
    super.ngOnInit();

    // Setting loading flag to false
    this.loadingAnnotations = false;
    
    // Only clear annotations if not in readonly mode
    if (!this.readonly) {
      this.annotations = [];
      this.annotationService.clearAllAnnotations();
    }

    // Get available colors
    this.colors = this.annotationService.getColors();

    // Add listeners for touch events to improve dragging on mobile devices, but only if not in readonly mode
    if (this.isBrowser && !this.readonly) {
      // Prevent default touch behavior on mobile devices
      document.addEventListener('touchmove', this.preventTouchDefault, { passive: false });

      // Add document-level touchmove handler for better dragging experience
      document.addEventListener('touchmove', this.handleDocumentTouchMove, { passive: false });

      // Add document-level touchend handler to ensure drag operations complete properly
      document.addEventListener('touchend', this.handleDocumentTouchEnd, { passive: false });

      // Add document-level touchcancel handler for edge cases (e.g., alerts during drag)
      document.addEventListener('touchcancel', this.handleDocumentTouchEnd, { passive: false });
    }

    // Subscribe to the annotations$ observable to keep local array in sync
    this.annotationService.annotations$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(annotations => {
        this.annotations = annotations;
        this.cdRef.markForCheck();
      });

    // Check for shared annotations in the URL when component initializes
    if (this.isBrowser) {
      if (!this.readonly) {
        // In edit mode, force clear all annotations first
        this.annotations = [];
        this.annotationService.clearAllAnnotations();
      }

      // DIRECT CHECK: Get annotations param directly from current URL
      const currentUrl = new URL(this.windowRefService.nativeWindow.location.href);
      const annotationsParam = currentUrl.searchParams.get('annotations');

      // First priority: Check for annotations in URL parameter
      if (annotationsParam && annotationsParam.trim() !== '') {
        // URL parameter takes precedence over saved annotations
        try {
          // Load the annotations
          this.annotationService.loadFromUrlParam(annotationsParam);
        } catch (e) {
          // Handle error loading annotations from URL
          this.popNotificationsService.error(
            this.translateService.instant("Failed to load annotations: {{error}}", { error: e.message })
          );

          // Make sure annotations are cleared on error
          this.annotations = [];
          this.annotationService.clearAllAnnotations();
        }
      } else if (this.revision && this.revision.annotations) {
        // Second priority: If no URL annotations, load from revision object
        this.loadSavedAnnotations();
      }
    }

    // Initialize formly form with validators
    this.messageForm = new FormGroup({});
    this.initMessageFormFields();

    // Set up form validation monitoring
    this.messageForm.valueChanges.subscribe(() => {
      this.cdRef.markForCheck();
    });

    // Only set up RxJS streams when in browser environment
    if (this.isBrowser) {
      // Set up document mouse move for annotation mode
      if (this.active) {
        this._documentMouseMove$
          .pipe(takeUntil(this.destroyed$))
          .subscribe(event => this.handleMouseMove(event));
      }

      // Set up window resize handler
      this._windowResize$
        .pipe(takeUntil(this.destroyed$))
        .subscribe(event => this.handleWindowResize(event));

      // Initialize previous window dimensions
      this._prevWindowWidth = window.innerWidth;
      this._prevWindowHeight = window.innerHeight;

      // Set up shape drag handling
      this._shapeDragStart$
        .pipe(
          takeUntil(this.destroyed$),
          tap(() => this._dragInProgress = true),
          switchMap(({ event, id }) => this._documentMouseMove$.pipe(
            takeUntil(merge(this._shapeDragEnd$, this.destroyed$)),
            tap(moveEvent => {
              moveEvent.preventDefault();
              this.handleShapeDragMove(moveEvent, id);
            })
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

      // Set up note drag handling
      this._noteDragStart$
        .pipe(
          takeUntil(this.destroyed$),
          tap(() => this._dragInProgress = true),
          switchMap(({ event, id }) => this._documentMouseMove$.pipe(
            takeUntil(merge(this._noteDragEnd$, this.destroyed$)),
            tap(moveEvent => {
              moveEvent.preventDefault();
              this.handleNoteDragMove(moveEvent, id);
            })
          ))
        )
        .subscribe();

      // Handle note drag end
      this._noteDragEnd$
        .pipe(
          takeUntil(this.destroyed$),
          tap(event => {
            this.handleNoteDragEnd(event);
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
          if (this.isDraggingItem?.startsWith("shape-")) {
            this._shapeDragEnd$.next(event);
          } else if (this.isDraggingItem?.startsWith("note-")) {
            this._noteDragEnd$.next(event);
          }
        });
    }
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      console.log("ngAfterViewInit - readonly mode:", this.readonly);
      console.log("Has imageElement input:", !!this.imageElement);

      // Try to find the image element immediately
      this.tryFindImageElement();
      this.updateAnnotationContainerSize();

      // Initialize the cached image element after a short delay to ensure DOM is ready
      this.windowRefService.utilsService.delay(200).subscribe(() => {
        console.log("Trying to find image element...");

        // Try to find the image element again if not found initially
        if (!this.cachedImageElement) {
          this.tryFindImageElement();
        }
        this.updateAnnotationContainerSize();

        // Special handling for readonly mode - we need to load annotations from revision
        if (this.readonly && this.revision && this.revision.annotations) {
          console.log("Readonly mode with annotations - loading from revision");
          // Force load annotations from revision
          this.loadSavedAnnotations();
        }

        // Handle annotations if present (from URL or from revision in readonly mode)
        if (this.annotations && this.annotations.length > 0 && this.loadingAnnotations) {
          if (this.cachedImageElement) {
            // If we have found the image element, hide loading after a short delay
            this.windowRefService.utilsService.delay(300).subscribe(() => {
              this.loadingAnnotations = false;
              this.cdRef.markForCheck();
            });
          } else {
            // Make one more attempt after a short delay
            this.windowRefService.utilsService.delay(300).subscribe(() => {
              this.tryFindImageElement();
              this.updateAnnotationContainerSize();

              // Hide loading anyway after another short delay
              this.windowRefService.utilsService.delay(200).subscribe(() => {
                this.loadingAnnotations = false;
                this.cdRef.markForCheck();
              });
            });
          }
        }
      });

      // Set up a resize observer on the image element to ensure annotations scale correctly
      this.windowRefService.utilsService.delay(500).subscribe(() => {
        if (this.cachedImageElement) {
          const resizeObserver = new ResizeObserver(entries => {
            // Update the annotation container size when the image resizes
            this.updateAnnotationContainerSize();
          });

          resizeObserver.observe(this.cachedImageElement);
        }
      });

      // Also set up a window resize handler to update on window resize
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', () => {
          this.updateAnnotationContainerSize();
        });
      }
    }
  }

  /**
   * Update the annotation container size to match the image element
   */
  private updateAnnotationContainerSize(): void {
    if (!this.cachedImageElement) {
      this.tryFindImageElement();
      if (!this.cachedImageElement) {
        console.warn('No image element found to size annotation container');
        return;
      }
    }

    // Safely get the dimensions with try-catch to handle any potential errors
    let imageBounds;
    try {
      imageBounds = this.cachedImageElement.getBoundingClientRect();
    } catch (e) {
      console.warn('Error getting image element bounds:', e);
      return;
    }

    // Skip if image element has no dimensions yet
    if (!imageBounds || imageBounds.width === 0 || imageBounds.height === 0) {
      console.warn('Image element has zero dimensions, unable to size annotation container');
      return;
    }

    // Find the annotation container
    let annotationContainer;
    try {
      annotationContainer = document.querySelector('.annotation-container') as HTMLElement;
    } catch (e) {
      console.warn('Error finding annotation container:', e);
      return;
    }
    
    if (!annotationContainer) {
      console.warn('Annotation container not found');
      return;
    }

    // Find the annotation layer
    let annotationLayer;
    try {
      annotationLayer = document.querySelector('.annotation-layer') as HTMLElement;
    } catch (e) {
      console.warn('Error finding annotation layer:', e);
      return;
    }
    
    if (!annotationLayer) {
      console.warn('Annotation layer not found');
      return;
    }

    console.log('Updating annotation container size to match image:',
      { 
        width: imageBounds.width, 
        height: imageBounds.height, 
        top: imageBounds.top, 
        left: imageBounds.left,
        readonly: this.readonly
      });

    try {
      // Set container sizing and position to exactly match the image
      annotationContainer.style.position = 'absolute';
      annotationContainer.style.width = `${imageBounds.width}px`;
      annotationContainer.style.height = `${imageBounds.height}px`;
      annotationContainer.style.top = `${imageBounds.top}px`;
      annotationContainer.style.left = `${imageBounds.left}px`;

      // Position the layer to fill the container
      annotationLayer.style.width = '100%';
      annotationLayer.style.height = '100%';
      annotationLayer.style.top = '0';
      annotationLayer.style.left = '0';
      
      // If we're in readonly mode, set appropriate z-index via style
      // This is in addition to the class-based approach, for extra safety
      if (this.readonly) {
        annotationContainer.style.zIndex = '15';
        annotationContainer.style.pointerEvents = 'none';
        annotationLayer.style.zIndex = '15';
        annotationLayer.style.pointerEvents = 'none';
      }
    } catch (e) {
      console.warn('Error setting annotation container styles:', e);
    }
  }

  // Prevent default behavior for touch events
  private preventTouchDefault = (e: TouchEvent) => {
    // Only prevent default if we're actively dragging
    if (this.currentlyDragging) {
      e.preventDefault();
    }
  };

  // Handle touch moves at the document level
  private handleDocumentTouchMove = (e: TouchEvent) => {
    if (this.currentlyDragging && e.touches.length === 1) {
      // Call our dragMoveTouch method directly
      this.dragMoveTouch(e);
    }
  };

  // Handle touch end at the document level
  private handleDocumentTouchEnd = (e: TouchEvent) => {
    if (this.currentlyDragging) {
      // Call our endDragTouch method directly
      this.endDragTouch(e);
    }
  };

  ngOnDestroy(): void {
    if (this.isBrowser) {
      // Complete all drag-related subjects
      this._shapeDragStart$.complete();
      this._shapeDragEnd$.complete();
      this._noteDragStart$.complete();
      this._noteDragEnd$.complete();

      // Remove event listeners
      document.removeEventListener('touchmove', this.preventTouchDefault);
      document.removeEventListener('touchmove', this.handleDocumentTouchMove);
      document.removeEventListener('touchend', this.handleDocumentTouchEnd);
      document.removeEventListener('touchcancel', this.handleDocumentTouchEnd);
    }

    // Call parent class ngOnDestroy - this will also complete the destroyed$ subject
    super.ngOnDestroy();
  }

  /**
   * Handle mouse move events for annotation drawing
   */
  handleMouseMove(event: MouseEvent): void {
    if (!this.active || !this.isBrowser) {
      return;
    }

    // Update current mouse position
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;

    // If actively drawing, update the active annotation
    if (this.isDrawing && this.activeAnnotation) {
      // Calculate distance moved for better UX
      const distMoved = Math.sqrt(
        Math.pow(this.mouseX - this.dragStartX, 2) +
        Math.pow(this.mouseY - this.dragStartY, 2)
      );

      // Only log occasionally to reduce console spam
      if (distMoved > 20) {
        console.log("Mouse move during drawing", {
          x: this.mouseX,
          y: this.mouseY,
          distanceMoved: distMoved
        });
      }

      // Always update points during drawing
      this.updateActiveAnnotationPoints(event);

      // Mark the component for change detection to ensure UI updates
      this.ngZone.run(() => {
        this.cdRef.markForCheck();
      });
    }
  }

  /**
   * Handle window resize events to reposition annotations
   */
  handleWindowResize(event: UIEvent): void {
    if (!this.isBrowser) {
      return;
    }

    // Update the annotation container to match the image dimensions
    this.updateAnnotationContainerSize();

    // Store the new dimensions
    this._prevWindowWidth = window.innerWidth;
    this._prevWindowHeight = window.innerHeight;

    this.cdRef.markForCheck();
  }

  /**
   * Prepare a rectangle annotation and open the form
   */
  makeRect(): void {
    // Debounce to prevent duplicate actions
    const now = Date.now();
    if (now - this._lastActionTime < this.ACTION_DEBOUNCE_MS) {
      return;
    }
    this._lastActionTime = now;

    console.log("makeRect called");

    // Ensure annotation container size is up to date
    this.updateAnnotationContainerSize();

    // Get container dimensions to calculate 100x100px as percentage
    const containerElement = document.querySelector(".annotation-container") as HTMLElement;
    let containerWidth = 1000; // Fallback width
    let containerHeight = 1000; // Fallback height

    if (containerElement) {
      const rect = containerElement.getBoundingClientRect();
      containerWidth = rect.width || 1000;
      containerHeight = rect.height || 1000;
    } else if (this.cachedImageElement) {
      // Fallback to the image element if container not found
      const rect = this.cachedImageElement.getBoundingClientRect();
      containerWidth = rect.width || 1000;
      containerHeight = rect.height || 1000;
    }

    // Calculate how much 100px is as a percentage of container dimensions
    const widthPercent = (100 / containerWidth) * 100;
    const heightPercent = (100 / containerHeight) * 100;

    // Prepare the shape data (without creating the annotation yet)
    const shapeData = {
      type: "rectangle",
      color: this.annotationService.getDefaultColor(),
      // Rectangle coordinates (centered with 100x100px equivalent size)
      x: 50 - (widthPercent / 2),
      y: 50 - (heightPercent / 2),
      width: widthPercent,
      height: heightPercent
    };

    // Open the form to collect title and description before creating the shape
    this.openAnnotationForm(shapeData);

    console.log("Prepared rectangle shape data:", shapeData);
  }

  // Arrow mode has been removed

  /**
   * Prepare a circle annotation and open the form
   */
  makeCircle(): void {
    // Debounce to prevent duplicate actions
    const now = Date.now();
    if (now - this._lastActionTime < this.ACTION_DEBOUNCE_MS) {
      return;
    }
    this._lastActionTime = now;

    console.log("makeCircle called");

    // Ensure annotation container size is up to date
    this.updateAnnotationContainerSize();

    // Get container dimensions to calculate 100x100px as percentage
    const containerElement = document.querySelector(".annotation-container") as HTMLElement;
    let containerWidth = 1000; // Fallback width
    let containerHeight = 1000; // Fallback height

    if (containerElement) {
      const rect = containerElement.getBoundingClientRect();
      containerWidth = rect.width || 1000;
      containerHeight = rect.height || 1000;
    } else if (this.cachedImageElement) {
      // Fallback to the image element if container not found
      const rect = this.cachedImageElement.getBoundingClientRect();
      containerWidth = rect.width || 1000;
      containerHeight = rect.height || 1000;
    }

    // Calculate radius in percentage (use the smaller dimension for a perfect circle)
    // 50px radius = 100px diameter
    const radiusInPixels = 50;
    const smallerDimension = Math.min(containerWidth, containerHeight);
    const radiusPercent = (radiusInPixels / smallerDimension) * 100;

    // Prepare the shape data (without creating the annotation yet)
    const shapeData = {
      type: "circle",
      color: this.annotationService.getDefaultColor(),
      // Circle coordinates (centered with 100px diameter)
      cx: 50,
      cy: 50,
      r: radiusPercent
    };

    // Open the form to collect title and description before creating the shape
    this.openAnnotationForm(shapeData);

    console.log("Prepared circle shape data:", shapeData);
  }

  /**
   * Helper methods for HTML-based annotation positioning
   */

  // Get the left position of an annotation
  getAnnotationLeft(ann: any): number {
    if (ann.type === "rectangle") {
      return ann.x;
    } else if (ann.type === "circle") {
      return ann.cx - ann.r;
    } else if (ann.type === "arrow") {
      return Math.min(ann.startX, ann.endX);
    }
    return 0;
  }

  // Get the top position of an annotation
  getAnnotationTop(ann: any): number {
    if (ann.type === "rectangle") {
      return ann.y;
    } else if (ann.type === "circle") {
      return ann.cy - ann.r;
    } else if (ann.type === "arrow") {
      return Math.min(ann.startY, ann.endY);
    }
    return 0;
  }

  // Get the width of an annotation
  getAnnotationWidth(ann: any): number {
    if (ann.type === "rectangle") {
      return ann.width;
    } else if (ann.type === "circle") {
      return ann.r * 2;
    } else if (ann.type === "arrow") {
      return Math.abs(ann.endX - ann.startX);
    }
    return 0;
  }

  // Get the height of an annotation
  getAnnotationHeight(ann: any): number {
    if (ann.type === "rectangle") {
      return ann.height;
    } else if (ann.type === "circle") {
      return 0; // Height will be controlled by padding-bottom for circles
    } else if (ann.type === "arrow") {
      return Math.abs(ann.endY - ann.startY);
    }
    return 0;
  }

  // Get the aspect ratio padding for circles to maintain 1:1 ratio
  getCircleAspectRatio(ann: any): number {
    if (ann.type === "circle") {
      return ann.r * 2; // Use padding-bottom with same percentage as width
    }
    return 0;
  }


  // Drawing preview helpers
  getDrawingLeft(): number {
    if (!this.activeAnnotation) {
      return 0;
    }

    const shape = this.activeAnnotation.shape;
    if (shape.type === AnnotationShapeType.RECTANGLE) {
      const points = shape.points;
      if (points.length >= 2) {
        return Math.min(points[0].x, points[1].x);
      }
    } else if (shape.type === AnnotationShapeType.CIRCLE) {
      const points = shape.points;
      if (points.length >= 2) {
        const centerX = points[0].x;
        const radiusX = Math.abs(points[1].x - centerX);
        return centerX - radiusX;
      }
    }
    return 0;
  }

  getDrawingTop(): number {
    if (!this.activeAnnotation) {
      return 0;
    }

    const shape = this.activeAnnotation.shape;
    if (shape.type === AnnotationShapeType.RECTANGLE) {
      const points = shape.points;
      if (points.length >= 2) {
        return Math.min(points[0].y, points[1].y);
      }
    } else if (shape.type === AnnotationShapeType.CIRCLE) {
      const points = shape.points;
      if (points.length >= 2) {
        const centerY = points[0].y;
        const radiusY = Math.abs(points[1].y - centerY);
        return centerY - radiusY;
      }
    }
    return 0;
  }

  getDrawingWidth(): number {
    if (!this.activeAnnotation) {
      return 0;
    }

    const shape = this.activeAnnotation.shape;
    if (shape.type === AnnotationShapeType.RECTANGLE) {
      const points = shape.points;
      if (points.length >= 2) {
        return Math.abs(points[1].x - points[0].x);
      }
    } else if (shape.type === AnnotationShapeType.CIRCLE) {
      const points = shape.points;
      if (points.length >= 2) {
        const centerX = points[0].x;
        const radiusX = Math.abs(points[1].x - centerX);
        return radiusX * 2;
      }
    }
    return 0;
  }

  getDrawingHeight(): number {
    if (!this.activeAnnotation) {
      return 0;
    }

    const shape = this.activeAnnotation.shape;
    if (shape.type === AnnotationShapeType.RECTANGLE) {
      const points = shape.points;
      if (points.length >= 2) {
        return Math.abs(points[1].y - points[0].y);
      }
    } else if (shape.type === AnnotationShapeType.CIRCLE) {
      const points = shape.points;
      if (points.length >= 2) {
        const centerY = points[0].y;
        const radiusY = Math.abs(points[1].y - centerY);
        return radiusY * 2;
      }
    }
    return 0;
  }

  // Get appropriate cursor for the current drag mode
  getCursorForDragMode(): string {
    switch (this.dragMode) {
      case "tl":
        return "nwse-resize";
      case "tr":
        return "nesw-resize";
      case "bl":
        return "nesw-resize";
      case "br":
        return "nwse-resize";
      case "resize":
        return "ns-resize";
      case "start":
      case "end":
        return "move";
      default:
        return "move";
    }
  }

  /**
   * Clear all annotations with confirmation
   */
  confirmClearAll(): void {
    // Check if there are any annotations to clear
    if (this.annotations.length === 0) {
      return; // Do nothing if there are no annotations
    }

    // Import dynamically to avoid circular dependency
    import('@shared/components/misc/confirmation-dialog/confirmation-dialog.component').then(module => {
      const modalRef = this.modalService.open(module.ConfirmationDialogComponent);
      const componentInstance = modalRef.componentInstance;

      componentInstance.title = this.translateService.instant("Clear All Annotations");
      componentInstance.message = this.translateService.instant("Are you sure you want to delete all annotations?");
      componentInstance.showAreYouSure = false;
      componentInstance.confirmLabel = this.translateService.instant("Yes, clear all");

      modalRef.result.then(
        () => {
          // User confirmed, clear all annotations
          this.clearAll();
        },
        () => {
          // User cancelled, do nothing
          console.log("Clear all cancelled");
        }
      );
    });
  }

  /**
   * Clear all annotations (internal method without confirmation)
   */
  private clearAll(): void {
    console.log("clearAll called");
    this.annotationService.clearAllAnnotations();
    this.cdRef.detectChanges();
  }

  /**
   * Confirm deletion of an annotation
   */
  confirmDeleteAnnotation(id: string): void {
    const annotation = this.annotations.find(ann => ann.id === id);
    if (!annotation) {
      return;
    }

    // Import dynamically to avoid circular dependency
    import('@shared/components/misc/confirmation-dialog/confirmation-dialog.component').then(module => {
      const modalRef = this.modalService.open(module.ConfirmationDialogComponent);
      const componentInstance = modalRef.componentInstance;

      const title = annotation.title || this.translateService.instant("Untitled annotation");
      componentInstance.title = this.translateService.instant("Delete annotation");
      componentInstance.message = this.translateService.instant("Are you sure you want to delete the annotation \"{{title}}\"?", { title });
      componentInstance.showAreYouSure = false;
      componentInstance.confirmLabel = this.translateService.instant("Yes, delete");

      modalRef.result.then(
        () => {
          // User confirmed, delete the annotation
          this.deleteAnnotation(id);
        },
        () => {
          // User cancelled, do nothing
          console.log("Delete annotation cancelled");
        }
      );
    });
  }

  /**
   * Start dragging an annotation or control point
   */
  startDrag(event: MouseEvent, annotation: any, mode: "whole" | "start" | "end" | "center" | "resize" | "tl" | "tr" | "bl" | "br" = "whole"): void {
    console.log("startDrag called", { annotation, mode });

    // Prevent default browser behavior
    event.preventDefault();
    event.stopPropagation();

    // Stop text selection
    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
      }
    }

    // Get container dimensions once at the start of dragging
    const container = document.querySelector(".annotation-svg") as HTMLElement;
    if (container) {
      const rect = container.getBoundingClientRect();
      this.containerWidth = rect.width;
      this.containerHeight = rect.height;
    }

    // Store the current annotation being dragged and the drag mode
    this.currentlyDragging = annotation;
    this.dragMode = mode;

    // Store starting mouse position
    this.dragStartClientX = event.clientX;
    this.dragStartClientY = event.clientY;

    // Store initial annotation position and size based on type
    if (annotation.type === "arrow") {
      this.dragStartShapeX = annotation.startX;
      this.dragStartShapeY = annotation.startY;

      // For end point dragging, store the end coordinates
      if (mode === "end") {
        this.dragStartShapeWidth = annotation.endX;
        this.dragStartShapeHeight = annotation.endY;
      } else if (mode === "start") {
        // For start point dragging, also store end coordinates as reference
        this.dragStartShapeWidth = annotation.endX;
        this.dragStartShapeHeight = annotation.endY;
      }
    } else if (annotation.type === "rectangle") {
      this.dragStartShapeX = annotation.x;
      this.dragStartShapeY = annotation.y;
      this.dragStartShapeWidth = annotation.width;
      this.dragStartShapeHeight = annotation.height;
    } else if (annotation.type === "circle") {
      this.dragStartShapeX = annotation.cx;
      this.dragStartShapeY = annotation.cy;
      this.dragStartShapeRadius = annotation.r;
    }

    console.log("Drag started:", {
      annotation: this.currentlyDragging,
      mode: this.dragMode,
      containerWidth: this.containerWidth,
      containerHeight: this.containerHeight,
      startX: this.dragStartShapeX,
      startY: this.dragStartShapeY,
      clientX: this.dragStartClientX,
      clientY: this.dragStartClientY
    });
  }

  /**
   * Start dragging an annotation or control point using touch
   */
  startDragTouch(event: TouchEvent, annotation: any, mode: "whole" | "start" | "end" | "center" | "resize" | "tl" | "tr" | "bl" | "br" = "whole"): void {
    console.log("startDragTouch called", { annotation, mode });

    // Prevent default browser behavior (scrolling, zooming)
    event.preventDefault();
    event.stopPropagation();

    // Make sure we're not already dragging something
    if (this.currentlyDragging !== null) {
      console.log("Already dragging, ignoring new drag attempt");
      return;
    }

    if (event.touches.length !== 1) {
      // Only handle single touch events
      console.log("Ignored - not a single touch event");
      return;
    }

    const touch = event.touches[0];

    // Set this flag to true so global event handlers know we're dragging
    this._dragInProgress = true;

    // Get container dimensions once at the start of dragging - ensure we get the right container
    const container = document.querySelector(".annotation-container") as HTMLElement;
    if (container) {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        this.containerWidth = rect.width;
        this.containerHeight = rect.height;
        console.log("Found annotation container with dimensions:", { width: rect.width, height: rect.height });
      } else {
        console.warn("Container has zero dimensions, trying to get image bounds...");
        // Fallback to the image element
        this.updateAnnotationContainerSize();
        if (this.cachedImageElement) {
          const imageBounds = this.cachedImageElement.getBoundingClientRect();
          this.containerWidth = imageBounds.width;
          this.containerHeight = imageBounds.height;
          console.log("Using image dimensions instead:", { width: imageBounds.width, height: imageBounds.height });
        }
      }
    }

    // Store the current annotation being dragged and the drag mode
    this.currentlyDragging = annotation;
    this.dragMode = mode;

    // Store starting touch position
    this.dragStartClientX = touch.clientX;
    this.dragStartClientY = touch.clientY;

    // Make a deep copy of initial positions for touch dragging
    // This ensures we always calculate from the original position
    if (annotation.type === "arrow") {
      this.dragStartShapeX = annotation.startX;
      this.dragStartShapeY = annotation.startY;

      // Store end coordinates for whole arrow dragging
      if (mode === "whole" || mode === "end") {
        this.dragStartShapeWidth = annotation.endX;
        this.dragStartShapeHeight = annotation.endY;
      }
    } else if (annotation.type === "rectangle") {
      this.dragStartShapeX = annotation.x;
      this.dragStartShapeY = annotation.y;
      this.dragStartShapeWidth = annotation.width;
      this.dragStartShapeHeight = annotation.height;
    } else if (annotation.type === "circle") {
      this.dragStartShapeX = annotation.cx;
      this.dragStartShapeY = annotation.cy;
      this.dragStartShapeRadius = annotation.r;
    }

    // Add this to the body to capture all touch events
    if (this.isBrowser && typeof document !== 'undefined') {
      // Apply the custom class to highlight that touch drag is active
      document.body.classList.add('annotation-touch-drag-active');
    }

    // Force change detection to update the UI immediately
    this.cdRef.detectChanges();

    console.log("Touch drag started:", {
      annotation: this.currentlyDragging,
      mode: this.dragMode,
      containerWidth: this.containerWidth,
      containerHeight: this.containerHeight,
      startX: this.dragStartShapeX,
      startY: this.dragStartShapeY,
      clientX: this.dragStartClientX,
      clientY: this.dragStartClientY
    });
  }

  /**
   * Move the annotation during dragging
   */
  /**
   * Move or resize an annotation during dragging
   */
  dragMove(event: MouseEvent): void {
    if (!this.currentlyDragging) {
      return;
    }

    // Prevent text selection during drag and maintain the same cursor during the drag
    event.preventDefault();
    event.stopPropagation();

    // Get the container for calculating percentages
    const container = document.querySelector(".annotation-container") as HTMLElement;
    if (!container) {
      return;
    }

    const rect = container.getBoundingClientRect();
    this.containerWidth = rect.width;
    this.containerHeight = rect.height;

    // Calculate mouse movement as percentage of container size using the values captured at drag start
    const deltaXPercent = ((event.clientX - this.dragStartClientX) / this.containerWidth) * 100;
    const deltaYPercent = ((event.clientY - this.dragStartClientY) / this.containerHeight) * 100;

    // Calculate absolute mouse position in percentages
    const currentXPercent = ((event.clientX - rect.left) / rect.width) * 100;
    const currentYPercent = ((event.clientY - rect.top) / rect.height) * 100;

    // Apply transformations based on shape type and drag mode
    if (this.currentlyDragging.type === "rectangle") {
      this.handleRectangleDrag(deltaXPercent, deltaYPercent, currentXPercent, currentYPercent);
    } else if (this.currentlyDragging.type === "circle") {
      this.handleCircleDrag(deltaXPercent, deltaYPercent, currentXPercent, currentYPercent);
    }
  }

  /**
   * End the dragging operation
   */
  endDrag(event?: MouseEvent): void {
    if (!this.currentlyDragging) {
      return;
    }

    // Prevent default browser behavior if event is provided
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log("Drag ended, mode:", this.dragMode);
    console.log("New position/size:", this.currentlyDragging);

    // Reset dragging state
    this.currentlyDragging = null;
    this.dragMode = "whole";

    // Force UI update
    this.cdRef.detectChanges();
  }

  /**
   * Handle touch move events for dragging annotations
   */
  dragMoveTouch(event: TouchEvent): void {
    if (!this.currentlyDragging || !this._dragInProgress) {
      return;
    }

    // Prevent default behavior (scrolling, etc)
    event.preventDefault();
    event.stopPropagation();

    if (event.touches.length !== 1) {
      // Only handle single touch events
      console.log("Ignored touch move - not a single touch");
      return;
    }

    // Ensure we have the annotation container for calculations
    if (!this.containerWidth || !this.containerHeight) {
      this.updateAnnotationContainerSize();
    }

    const touch = event.touches[0];

    // Get the container for calculating percentages
    const container = document.querySelector(".annotation-container") as HTMLElement;
    if (!container) {
      return;
    }

    const rect = container.getBoundingClientRect();
    this.containerWidth = rect.width;
    this.containerHeight = rect.height;

    // Calculate touch movement as percentage of container size
    const deltaXPercent = ((touch.clientX - this.dragStartClientX) / this.containerWidth) * 100;
    const deltaYPercent = ((touch.clientY - this.dragStartClientY) / this.containerHeight) * 100;

    // Log the deltas for debugging
    console.log("Touch move deltas:", {
      x: touch.clientX - this.dragStartClientX,
      y: touch.clientY - this.dragStartClientY,
      percentX: deltaXPercent,
      percentY: deltaYPercent
    });

    // Calculate absolute touch position in percentages
    const currentXPercent = ((touch.clientX - rect.left) / rect.width) * 100;
    const currentYPercent = ((touch.clientY - rect.top) / rect.height) * 100;

    // For "whole" drag mode, use a simpler approach for touch
    if (this.dragMode === "whole") {
      // For rectangles
      if (this.currentlyDragging.type === "rectangle") {
        // Update position directly without using the handle methods
        this.currentlyDragging.x = this.dragStartShapeX + deltaXPercent;
        this.currentlyDragging.y = this.dragStartShapeY + deltaYPercent;
      }
      // For circles
      else if (this.currentlyDragging.type === "circle") {
        this.currentlyDragging.cx = this.dragStartShapeX + deltaXPercent;
        this.currentlyDragging.cy = this.dragStartShapeY + deltaYPercent;
      }
      // For arrows
      else if (this.currentlyDragging.type === "arrow") {
        this.currentlyDragging.startX = this.dragStartShapeX + deltaXPercent;
        this.currentlyDragging.startY = this.dragStartShapeY + deltaYPercent;
        this.currentlyDragging.endX = this.dragStartShapeWidth + deltaXPercent;
        this.currentlyDragging.endY = this.dragStartShapeHeight + deltaYPercent;
      }
    }
    // For other drag modes (resizing, control points) use the handlers
    else {
      if (this.currentlyDragging.type === "rectangle") {
        this.handleRectangleDrag(deltaXPercent, deltaYPercent, currentXPercent, currentYPercent);
      } else if (this.currentlyDragging.type === "circle") {
        this.handleCircleDrag(deltaXPercent, deltaYPercent, currentXPercent, currentYPercent);
      }
    }

    // Don't update the start position on every move for touch
    // This keeps the reference point consistent from the original touch start
    // this.dragStartClientX = touch.clientX;
    // this.dragStartClientY = touch.clientY;

    // Force UI update
    this.cdRef.detectChanges();
  }

  /**
   * End touch dragging operation
   */
  endDragTouch(event: TouchEvent): void {
    if (!this.currentlyDragging) {
      return;
    }

    // Prevent default behavior
    event.preventDefault();
    event.stopPropagation();

    console.log("Touch drag ended, mode:", this.dragMode);
    console.log("New position/size:", this.currentlyDragging);

    // Reset dragging state
    this._dragInProgress = false;
    this.currentlyDragging = null;
    this.dragMode = "whole";

    // Remove touch drag active class if present
    if (this.isBrowser && typeof document !== 'undefined') {
      document.body.classList.remove('annotation-touch-drag-active');
    }

    // Force UI update
    this.cdRef.detectChanges();
  }


  /**
   * Cancel the current annotation creation
   */
  cancelAnnotation(): void {
    if (this.activeAnnotation) {
      this.annotationService.removeAnnotation(this.activeAnnotation.id);
      this.activeAnnotation = null;
    }

    this.isDrawing = false;
    this.isAddingNote = false;
    this.cdRef.markForCheck();
  }

  /**
   * Update the active annotation's points based on mouse position
   */
  updateActiveAnnotationPoints(event: MouseEvent): void {
    console.log("updateActiveAnnotationPoints", {
      activeAnnotation: this.activeAnnotation,
      cachedImageElement: this.cachedImageElement
    });

    if (!this.activeAnnotation) {
      console.warn("No active annotation to update");
      return;
    }

    // Make sure the annotation container is properly sized and positioned
    this.updateAnnotationContainerSize();

    // Use the annotation container which should now match the image exactly
    const annotationContainer = document.querySelector(".annotation-container") as HTMLElement;

    if (!annotationContainer || annotationContainer.getBoundingClientRect().width === 0) {
      console.warn("Annotation container not available, falling back to image element");

      if (!this.cachedImageElement || this.cachedImageElement.getBoundingClientRect().width === 0) {
        console.warn("No usable reference element for annotation positioning");
        return;
      }

      // Try to update the container again
      this.updateAnnotationContainerSize();
    }

    // Get the container bounds (should be the same as the image bounds now)
    const containerBounds = annotationContainer.getBoundingClientRect();
    console.log("Container bounds for positioning:", containerBounds);

    // Calculate relative position within the container (as percentage)
    const relX = Math.max(0, Math.min(100, (event.clientX - containerBounds.left) / containerBounds.width * 100));
    const relY = Math.max(0, Math.min(100, (event.clientY - containerBounds.top) / containerBounds.height * 100));

    console.log("Calculated position:", { relX, relY });

    // Update the annotation's shape points
    this._updateAnnotationPoints(relX, relY);
  }

  /**
   * Check if the current drawing is too small to be valid
   */
  isDrawingTooSmall(): boolean {
    if (!this.activeAnnotation || this.activeAnnotation.shape.points.length < 2) {
      return true;
    }

    const points = this.activeAnnotation.shape.points;

    // Calculate the distance between points
    const dx = points[1].x - points[0].x;
    const dy = points[1].y - points[0].y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If percentage distance is less than 1% of the image, consider it too small
    return distance < 1;
  }

  /**
   * Start dragging a shape
   */
  onShapeDragStart(event: MouseEvent, id: string): void {
    if (!this.active || this.isDrawing) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.isDraggingItem = `shape-${id}`;

    this._shapeDragStart$.next({ event, id });
  }

  /**
   * Handle shape dragging
   */
  handleShapeDragMove(event: MouseEvent, id: string): void {
    if (!this.isDraggingItem || !this.isDraggingItem.startsWith("shape-")) {
      return;
    }

    const deltaX = event.clientX - this.dragStartX!;
    const deltaY = event.clientY - this.dragStartY!;

    // Make sure we're using the actual image element for calculations
    if (!this.cachedImageElement || this.cachedImageElement.getBoundingClientRect().width === 0) {
      // Try to find the image element again
      this.tryFindImageElement();

      if (!this.cachedImageElement || this.cachedImageElement.getBoundingClientRect().width === 0) {
        console.warn("No suitable image element found for drag calculations");
        return;
      }
    }

    // Get the actual displayed image dimensions
    const imageBounds = this.cachedImageElement.getBoundingClientRect();
    console.log("Image bounds for drag calculation:", imageBounds);

    // Convert pixel deltas to percentage of the image dimensions
    const deltaPercentX = (deltaX / imageBounds.width) * 100;
    const deltaPercentY = (deltaY / imageBounds.height) * 100;

    // Log the delta conversions
    console.log("Drag deltas:", {
      pixelX: deltaX,
      pixelY: deltaY,
      percentX: deltaPercentX,
      percentY: deltaPercentY
    });

    // Move the shape by the delta percentages
    this.annotationService.moveAnnotationShape(id, deltaPercentX, deltaPercentY);

    // Reset the drag start position
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;

    this.cdRef.markForCheck();
  }

  /**
   * Handle shape drag end
   */
  handleShapeDragEnd(event: MouseEvent): void {
    this.isDraggingItem = null;
    this.dragStartX = null;
    this.dragStartY = null;

    // Prevent the next click event from being processed
    this._preventNextClick = true;
    this.utilsService.delay(this.CLICK_PREVENTION_TIMEOUT_MS).subscribe(() => {
      this._preventNextClick = false;
    });

    this.cdRef.markForCheck();
  }

  /**
   * Start dragging a note
   */
  onNoteDragStart(event: MouseEvent, id: string): void {
    if (!this.active || this.isDrawing) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.isDraggingItem = `note-${id}`;

    this._noteDragStart$.next({ event, id });
  }

  /**
   * Handle note dragging
   */
  handleNoteDragMove(event: MouseEvent, id: string): void {
    if (!this.isDraggingItem || !this.isDraggingItem.startsWith("note-")) {
      return;
    }

    const deltaX = event.clientX - this.dragStartX!;
    const deltaY = event.clientY - this.dragStartY!;

    // Make sure we're using the actual image element for calculations
    if (!this.cachedImageElement || this.cachedImageElement.getBoundingClientRect().width === 0) {
      // Try to find the image element again
      this.tryFindImageElement();

      if (!this.cachedImageElement || this.cachedImageElement.getBoundingClientRect().width === 0) {
        console.warn("No suitable image element found for note drag calculations");
        return;
      }
    }

    // Get the actual displayed image dimensions
    const imageBounds = this.cachedImageElement.getBoundingClientRect();

    // Convert pixel deltas to percentage of the image dimensions
    const deltaPercentX = (deltaX / imageBounds.width) * 100;
    const deltaPercentY = (deltaY / imageBounds.height) * 100;

    // Move the note by the delta percentages
    this.annotationService.moveAnnotationNote(id, deltaPercentX, deltaPercentY);

    // Reset the drag start position
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;

    this.cdRef.markForCheck();
  }

  /**
   * Handle note drag end
   */
  handleNoteDragEnd(event: MouseEvent): void {
    this.isDraggingItem = null;
    this.dragStartX = null;
    this.dragStartY = null;

    // Prevent the next click event from being processed
    this._preventNextClick = true;
    this.utilsService.delay(this.CLICK_PREVENTION_TIMEOUT_MS).subscribe(() => {
      this._preventNextClick = false;
    });

    this.cdRef.markForCheck();
  }

  /**
   * Exit annotation mode
   */
  exitAnnotationModeHandler(): void {
    console.log("EXIT ANNOTATION MODE HANDLER CALLED");

    // First clean up any active drawing
    this.cancelAnnotation();

    // Save a direct reference to native window for manipulating the URL
    if (this.isBrowser) {
      try {
        // DIRECT APPROACH: Manipulate the URL without Angular's routing
        const location = this.windowRefService.nativeWindow.location;
        const url = new URL(location.href);

        console.log("BEFORE URL CHANGE:", url.toString());

        // Remove annotations param
        url.searchParams.delete('annotations');

        // Apply the change directly to history
        this.windowRefService.nativeWindow.history.replaceState({}, '', url.toString());

        console.log("AFTER URL CHANGE:", this.windowRefService.nativeWindow.location.href);
      } catch (e) {
        console.error("Error manipulating URL:", e);
      }
    }

    // MOST IMPORTANT: Force clear all annotations in the component and service multiple times
    for (let i = 0; i < 3; i++) {
      this.annotations = [];
      this.annotationService.clearAllAnnotations();
    }

    // Ensure loading flag is disabled
    this.loadingAnnotations = false;

    console.log("AFTER CLEAR: annotations count =", this.annotations.length);

    // Force immediate change detection to update UI
    this.cdRef.markForCheck();
    this.cdRef.detectChanges();

    // Use delay to ensure changes are applied
    this.utilsService.delay(100).subscribe(() => {
      // Clear annotations
      this.annotations = [];
      this.annotationService.clearAllAnnotations();
      this.loadingAnnotations = false;
      this.cdRef.markForCheck();
      this.cdRef.detectChanges();

      // URL check complete
    });

    // Then emit event to notify parent component
    this.exitAnnotationMode.emit();
  }

  /**
   * Toggle the expanded state of a note
   */
  toggleNoteExpanded(id: string): void {
    this.annotationService.toggleNoteExpanded(id);
    this.cdRef.markForCheck();
  }

  /**
   * Delete an annotation
   */
  deleteAnnotation(id: string): void {
    console.log("Deleting annotation with id:", id);

    // Use the service method to remove the annotation
    // Our local array will be updated via the subscription
    this.annotationService.removeAnnotation(id);
    this.cdRef.markForCheck();
  }

  /**
   * Open the annotation form for creating a new shape
   */
  openAnnotationForm(shapeData: any): void {
    console.log("Opening annotation form for new shape:", shapeData);

    // Store the shape data to be created when the form is submitted
    this.pendingShapeData = shapeData;

    // Reset the model for a new annotation with the shape's color
    this.messageModel = {
      title: "",
      message: "",
      color: shapeData.color || this.annotationService.getDefaultColor()
    };

    // Reset the form and prepare it for a new entry
    this.messageForm.reset();

    // Open the modal
    const modalRef = this.modalService.open(this.annotationFormModalRef, {
      centered: true,
      backdrop: "static"
    });

    // Handle modal close (save)
    modalRef.result.then(
      (result) => {
        // Modal was closed with save - create the shape and save form data
        this.createAnnotationFromPendingData(result);
      },
      (reason) => {
        // Modal was dismissed - clear pending shape
        console.log("Modal dismissed, canceling shape creation");
        this.pendingShapeData = null;
      }
    );
  }

  /**
   * Create annotation from pending data and form result
   */
  private createAnnotationFromPendingData(formData: any): void {
    if (!this.pendingShapeData) {
      console.warn("No pending shape data found");
      return;
    }

    // Create a new annotation with the pending shape data
    const newAnnotation = {
      id: this.pendingShapeData.type + "_" + Date.now(),
      ...this.pendingShapeData,
      color: formData.color || this.annotationService.getDefaultColor(),
      title: formData.title,
      note: formData.message ? {
        text: formData.message,
        position: { x: 50, y: 20 },
        expanded: true
      } : null
    };

    // Add to our local array
    this.annotations.push(newAnnotation);

    // Reset pending data
    this.pendingShapeData = null;

    console.log("Created new annotation:", newAnnotation);
    console.log("Current annotations:", this.annotations);

    // Force UI update
    this.cdRef.detectChanges();
  }

  /**
   * Show the message form for an existing annotation using NgbModal
   */
  showMessageForm(id: string, modalTemplate?: TemplateRef<any>): void {
    console.log("Showing message form for annotation:", id);

    this.currentAnnotationId = id;

    // Find the annotation
    const annotation = this.annotations.find(ann => ann.id === id);

    if (!annotation) {
      console.warn("Annotation not found:", id);
      return;
    }

    // Initialize the form with existing title, message, and color
    this.messageModel = {
      title: annotation.title || "",
      message: annotation.note ? annotation.note.text || "" : "",
      color: annotation.color || this.annotationService.getDefaultColor()
    };

    // Reset the form and update the model for formly
    this.messageForm.reset();
    // Update the model directly (formly binds to this)
    this.messageModel = {
      title: this.messageModel.title,
      message: this.messageModel.message,
      color: this.messageModel.color
    };

    // Open the modal with the template reference
    if (modalTemplate) {
      const modalRef = this.modalService.open(modalTemplate, {
        centered: true,
        backdrop: "static"
      });

      // Handle modal close (save)
      modalRef.result.then(
        (result) => {
          // Modal was closed with save
          this.submitMessageForm(result);
        },
        (reason) => {
          // Modal was dismissed
          console.log("Modal dismissed");
        }
      );
    }
  }

  /**
   * Validate form and close modal only if valid
   */
  validateAndCloseModal(modal: any, form: FormGroup, formData: any, event?: MouseEvent): void {
    console.log("Validating form...", { valid: form.valid, formData, model: this.messageModel });

    if (form.valid) {
      // For formly, the model is already updated, so we can use it directly
      modal.close(this.messageModel);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(form.controls).forEach(key => {
        const control = form.get(key);
        control.markAsTouched();
        control.markAsDirty();
      });

      // Prevent default button action and propagation
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }

      // If using formly, trigger validation on all fields
      // This will ensure validation messages are displayed immediately
      this.messageFields.forEach(field => {
        if (field.formControl) {
          field.formControl.markAsTouched();
        }
      });

      // Manually mark for check to ensure UI updates
      this.cdRef.detectChanges();
    }
  }

  /**
   * Submit the message form and save the title and message
   */
  submitMessageForm(formData: any): void {
    if (!this.currentAnnotationId) {
      return;
    }

    const title = formData.title.trim();
    const messageText = formData.message ? formData.message.trim() : "";

    // No need for custom validation as it's handled by formly

    // Find the annotation in the local array
    const index = this.annotations.findIndex(ann => ann.id === this.currentAnnotationId);

    if (index !== -1) {
      const annotation = this.annotations[index];

      // Save the title
      annotation.title = title;

      // Update the color if changed
      if (formData.color) {
        annotation.color = formData.color;
      }

      // Add or update the note
      if (messageText) {
        if (!annotation.note) {
          // Create a new note with default position
          annotation.note = {
            text: messageText,
            position: { x: 50, y: 20 },
            expanded: true  // Default to expanded so the user can see it
          };
        } else {
          // Update existing note
          annotation.note.text = messageText;
        }
      } else if (annotation.note) {
        // Clear the note if empty text
        annotation.note.text = "";
      }

      console.log("Updated annotation with title, color, and message:", annotation);
    } else {
      // Use the service method as a fallback
      this.annotationService.addNoteToAnnotation(this.currentAnnotationId, messageText);
    }

    // Reset current ID
    this.currentAnnotationId = null;
    this.cdRef.markForCheck();
  }

  /**
   * Update the annotation's note text
   */
  updateAnnotationText(id: string, text: string): void {
    this.annotationService.updateAnnotationNote(id, { text });
    this.cdRef.markForCheck();
  }

  /**
   * Share the current annotations
   */
  shareAnnotations(): void {
    // Log the current annotations for debugging
    console.log("Current annotations:", this.annotations);

    // Check if there are annotations to share
    if (!this.annotations || this.annotations.length === 0) {
      console.error("No annotations to share");
      this.popNotificationsService.error(
        this.translateService.instant("No annotations to share")
      );
      return;
    }

    // Generate the URL parameter from the annotations
    let urlParam;
    try {
      urlParam = this.annotationService.getUrlParam();
      console.log("Generated URL param:", urlParam);

      if (!urlParam) {
        console.error("Failed to generate URL parameter for annotations");
        this.popNotificationsService.error(
          this.translateService.instant("Failed to generate shareable URL")
        );
        return;
      }
    } catch (error) {
      console.error("Error generating URL parameter:", error);
      this.popNotificationsService.error(
        this.translateService.instant("Failed to generate shareable URL")
      );
      return;
    }

    // Add or update the annotations parameter without navigation
    if (this.isBrowser) {
      // Skip interim message and go straight to the update and copy

      // Get the current URL
      const currentUrl = this.windowRefService.getCurrentUrl();

      // Update the annotations parameter
      currentUrl.searchParams.set('annotations', urlParam);

      // Update the URL without navigation
      this.windowRefService.replaceState({}, currentUrl.toString());

      // Copy the URL to clipboard with a slight delay to ensure URL is updated
      this.windowRefService.utilsService.delay(200).subscribe(() => {
        // Use the WindowRefService's copyToClipboard method which handles fallbacks properly
        this.windowRefService.copyToClipboard(currentUrl.toString())
          .then(success => {
            if (success) {
              this.popNotificationsService.success(
                this.translateService.instant("URL with annotations copied to clipboard")
              );
            } else {
              // Fall back to just updating the URL if clipboard access failed
              this.popNotificationsService.info(
                this.translateService.instant("Annotations URL has been updated. You can now share this page.")
              );
            }
          })
          .catch(error => {
            console.error("Error copying to clipboard:", error);
            // Still provide feedback even if clipboard fails
            this.popNotificationsService.info(
              this.translateService.instant("Annotations URL has been updated. You can now share this page.")
            );
          });
      });
    }
  }

  /**
   * Show help instructions in an offcanvas panel
   */
  showHelp(): void {
    if (!this.isBrowser) {
      return;
    }

    // Open the offcanvas using the template reference
    this.offcanvasService.open(this.helpContentRef, {
      position: this.deviceService.offcanvasPosition(),
      panelClass: 'image-viewer-offcanvas help-offcanvas',
      backdropClass: 'image-viewer-offcanvas-backdrop'
    });
  }

  /**
   * Save annotations to the database (owner only)
   */
  saveAnnotations(): void {
    if (!this.isImageOwner || !this.revision || !this.revision.pk) {
      return;
    }

    // Set saving state
    this.savingAnnotations = true;
    this.saveSuccess = false;
    this.cdRef.markForCheck();

    const annotationsJson = JSON.stringify(this.annotations);
    
    // Choose the appropriate method based on whether we're dealing with a revision or an image
    let saveMethod;
    if (this.revision.hasOwnProperty('label')) {
      saveMethod = this.imageApiService.setRevisionAnnotations(this.revision.pk, annotationsJson);
    } else {
      saveMethod = this.imageApiService.setAnnotations(this.revision.pk, annotationsJson);
    }

    // Now use the selected method with a single set of success/error handlers
    saveMethod.pipe(take(1)).subscribe({
      next: () => {
        // Show success indicator
        this.savingAnnotations = false;
        this.saveSuccess = true;
        this.cdRef.markForCheck();

        // Reset success indicator after 1.5 seconds
        this.utilsService.delay(1500).subscribe(() => {
          this.saveSuccess = false;
          this.cdRef.markForCheck();
        });
      },
      error: err => {
        // Show error in popup
        console.error("Error saving annotations:", err);
        this.savingAnnotations = false;
        this.cdRef.markForCheck();

        this.popNotificationsService.error(
          this.translateService.instant("Failed to save annotations: {{error}}",
            { error: err.message || this.translateService.instant("Unknown error") })
        );
      }
    });
  }

  /**
   * Helper to try various methods to find the image element
   */
  private tryFindImageElement(): void {
    // Safely check if imageElement reference exists and is valid
    if (this.imageElement && this.imageElement.nativeElement) {
      // Check if we're using the static image approach (direct img element)
      if (this.imageElement.nativeElement instanceof HTMLImageElement) {
        console.log("Using static image approach with direct img element");
        // Just use the element directly
        this.cachedImageElement = this.imageElement.nativeElement;
        const rect = this.cachedImageElement.getBoundingClientRect();
        console.log("Using static image element with dimensions:",
          { width: rect.width, height: rect.height, element: this.cachedImageElement });
        return;
      }

      // Old approach with zoom container
      // First try to get the actual visible image element in the zoom container
      try {
        this.cachedImageElement = this.imageElement.nativeElement.querySelector(".ngxImageZoomContainer img");
      } catch (e) {
        console.warn("Error finding image element with querySelector:", e);
      }

      // Log the dimensions of what we found
      if (this.cachedImageElement) {
        const rect = this.cachedImageElement.getBoundingClientRect();
        console.log("Found cached image element with dimensions:",
          { width: rect.width, height: rect.height, element: this.cachedImageElement });
      }

      // If we can't find it with the first selector, or it has no dimensions, try alternatives
      if (!this.cachedImageElement || this.cachedImageElement.getBoundingClientRect().width === 0) {
        console.log("Trying alternative selectors...");

        // Try common selectors based on the viewer implementation, ordered by likelihood of being the main image
        const selectors = [
          "img.ngxImageZoomThumbnail", // Original image in the zoom component
          "img.ngxImageZoomFullImage", // Zoomed image
          ".ngxImageZoomFullContainer img", // Another potential zoomed image
          "canvas", // Canvas element (if image is rendered in canvas) - moved up for touch mode
          "img:not([hidden])", // Any visible image
          "img" // Any image
        ];

        for (const selector of selectors) {
          try {
            const element = this.imageElement.nativeElement.querySelector(selector);
            if (element && element.getBoundingClientRect().width > 0) {
              this.cachedImageElement = element as HTMLElement;
              const rect = element.getBoundingClientRect();
              console.log(`Found element with selector: ${selector}`,
                { width: rect.width, height: rect.height, element });
              break;
            }
          } catch (e) {
            console.warn(`Error finding image element with selector ${selector}:`, e);
          }
        }
      }
    }

    // If still not found, try document-wide search focusing on visible elements with dimensions
    if (!this.cachedImageElement || this.cachedImageElement.getBoundingClientRect().width === 0) {
      console.log("Trying document-wide search...");

      // Define selectors based on whether we're in fullscreen or regular image viewer
      let viewerSelectors: string[];
      
      // Check if we're in fullscreen or regular image viewer mode
      const isFullscreen = document.querySelector(".fullscreen-image-viewer") !== null;
      const isRegularViewer = document.querySelector("astrobin-image-viewer") !== null;
      
      if (isFullscreen) {
        viewerSelectors = [
          ".fullscreen-image-viewer .ngxImageZoomContainer img",
          ".fullscreen-image-viewer img.ngxImageZoomThumbnail",
          ".fullscreen-image-viewer img.ngxImageZoomFullImage",
          ".fullscreen-image-viewer .ngxImageZoomFullContainer img",
          ".fullscreen-image-viewer canvas",
          ".fullscreen-image-viewer img:not([hidden])",
          ".fullscreen-image-viewer img" 
        ];
      } else if (isRegularViewer) {
        viewerSelectors = [
          "astrobin-image-viewer .astrobin-image img",
          "astrobin-image-viewer img",
          "astrobin-image img",
          "astrobin-image-viewer canvas",
          ".image-container img"
        ];
      } else {
        // Fallback selectors if we can't determine the viewer type
        viewerSelectors = [
          ".ngxImageZoomContainer img",
          "img.ngxImageZoomThumbnail",
          "img.ngxImageZoomFullImage",
          ".ngxImageZoomFullContainer img",
          "canvas",
          "img:not([hidden])",
          "img"
        ];
      }

      for (const selector of viewerSelectors) {
        try {
          const element = document.querySelector(selector);
          if (element && element.getBoundingClientRect().width > 0) {
            this.cachedImageElement = element as HTMLElement;
            const rect = element.getBoundingClientRect();
            console.log(`Found element with document-wide selector: ${selector}`,
              { width: rect.width, height: rect.height, element, tagName: element.tagName });
            break;
          }
        } catch (e) {
          console.warn(`Error finding element with document-wide selector ${selector}:`, e);
        }
      }
    }

    // Specific handling for touch mode - explicitly try to find canvas which may load later
    if (this.deviceService.isTouchEnabled() && (!this.cachedImageElement || this.cachedImageElement.tagName !== 'CANVAS')) {
      console.log("Touch device detected - specifically searching for canvas element");

      const canvasSelectors = [
        ".fullscreen-image-viewer canvas",
        "astrobin-image-viewer canvas",
        "canvas.touchRealCanvas",
        "canvas"
      ];

      for (const selector of canvasSelectors) {
        try {
          const element = document.querySelector(selector);
          if (element && element.getBoundingClientRect().width > 0) {
            console.log(`Found canvas element with selector: ${selector}`, element);
            this.cachedImageElement = element as HTMLElement;
            break;
          }
        } catch (e) {
          console.warn(`Error finding canvas element with selector ${selector}:`, e);
        }
      }
    }

    // If we found an element, check and store its natural dimensions for future reference
    if (this.cachedImageElement) {
      if (this.cachedImageElement instanceof HTMLImageElement && this.cachedImageElement.naturalWidth && !this.naturalWidth) {
        this.naturalWidth = this.cachedImageElement.naturalWidth;
        this.naturalHeight = this.cachedImageElement.naturalHeight;
        console.log("Updated natural dimensions from image:",
          { width: this.naturalWidth, height: this.naturalHeight });
      } else if (this.cachedImageElement instanceof HTMLCanvasElement) {
        console.log("Canvas element found, dimensions:", {
          width: this.cachedImageElement.width,
          height: this.cachedImageElement.height,
          displayWidth: this.cachedImageElement.getBoundingClientRect().width,
          displayHeight: this.cachedImageElement.getBoundingClientRect().height
        });
      }
    }
    // If still no element found with dimensions, use fallback mechanisms
    else {
      console.warn("Could not find any suitable image element with dimensions, will use fallbacks when drawing");
    }
  }

  /**
   * Handle rectangle dragging and resizing
   */
  private handleRectangleDrag(deltaXPercent: number, deltaYPercent: number, currentXPercent: number, currentYPercent: number): void {
    if (this.dragMode === "whole") {
      // Move the entire rectangle
      this.currentlyDragging.x = this.dragStartShapeX + deltaXPercent;
      this.currentlyDragging.y = this.dragStartShapeY + deltaYPercent;
    } else {
      // Handle corner resizing
      // First, get the original rectangle dimensions and position
      const originalLeft = this.dragStartShapeX;
      const originalTop = this.dragStartShapeY;
      const originalRight = originalLeft + this.dragStartShapeWidth;
      const originalBottom = originalTop + this.dragStartShapeHeight;

      // Determine new corner positions based on the drag mode
      let newLeft = originalLeft;
      let newTop = originalTop;
      let newRight = originalRight;
      let newBottom = originalBottom;

      switch (this.dragMode) {
        case "tl": // Top-left
          newLeft = Math.min(originalRight - this.MIN_SIZE_PERCENT, originalLeft + deltaXPercent);
          newTop = Math.min(originalBottom - this.MIN_SIZE_PERCENT, originalTop + deltaYPercent);
          break;

        case "tr": // Top-right
          newRight = Math.max(originalLeft + this.MIN_SIZE_PERCENT, originalRight + deltaXPercent);
          newTop = Math.min(originalBottom - this.MIN_SIZE_PERCENT, originalTop + deltaYPercent);
          break;

        case "bl": // Bottom-left
          newLeft = Math.min(originalRight - this.MIN_SIZE_PERCENT, originalLeft + deltaXPercent);
          newBottom = Math.max(originalTop + this.MIN_SIZE_PERCENT, originalBottom + deltaYPercent);
          break;

        case "br": // Bottom-right
          newRight = Math.max(originalLeft + this.MIN_SIZE_PERCENT, originalRight + deltaXPercent);
          newBottom = Math.max(originalTop + this.MIN_SIZE_PERCENT, originalBottom + deltaYPercent);
          break;
      }

      // Update the rectangle attributes from the new corner positions
      this.currentlyDragging.x = newLeft;
      this.currentlyDragging.y = newTop;
      this.currentlyDragging.width = newRight - newLeft;
      this.currentlyDragging.height = newBottom - newTop;
    }

    // Force redraw to update HTML positioning with new values
    this.cdRef.detectChanges();
  }

  /**
   * Handle circle dragging and resizing
   */
  private handleCircleDrag(deltaXPercent: number, deltaYPercent: number, currentXPercent: number, currentYPercent: number): void {
    if (this.dragMode === "whole" || this.dragMode === "center") {
      // Move the entire circle
      this.currentlyDragging.cx = this.dragStartShapeX + deltaXPercent;
      this.currentlyDragging.cy = this.dragStartShapeY + deltaYPercent;
    } else if (this.dragMode === "resize") {
      // We simply use the direct distance between current mouse position and center
      const cx = +this.currentlyDragging.cx;
      const cy = +this.currentlyDragging.cy;

      // Calculate distance from center to mouse (simple Pythagorean distance)
      const dx = currentXPercent - cx;
      const dy = currentYPercent - cy;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Set the radius directly to the distance with a minimum size
      this.currentlyDragging.r = Math.max(this.MIN_RADIUS_PERCENT, distance);

      console.log("Circle resize:", {
        center: { x: cx, y: cy },
        mouse: { x: currentXPercent, y: currentYPercent },
        distance: distance,
        newRadius: this.currentlyDragging.r
      });
    }

    // Force redraw to update HTML positioning with new values
    this.cdRef.detectChanges();
  }


  /**
   * Private helper to update annotation points after position calculation
   */
  private _updateAnnotationPoints(relX: number, relY: number): void {
    console.log("_updateAnnotationPoints", { relX, relY, activeAnnotation: this.activeAnnotation });

    // Update the annotation's shape points based on the shape type
    switch (this.activeAnnotation.shape.type) {
  
      case AnnotationShapeType.RECTANGLE:
        // For a rectangle, we store the start and end points to define the rectangle
        if (this.activeAnnotation.shape.points.length === 0) {
          // If no points, add both start and end points as the same
          this.annotationService.updateAnnotationShape(this.activeAnnotation.id, {
            points: [{ x: relX, y: relY }, { x: relX, y: relY }]
          });
        } else {
          // Otherwise, update just the end point
          this.annotationService.updateAnnotationShape(this.activeAnnotation.id, {
            points: [
              this.activeAnnotation.shape.points[0],
              { x: relX, y: relY }
            ]
          });
        }
        break;

      case AnnotationShapeType.CIRCLE:
        // For a circle, we store the center and a point on the circumference
        if (this.activeAnnotation.shape.points.length === 0) {
          // If no points, add both center and radius point as the same
          this.annotationService.updateAnnotationShape(this.activeAnnotation.id, {
            points: [{ x: relX, y: relY }, { x: relX, y: relY }]
          });
        } else {
          // Otherwise, update just the radius point
          this.annotationService.updateAnnotationShape(this.activeAnnotation.id, {
            points: [
              this.activeAnnotation.shape.points[0],
              { x: relX, y: relY }
            ]
          });
        }
        break;
    }
  }

  /**
   * Initialize message form fields using ngx-formly
   */
  private initMessageFormFields(): void {
    this.messageFields = [
      {
        key: "title",
        type: "input",
        wrappers: ["default-wrapper"],
        props: {
          label: this.translateService.instant("Title"),
          placeholder: this.translateService.instant("Enter a title (max 50 characters)"),
          required: true,
          maxLength: 50,
        }
      },
      {
        key: "message",
        type: "textarea",
        wrappers: ["default-wrapper"],
        props: {
          label: this.translateService.instant("Description"),
          placeholder: this.translateService.instant("Enter a description for this annotation"),
          rows: 4,
        }
      },
      {
        key: "color",
        type: "color-picker",
        wrappers: ["default-wrapper"],
        props: {
          label: this.translateService.instant("Color"),
          colors: this.colors,
        }
      }
    ];
  }

  /**
   * Load saved annotations from the revision object
   */
  private loadSavedAnnotations(): void {
    console.log("loadSavedAnnotations called with revision:", this.revision);

    if (!this.revision) {
      console.log("No revision object provided");
      return;
    }

    if (!this.revision.annotations) {
      console.log("No annotations found in revision object");
      return;
    }

    // Assume we might be loading annotations - set flag for visual indicator
    this.loadingAnnotations = true;
    console.log("Loading annotations from revision, setting loadingAnnotations=true");

    // Force the loading indicator to be cleared after 3 seconds as a failsafe
    this.utilsService.delay(3000).subscribe(() => {
      if (this.loadingAnnotations) {
        console.log("Failsafe: Force clearing loadingAnnotations after timeout");
        this.loadingAnnotations = false;
        this.cdRef.markForCheck();
      }
    });

    try {
      console.log("Revision annotations content:", this.revision.annotations);

      // Load the annotations directly from the revision object
      if (typeof this.revision.annotations === 'string' && this.revision.annotations.trim() !== '') {
        console.log("Calling annotationService.loadFromJsonString");
        // Use loadFromJsonString since the annotations in the revision are already in JSON format
        this.annotationService.loadFromJsonString(this.revision.annotations);

        // Log current state of annotations right after loading
        console.log("Immediate annotations after loading:", this.annotations);
        console.log("Readonly mode:", this.readonly);

        // Add a small delay to ensure UI updates
        this.utilsService.delay(300).subscribe(() => {
          console.log("After delay, setting loadingAnnotations=false");
          this.loadingAnnotations = false;
          console.log("Current annotations array:", this.annotations);

          // Force check if annotations container is properly positioned
          this.updateAnnotationContainerSize();

          // Make sure the annotations are visible in readonly mode
          if (this.readonly) {
            // Position the annotations container immediately after loading
            this.windowRefService.utilsService.delay(100).subscribe(() => {
              this.updateAnnotationContainerSize();
              this.cdRef.markForCheck();
            });
          }

          this.cdRef.markForCheck();
        });
      } else {
        // No annotations in the revision, just clear the loading state
        console.log("Empty annotations string, setting loadingAnnotations=false");
        this.loadingAnnotations = false;
        this.cdRef.markForCheck();
      }
    } catch (e) {
      // Handle error loading annotations
      console.error("Error loading annotations from revision:", e);
      this.loadingAnnotations = false;
      this.annotations = [];
      this.annotationService.clearAllAnnotations();
      this.cdRef.markForCheck();
    }
  }
}
