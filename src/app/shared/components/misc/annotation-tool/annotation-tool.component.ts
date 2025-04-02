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
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { isPlatformBrowser } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { Annotation } from "./models/annotation.model";
import { AnnotationService } from "./services/annotation.service";
import { AnnotationShapeType } from "./models/annotation-shape-type.enum";
import { FormBuilder, FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";

@Component({
  selector: "astrobin-annotation-tool",
  templateUrl: "./annotation-tool.component.html",
  styleUrls: ["./annotation-tool.component.scss"]
})
export class AnnotationToolComponent extends BaseComponentDirective implements OnInit, OnDestroy, AfterViewInit {
  // Make environment available to template
  environment = environment;
  @Input() active: boolean = false;
  @Input() imageElement: ElementRef<HTMLElement>;
  @Input() windowWidth: number;
  @Input() windowHeight: number;
  @Input() setMouseOverUIElement: (value: boolean) => void;
  @Input() naturalWidth: number;
  @Input() naturalHeight: number;

  @Output() exitAnnotationMode = new EventEmitter<void>();

  // Types for template use
  readonly AnnotationShapeType = AnnotationShapeType;

  // Active annotation being created/edited
  activeAnnotation: Annotation | null = null;

  // Mode tracking
  isDrawing: boolean = false;
  isAddingNote: boolean = false;
  currentDrawingTool: AnnotationShapeType = AnnotationShapeType.ARROW;

  // Mouse tracking
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
  messageModel = { title: "", message: "" };
  currentAnnotationId: string | null = null;
  pendingShapeData: any = null;
  @ViewChild("annotationFormModal", { static: true }) annotationFormModalRef: TemplateRef<any>;
  // Constants for reference in templates
  protected readonly Math = Math;
  // Flag to detect browser environment
  protected isBrowser: boolean;
  // Constants for magic values
  private readonly DRAG_THRESHOLD = 10; // Minimum pixels to move before considering it a drag
  private readonly CLICK_PREVENTION_TIMEOUT_MS = 100; // Timeout to prevent accidental double clicks
  private readonly RESIZE_DEBOUNCE_MS = 300; // Debounce time for window resize events
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
    private modalService: NgbModal,
    private popNotificationsService: PopNotificationsService,
    private translateService: TranslateService,
    private windowRefService: WindowRefService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
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

    // Check for shared annotations in the URL when component initializes
    if (this.isBrowser) {
      this.activatedRoute.queryParams.pipe(
        take(1)
      ).subscribe(params => {
        if (params.annotations) {
          try {
            this.annotationService.loadFromUrlParam(params.annotations);
          } catch (e) {
            console.error("Failed to load shared annotations:", e);
            this.popNotificationsService.error(
              this.translateService.instant("Failed to load shared annotations: {{error}}", { error: e.message })
            );
          }
        }
      });
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
      // Initialize the cached image element after a delay to ensure DOM is ready
      this.windowRefService.utilsService.delay(300).subscribe(() => {
        console.log("Trying to find image element...");
        console.log("ImageElement:", this.imageElement);

        this.tryFindImageElement();

        // Retry after a longer delay if not found
        if (!this.cachedImageElement) {
          console.log("Retrying with longer delay...");
          this.windowRefService.utilsService.delay(1000).subscribe(() => {
            this.tryFindImageElement();
          });
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      // Complete all drag-related subjects
      this._shapeDragStart$.complete();
      this._shapeDragEnd$.complete();
      this._noteDragStart$.complete();
      this._noteDragEnd$.complete();
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

    // Get the width/height ratio change to update annotation positions
    const widthRatio = window.innerWidth / this._prevWindowWidth;
    const heightRatio = window.innerHeight / this._prevWindowHeight;

    // Update all annotation positions based on the new dimensions
    this.annotationService.recalculatePositionsAfterResize(widthRatio, heightRatio);

    // Store the new dimensions
    this._prevWindowWidth = window.innerWidth;
    this._prevWindowHeight = window.innerHeight;

    this.cdRef.markForCheck();
  }

  /**
   * Prepare a rectangle annotation and open the form
   */
  makeRect(): void {
    console.log("makeRect called");

    // Get container dimensions to calculate 100x100px as percentage
    const containerElement = document.querySelector(".annotation-container") as HTMLElement;
    let containerWidth = 1000; // Fallback width
    let containerHeight = 1000; // Fallback height

    if (containerElement) {
      const rect = containerElement.getBoundingClientRect();
      containerWidth = rect.width || 1000;
      containerHeight = rect.height || 1000;
    }

    // Calculate how much 100px is as a percentage of container dimensions
    const widthPercent = (100 / containerWidth) * 100;
    const heightPercent = (100 / containerHeight) * 100;

    // Prepare the shape data (without creating the annotation yet)
    const shapeData = {
      type: "rectangle",
      color: "#ffffff", // White
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
    console.log("makeCircle called");

    // Get container dimensions to calculate 100x100px as percentage
    const containerElement = document.querySelector(".annotation-container") as HTMLElement;
    let containerWidth = 1000; // Fallback width
    let containerHeight = 1000; // Fallback height

    if (containerElement) {
      const rect = containerElement.getBoundingClientRect();
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
      color: "#ffffff", // White
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

  // Arrow specific helpers
  getArrowStartX(ann: any): number {
    return (ann.startX - this.getAnnotationLeft(ann)) * 100 / this.getAnnotationWidth(ann);
  }

  getArrowStartY(ann: any): number {
    return (ann.startY - this.getAnnotationTop(ann)) * 100 / this.getAnnotationHeight(ann);
  }

  getArrowEndX(ann: any): number {
    return (ann.endX - this.getAnnotationLeft(ann)) * 100 / this.getAnnotationWidth(ann);
  }

  getArrowEndY(ann: any): number {
    return (ann.endY - this.getAnnotationTop(ann)) * 100 / this.getAnnotationHeight(ann);
  }

  getArrowLength(ann: any): number {
    // Calculate the length of the arrow line
    const dx = ann.endX - ann.startX;
    const dy = ann.endY - ann.startY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  getArrowTransform(ann: any): string {
    // Calculate angle of the arrow line
    const angle = Math.atan2(ann.endY - ann.startY, ann.endX - ann.startX) * 180 / Math.PI;
    // Position the arrow line at the start point
    const startXPercent = this.getArrowStartX(ann);
    const startYPercent = this.getArrowStartY(ann);
    return `rotate(${angle}deg) translate(${startXPercent}%, ${startYPercent}%)`;
  }

  getArrowHeadX(ann: any): number {
    return this.getArrowEndX(ann);
  }

  getArrowHeadY(ann: any): number {
    return this.getArrowEndY(ann);
  }

  getArrowHeadTransform(ann: any): string {
    // Calculate angle of the arrow head
    const angle = Math.atan2(ann.endY - ann.startY, ann.endX - ann.startX) * 180 / Math.PI;
    return `rotate(${angle}deg)`;
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
    } else if (shape.type === AnnotationShapeType.ARROW) {
      const points = shape.points;
      if (points.length >= 2) {
        return Math.min(points[0].x, points[1].x);
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
    } else if (shape.type === AnnotationShapeType.ARROW) {
      const points = shape.points;
      if (points.length >= 2) {
        return Math.min(points[0].y, points[1].y);
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
    } else if (shape.type === AnnotationShapeType.ARROW) {
      const points = shape.points;
      if (points.length >= 2) {
        return Math.abs(points[1].x - points[0].x);
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
    } else if (shape.type === AnnotationShapeType.ARROW) {
      const points = shape.points;
      if (points.length >= 2) {
        return Math.abs(points[1].y - points[0].y);
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
    this.annotations = [];
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
      
      const title = annotation.title || this.translateService.instant("Untitled Annotation");
      componentInstance.title = this.translateService.instant("Delete Annotation");
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
    if (this.currentlyDragging.type === "arrow") {
      this.handleArrowDrag(deltaXPercent, deltaYPercent, currentXPercent, currentYPercent);
    } else if (this.currentlyDragging.type === "rectangle") {
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
   * Old method - Create an arrow annotation
   */
  createArrow(): void {
    console.log("createArrow called");

    // Create a new annotation for an arrow
    const annotation = this.annotationService.createAnnotation({
      shapeType: AnnotationShapeType.ARROW,
      color: this.annotationService.getNextColor()
    });

    console.log("Created arrow annotation:", annotation);

    // Set arrow points (center horizontal arrow)
    this.annotationService.updateAnnotationShape(annotation.id, {
      points: [
        { x: 35, y: 50 },
        { x: 65, y: 50 } // Horizontal arrow across the center
      ]
    });

    // Set as active annotation and activate note editor
    this.activeAnnotation = annotation;
    this.isAddingNote = true;

    // Force change detection
    this.ngZone.run(() => {
      this.cdRef.markForCheck();
    });
  }

  /**
   * Create a rectangle annotation
   */
  createRectangle(): void {
    console.log("createRectangle called");

    // Create a new annotation for a rectangle
    const annotation = this.annotationService.createAnnotation({
      shapeType: AnnotationShapeType.RECTANGLE,
      color: this.annotationService.getNextColor()
    });

    console.log("Created rectangle annotation:", annotation);

    // Set rectangle points (centered rectangle)
    this.annotationService.updateAnnotationShape(annotation.id, {
      points: [
        { x: 35, y: 35 },
        { x: 65, y: 65 } // Center rectangle
      ]
    });

    // Set as active annotation and activate note editor
    this.activeAnnotation = annotation;
    this.isAddingNote = true;

    // Force change detection
    this.ngZone.run(() => {
      this.cdRef.markForCheck();
    });
  }

  /**
   * Create a circle annotation
   */
  createCircle(): void {
    console.log("createCircle called");

    // Create a new annotation for a circle
    const annotation = this.annotationService.createAnnotation({
      shapeType: AnnotationShapeType.CIRCLE,
      color: this.annotationService.getNextColor()
    });

    console.log("Created circle annotation:", annotation);

    // Set circle points (centered circle with radius)
    this.annotationService.updateAnnotationShape(annotation.id, {
      points: [
        { x: 50, y: 50 }, // Center
        { x: 65, y: 50 }  // Point on circumference (radius = 15%)
      ]
    });

    // Set as active annotation and activate note editor
    this.activeAnnotation = annotation;
    this.isAddingNote = true;

    // Force change detection
    this.ngZone.run(() => {
      this.cdRef.markForCheck();
    });
  }

  /**
   * Create a default-sized shape without drawing (legacy)
   */
  createDefaultShape(event: MouseEvent): void {
    console.log("createDefaultShape called");

    if (this.isDrawing || this.isAddingNote) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    // Create a new annotation with the current drawing tool
    const annotation = this.annotationService.createAnnotation({
      shapeType: this.currentDrawingTool,
      color: this.annotationService.getNextColor()
    });

    console.log("Created annotation:", annotation);

    // Get the center of the view
    const containerElement = document.querySelector(".fullscreen-image-viewer") || document.body;
    const containerBounds = containerElement.getBoundingClientRect();
    const centerX = 50; // Use percentage (middle of the container)
    const centerY = 50;

    // Apply defaults based on shape type
    if (this.currentDrawingTool === AnnotationShapeType.ARROW) {
      this.annotationService.updateAnnotationShape(annotation.id, {
        points: [
          { x: centerX - 15, y: centerY },
          { x: centerX + 15, y: centerY } // Horizontal arrow in the center
        ]
      });
    } else if (this.currentDrawingTool === AnnotationShapeType.RECTANGLE) {
      this.annotationService.updateAnnotationShape(annotation.id, {
        points: [
          { x: centerX - 12.5, y: centerY - 10 },
          { x: centerX + 12.5, y: centerY + 10 }
        ]
      });
    } else if (this.currentDrawingTool === AnnotationShapeType.CIRCLE) {
      this.annotationService.updateAnnotationShape(annotation.id, {
        points: [
          { x: centerX, y: centerY },
          { x: centerX + 12, y: centerY } // Creates a circle with radius 12% of width
        ]
      });
    }

    console.log("Updated to default shape:", annotation);

    // Set as active annotation to add note
    this.activeAnnotation = annotation;
    this.isAddingNote = true;

    // Visual feedback
    if (this.isBrowser) {
      const successIndicator = document.createElement("div");
      successIndicator.style.position = "fixed";
      successIndicator.style.top = "50%";
      successIndicator.style.left = "50%";
      successIndicator.style.transform = "translate(-50%, -50%)";
      successIndicator.style.padding = "15px 30px";
      successIndicator.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
      successIndicator.style.color = "white";
      successIndicator.style.borderRadius = "4px";
      successIndicator.style.zIndex = "9999";
      successIndicator.style.fontWeight = "bold";
      successIndicator.textContent = this.translateService.instant("Shape created! Add a note...");

      document.body.appendChild(successIndicator);
      setTimeout(() => {
        if (successIndicator.parentNode) {
          document.body.removeChild(successIndicator);
        }
      }, 1500);
    }

    // Force change detection
    this.ngZone.run(() => {
      this.cdRef.markForCheck();
    });
  }

  /**
   * Start drawing a new shape annotation
   */
  startDrawing(event: MouseEvent, shapeType: AnnotationShapeType): void {
    console.log("startDrawing called", { event, shapeType, active: this.active, dragInProgress: this._dragInProgress });

    if (!this.active || this._dragInProgress) {
      console.log("Drawing prevented - not active or drag in progress");
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    console.log("Starting to draw...");
    this.isDrawing = true;

    // Store starting mouse coordinates for later distance calculation
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;

    this.activeAnnotation = this.annotationService.createAnnotation({
      shapeType: shapeType,
      color: this.annotationService.getNextColor()
    });

    console.log("Created annotation:", this.activeAnnotation);

    // Initialize the starting point of the shape
    this.updateActiveAnnotationPoints(event);

    console.log("After updating points:", this.activeAnnotation);

    // Add a visual cue to show where the drawing started
    if (this.isBrowser) {
      const startMarker = document.createElement("div");
      startMarker.style.position = "absolute";
      startMarker.style.width = "15px";
      startMarker.style.height = "15px";
      startMarker.style.borderRadius = "50%";
      startMarker.style.border = `2px solid ${this.activeAnnotation.shape.color}`;
      startMarker.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
      startMarker.style.left = (event.clientX - 7) + "px";
      startMarker.style.top = (event.clientY - 7) + "px";
      startMarker.style.zIndex = "9999";
      startMarker.style.pointerEvents = "none";
      startMarker.style.boxShadow = "0 0 5px rgba(0, 0, 0, 0.5)";
      startMarker.classList.add("annotation-start-marker");

      document.body.appendChild(startMarker);
      setTimeout(() => {
        if (startMarker.parentNode) {
          document.body.removeChild(startMarker);
        }
      }, 2000);
    }

    // Force running change detection inside NgZone to make sure UI updates
    this.ngZone.run(() => {
      this.cdRef.markForCheck();
    });
  }

  /**
   * Complete the current drawing operation
   */
  finishDrawing(event: MouseEvent): void {
    console.log("finishDrawing called", { isDrawing: this.isDrawing, activeAnnotation: this.activeAnnotation });

    if (!this.isDrawing || !this.activeAnnotation) {
      console.log("Finish drawing prevented - not drawing or no active annotation");
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    console.log("Finishing drawing...");

    // Add a visual indicator where the mouse was released
    if (this.isBrowser) {
      const endMarker = document.createElement("div");
      endMarker.style.position = "absolute";
      endMarker.style.width = "15px";
      endMarker.style.height = "15px";
      endMarker.style.borderRadius = "50%";
      endMarker.style.border = `2px solid ${this.activeAnnotation.shape.color}`;
      endMarker.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
      endMarker.style.left = (event.clientX - 7) + "px";
      endMarker.style.top = (event.clientY - 7) + "px";
      endMarker.style.zIndex = "9999";
      endMarker.style.pointerEvents = "none";
      endMarker.style.boxShadow = "0 0 5px rgba(0, 0, 0, 0.5)";
      endMarker.classList.add("annotation-end-marker");

      document.body.appendChild(endMarker);
      setTimeout(() => {
        if (endMarker.parentNode) {
          document.body.removeChild(endMarker);
        }
      }, 2000);
    }

    // Update the final points
    this.updateActiveAnnotationPoints(event);

    console.log("Final points updated:", this.activeAnnotation);

    // Calculate the actual distance moved with the mouse (in pixels)
    const pixelDistance = Math.sqrt(
      Math.pow(event.clientX - this.dragStartX, 2) +
      Math.pow(event.clientY - this.dragStartY, 2)
    );

    console.log("Mouse distance in pixels:", pixelDistance);

    // If the mouse barely moved, create a default-sized shape instead
    if (pixelDistance < 10) {
      console.log("Mouse barely moved, creating default-sized shape");

      // For a default arrow, make it point right and be 25% of container width
      if (this.activeAnnotation.shape.type === AnnotationShapeType.ARROW) {
        const startX = this.activeAnnotation.shape.points[0].x;
        const startY = this.activeAnnotation.shape.points[0].y;

        this.annotationService.updateAnnotationShape(this.activeAnnotation.id, {
          points: [
            { x: startX, y: startY },
            { x: startX + 25, y: startY } // Create a horizontal arrow to the right
          ]
        });
      }
      // For a default rectangle, make it 15% of container width/height
      else if (this.activeAnnotation.shape.type === AnnotationShapeType.RECTANGLE) {
        const startX = this.activeAnnotation.shape.points[0].x;
        const startY = this.activeAnnotation.shape.points[0].y;

        this.annotationService.updateAnnotationShape(this.activeAnnotation.id, {
          points: [
            { x: startX, y: startY },
            { x: startX + 15, y: startY + 15 }
          ]
        });
      }
      // For a default circle, make radius 8% of container width
      else if (this.activeAnnotation.shape.type === AnnotationShapeType.CIRCLE) {
        const startX = this.activeAnnotation.shape.points[0].x;
        const startY = this.activeAnnotation.shape.points[0].y;

        this.annotationService.updateAnnotationShape(this.activeAnnotation.id, {
          points: [
            { x: startX, y: startY },
            { x: startX + 8, y: startY } // Create a circle with radius 8% of width
          ]
        });
      }

      console.log("Updated to default shape:", this.activeAnnotation);
    }

    console.log("Drawing finished, preparing to add note");
    // Finish the shape and prepare to add a note
    this.isDrawing = false;
    this.isAddingNote = true;

    // Create an element to visually indicate success
    if (this.isBrowser) {
      const successIndicator = document.createElement("div");
      successIndicator.style.position = "fixed";
      successIndicator.style.top = "50%";
      successIndicator.style.left = "50%";
      successIndicator.style.transform = "translate(-50%, -50%)";
      successIndicator.style.padding = "15px 30px";
      successIndicator.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
      successIndicator.style.color = "white";
      successIndicator.style.borderRadius = "4px";
      successIndicator.style.zIndex = "9999";
      successIndicator.style.fontWeight = "bold";
      successIndicator.textContent = this.translateService.instant("Shape created! Add a note...");

      document.body.appendChild(successIndicator);
      setTimeout(() => {
        if (successIndicator.parentNode) {
          document.body.removeChild(successIndicator);
        }
      }, 1500);
    }

    // Force running change detection inside NgZone to make sure UI updates
    this.ngZone.run(() => {
      this.cdRef.markForCheck();
    });
  }

  /**
   * Add a note to the current annotation
   */
  addNoteToAnnotation(text: string): void {
    if (!this.activeAnnotation) {
      return;
    }

    this.annotationService.addNoteToAnnotation(this.activeAnnotation.id, text);
    this.isAddingNote = false;
    this.activeAnnotation = null;
    this.cdRef.markForCheck();
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

    // As a fallback, use the host element that contains the whole component
    let containerElement = document.querySelector(".fullscreen-image-viewer");

    // Try with the cached image element first
    if (this.cachedImageElement && this.cachedImageElement.getBoundingClientRect().width > 0) {
      containerElement = this.cachedImageElement;
      console.log("Using cached image element for bounds");
    } else {
      // If no image element available, we'll use the fullscreen viewer
      if (containerElement) {
        console.log("Using fullscreen viewer as fallback for bounds");
      } else {
        // Last resort - use the entire document
        console.warn("Using document body as fallback");
        containerElement = document.body;
      }
    }

    // Get the container bounds
    const containerBounds = containerElement.getBoundingClientRect();
    console.log("Container bounds:", containerBounds);

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

    if (this.cachedImageElement) {
      const imageBounds = this.cachedImageElement.getBoundingClientRect();

      // Convert pixel deltas to percentage
      const deltaPercentX = (deltaX / imageBounds.width) * 100;
      const deltaPercentY = (deltaY / imageBounds.height) * 100;

      // Move the shape by the delta percentages
      this.annotationService.moveAnnotationShape(id, deltaPercentX, deltaPercentY);

      // Reset the drag start position
      this.dragStartX = event.clientX;
      this.dragStartY = event.clientY;

      this.cdRef.markForCheck();
    }
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
    setTimeout(() => {
      this._preventNextClick = false;
    }, this.CLICK_PREVENTION_TIMEOUT_MS);

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

    if (this.cachedImageElement) {
      const imageBounds = this.cachedImageElement.getBoundingClientRect();

      // Convert pixel deltas to percentage
      const deltaPercentX = (deltaX / imageBounds.width) * 100;
      const deltaPercentY = (deltaY / imageBounds.height) * 100;

      // Move the note by the delta percentages
      this.annotationService.moveAnnotationNote(id, deltaPercentX, deltaPercentY);

      // Reset the drag start position
      this.dragStartX = event.clientX;
      this.dragStartY = event.clientY;

      this.cdRef.markForCheck();
    }
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
    setTimeout(() => {
      this._preventNextClick = false;
    }, this.CLICK_PREVENTION_TIMEOUT_MS);

    this.cdRef.markForCheck();
  }

  /**
   * Exit annotation mode
   */
  exitAnnotationModeHandler(): void {
    // First clean up any active drawing
    this.cancelAnnotation();

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

    // Find and remove the annotation from our local array
    const index = this.annotations.findIndex(ann => ann.id === id);
    if (index !== -1) {
      this.annotations.splice(index, 1);
    } else {
      // Try the service method as a fallback
      this.annotationService.removeAnnotation(id);
    }

    this.cdRef.markForCheck();
  }

  /**
   * Open the annotation form for creating a new shape
   */
  openAnnotationForm(shapeData: any): void {
    console.log("Opening annotation form for new shape:", shapeData);

    // Store the shape data to be created when the form is submitted
    this.pendingShapeData = shapeData;
    
    // Reset the model for a new annotation
    this.messageModel = {
      title: "",
      message: ""
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

    // Initialize the form with existing title and message
    this.messageModel = {
      title: annotation.title || "",
      message: annotation.note ? annotation.note.text || "" : ""
    };

    // Reset the form and update the model for formly
    this.messageForm.reset();
    // Update the model directly (formly binds to this)
    this.messageModel = {
      title: this.messageModel.title,
      message: this.messageModel.message
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

      console.log("Updated annotation with title and message:", annotation);
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
    const urlParam = this.annotationService.getUrlParam();

    // Update the URL without navigation
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { annotations: urlParam },
      queryParamsHandling: "merge"
    });

    // Show notification
    this.popNotificationsService.success(
      this.translateService.instant("Annotations URL has been updated. You can now share this page.")
    );
  }

  /**
   * Clear all annotations
   */
  clearAllAnnotations(): void {
    this.annotationService.clearAllAnnotations();

    // Also update the URL to remove the annotations parameter
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { annotations: null },
      queryParamsHandling: 'merge'
    });

    this.cdRef.markForCheck();
  }

  /**
   * Helper to try various methods to find the image element
   */
  private tryFindImageElement(): void {
    // Try from the provided imageElement reference first
    if (this.imageElement?.nativeElement) {
      this.cachedImageElement = this.imageElement.nativeElement.querySelector(".ngxImageZoomContainer img");
      console.log("Found cached image element from provided ref:", this.cachedImageElement);

      // If we can't find it with the first selector, try alternatives
      if (!this.cachedImageElement) {
        console.log("Trying alternative selectors...");

        // Try common selectors based on the viewer implementation
        const selectors = [
          "img.ngxImageZoomThumbnail",
          "img.ngxImageZoomFullImage",
          ".ngxImageZoomFullContainer img",
          "img",
          "canvas"
        ];

        for (const selector of selectors) {
          this.cachedImageElement = this.imageElement.nativeElement.querySelector(selector);
          if (this.cachedImageElement) {
            console.log(`Found element with selector: ${selector}`, this.cachedImageElement);
            break;
          }
        }
      }
    }

    // If still not found, try document-wide search
    if (!this.cachedImageElement) {
      console.log("Trying document-wide search...");

      const selectors = [
        ".fullscreen-image-viewer .ngxImageZoomContainer img",
        ".fullscreen-image-viewer img.ngxImageZoomThumbnail",
        ".fullscreen-image-viewer img.ngxImageZoomFullImage",
        ".fullscreen-image-viewer .ngxImageZoomFullContainer img",
        ".fullscreen-image-viewer canvas",
        ".fullscreen-image-viewer img"
      ];

      for (const selector of selectors) {
        this.cachedImageElement = document.querySelector(selector);
        if (this.cachedImageElement) {
          console.log(`Found element with document-wide selector: ${selector}`, this.cachedImageElement);
          break;
        }
      }
    }

    // If still no element found, we'll rely on fallback mechanisms in updateActiveAnnotationPoints
    if (!this.cachedImageElement) {
      console.warn("Could not find any suitable image element, will use fallbacks when drawing");
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
   * Handle arrow dragging and control points
   */
  private handleArrowDrag(deltaXPercent: number, deltaYPercent: number, currentXPercent: number, currentYPercent: number): void {
    if (this.dragMode === "whole") {
      // Move the entire arrow by the delta percentage
      this.currentlyDragging.startX = this.dragStartShapeX + deltaXPercent;
      this.currentlyDragging.startY = this.dragStartShapeY + deltaYPercent;
      this.currentlyDragging.endX = this.dragStartShapeWidth + deltaXPercent;
      this.currentlyDragging.endY = this.dragStartShapeHeight + deltaYPercent;
    } else if (this.dragMode === "start") {
      // Move just the start point of the arrow to the current mouse position
      this.currentlyDragging.startX = this.dragStartShapeX + deltaXPercent;
      this.currentlyDragging.startY = this.dragStartShapeY + deltaYPercent;
    } else if (this.dragMode === "end") {
      // Move just the end point of the arrow to the current mouse position
      this.currentlyDragging.endX = this.dragStartShapeWidth + deltaXPercent;
      this.currentlyDragging.endY = this.dragStartShapeHeight + deltaYPercent;
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
      case AnnotationShapeType.ARROW:
        // For an arrow, we only need to update the end point (target)
        if (this.activeAnnotation.shape.points.length === 0) {
          // If no points, add the start point first
          this.annotationService.updateAnnotationShape(this.activeAnnotation.id, {
            points: [{ x: relX, y: relY }, { x: relX, y: relY }]
          });
        } else {
          // Otherwise, update the end point
          this.annotationService.updateAnnotationShape(this.activeAnnotation.id, {
            points: [
              this.activeAnnotation.shape.points[0],
              { x: relX, y: relY }
            ]
          });
        }
        break;

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
          placeholder: this.translateService.instant("Enter a title (max 30 characters)"),
          required: true,
          maxLength: 30,
          description: this.translateService.instant("Title will appear above the shape")
        }
      },
      {
        key: "message",
        type: "textarea",
        wrappers: ["default-wrapper"],
        props: {
          label: this.translateService.instant("Description"),
          placeholder: this.translateService.instant("Enter a description for this annotation"),
          rows: 5,
          description: this.translateService.instant("Optional description for this annotation")
        }
      }
    ];
  }
}
