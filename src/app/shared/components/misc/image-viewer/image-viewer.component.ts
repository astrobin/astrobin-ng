import { AfterViewChecked, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding, HostListener, Inject, Input, OnChanges, OnDestroy, OnInit, Output, PLATFORM_ID, Renderer2, RendererStyleFlags2, SimpleChanges, TemplateRef, ViewChild } from "@angular/core";
import { FINAL_REVISION_LABEL, FullSizeLimitationDisplayOptions, ImageInterface, ImageRevisionInterface, MouseHoverImageOptions, ORIGINAL_REVISION_LABEL } from "@core/interfaces/image.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { select, Store } from "@ngrx/store";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { ImageAlias } from "@core/enums/image-alias.enum";
import { DeviceService } from "@core/services/device.service";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { delay, filter, map, observeOn, switchMap, take, takeUntil } from "rxjs/operators";
import { ImageService } from "@core/services/image/image.service";
import { ActivatedRoute } from "@angular/router";
import { ContentTypeInterface } from "@core/interfaces/content-type.interface";
import { LoadContentType } from "@app/store/actions/content-type.actions";
import { selectContentType } from "@app/store/selectors/app/content-type.selectors";
import { HideFullscreenImage, ShowFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import { LoadSolutionMatrix } from "@app/store/actions/solution.actions";
import { selectIsSolutionMatrixLoading, selectSolutionMatrix } from "@app/store/selectors/app/solution.selectors";
import { animationFrameScheduler, auditTime, combineLatest, fromEvent, merge, Observable, of, Subject, Subscription, throttleTime } from "rxjs";
import { isPlatformBrowser, Location } from "@angular/common";
import { JsonApiService } from "@core/services/api/classic/json/json-api.service";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { WindowRefService } from "@core/services/window-ref.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { HttpClient } from "@angular/common/http";
import { environment } from "@env/environment";
import { TranslateService } from "@ngx-translate/core";
import { TitleService } from "@core/services/title/title.service";
import { ContentTranslateService } from "@core/services/content-translate.service";
import { Lightbox, LIGHTBOX_EVENT, LightboxEvent } from "ngx-lightbox";
import { UserSubscriptionService } from "@core/services/user-subscription/user-subscription.service";
import { AdManagerComponent } from "@shared/components/misc/ad-manager/ad-manager.component";
import { ImageViewerService } from "@core/services/image-viewer.service";
import { NgbModal, NgbModalRef, NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { SolutionApiService } from "@core/services/api/classic/platesolving/solution/solution-api.service";
import { Throttle } from "@app/decorators";
import { SolutionInterface, SolutionStatus } from "@core/interfaces/solution.interface";
import { fadeInOut } from "@shared/animations";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { NgbOffcanvasRef } from "@ng-bootstrap/ng-bootstrap/offcanvas/offcanvas-ref";
import { CookieService } from "ngx-cookie";
import { SearchModelInterface } from "@features/search/interfaces/search-model.interface";
import { SearchService } from "@core/services/search.service";
import { CoordinatesFormatterService } from "@core/services/coordinates-formatter.service";


@Component({
  selector: "astrobin-image-viewer",
  templateUrl: "./image-viewer.component.html",
  styleUrls: ["./image-viewer.component.scss"],
  animations: [fadeInOut],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageViewerComponent
  extends BaseComponentDirective
  implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy, OnChanges {
  @Input()
  image: ImageInterface;

  @Input()
  revisionLabel = FINAL_REVISION_LABEL;

  showNorthArrow = false;
  northArrowRotation: number = 0;

  @Input()
  showCloseButton = false;

  @Input()
  showPreviousButton = false;

  @Input()
  showNextButton = false;

  @Input()
  standalone = true;

  @Input()
  active = true;

  @Output()
  initialized = new EventEmitter<void>();

  @Output()
  closeClick = new EventEmitter<void>();

  @Output()
  previousClick = new EventEmitter<void>();

  @Output()
  nextClick = new EventEmitter<void>();

  @Output()
  toggleFullscreen = new EventEmitter<boolean>();

  @Output()
  revisionSelected = new EventEmitter<ImageRevisionInterface["label"]>();

  @ViewChild("mainArea")
  mainArea: ElementRef;

  @ViewChild("imageArea")
  imageArea: ElementRef;

  @ViewChild("dataArea")
  dataArea: ElementRef;

  @ViewChild("ad", { static: false, read: AdManagerComponent })
  adManagerComponent: AdManagerComponent;

  @ViewChild("scrollToTopMdMax", { static: false, read: ElementRef })
  scrollToTopMdMax: ElementRef;

  @ViewChild("scrollToTopLgMin", { static: false, read: ElementRef })
  scrollToTopLgMin: ElementRef;

  @ViewChild("nestedCommentsTemplate")
  nestedCommentsTemplate: TemplateRef<any>;

  @ViewChild("mouseHoverSvgObject", { static: false })
  mouseHoverSvgObject: ElementRef;

  @ViewChild("fullscreenViewer", { static: false })
  fullscreenViewer: any;

  protected readonly ImageAlias = ImageAlias;
  protected readonly isPlatformBrowser = isPlatformBrowser;
  // This is computed from `image` and `revisionLabel` and is used to display data for the current revision.
  protected revision: ImageInterface | ImageRevisionInterface;
  protected imageObjectLoaded = false;
  protected imageFileLoaded = false;
  protected alias: ImageAlias = ImageAlias.QHD;
  protected imageContentType: ContentTypeInterface;
  protected revisionContentType: ContentTypeInterface;
  protected userContentType: ContentTypeInterface;
  protected supportsFullscreen: boolean;
  protected viewingFullscreenImage = false;
  protected showRevisions = false;
  protected nonSolutionMouseHoverImage: string;
  protected solutionMouseHoverImage: string;
  protected forceViewMouseHover = false;
  protected forceViewAnnotationsMouseHover = false;
  protected inlineSvg: SafeHtml;
  protected showMoonOverlay = false;
  protected moonScaleDiameter: number = null;
  protected moonPosition = { x: 50, y: 50 }; // As percentage of container
  protected isDraggingMoon = false;
  protected moonImageSrc: string = "/assets/images/moon-250.png?v=1"; // Default, will be updated
  protected isMoonImageLoaded = false; // Track if the actual moon image has loaded
  protected advancedSolutionMatrix: {
    matrixRect: string;
    matrixDelta: number;
    raMatrix: string;
    decMatrix: string;
  };
  protected loadingAdvancedSolutionMatrix = false;
  protected mouseHoverRa: string;
  protected mouseHoverDec: string;
  protected mouseHoverGalacticRa: string;
  protected mouseHoverGalacticDec: string;
  protected mouseHoverX: number;
  protected mouseHoverY: number;
  protected isLightBoxOpen = false;
  protected showPlateSolvingBanner = false;
  protected showUpgradeToPlateSolveBanner$ = combineLatest([
    this.currentUser$,
    this.userSubscriptionService.canPlateSolve$()
  ]).pipe(
    takeUntil(this.destroyed$),
    map(([user, canPlateSolve]) => {
      if (!this.image || !user || user.id !== this.image.user || canPlateSolve) {
        return false;
      }

      return this.imageService.isPlateSolvable(this.image);
    })
  );
  protected adjustmentEditorVisible = false;
  protected showAd = false;
  protected adConfig: "rectangular" | "wide";
  protected adDisplayed = false;
  protected searchModel: SearchModelInterface;
  protected translatingDescription = false;
  protected translatedDescription: SafeHtml;
  protected readonly isBrowser: boolean;
  protected readonly MouseHoverImageOptions = MouseHoverImageOptions;
  protected isAnnotationMode: boolean = false;
  protected annotationReadOnlyMode: boolean = true; // Default to read-only mode
  protected currentUserIsImageOwner: boolean = false;
  protected imageElementForAnnotation: HTMLElement = null;
  protected isMouseOverUIElement: boolean = false;
  protected hasSavedAnnotations: boolean = false; // Flag for saved annotations
  protected hasUrlAnnotations: boolean = false; // Flag for annotations loaded from URL
  private _preloadMoonImageAttemptCount = 0; // Track number of preload attempts
  private _preloadedMoonImage: HTMLImageElement = null; // Store the preloaded image element
  private _moonStartDragPosition = { x: 0, y: 0 };
  private _dataAreaScrollEventSubscription: Subscription;
  private _hideFullscreenImageSubscription: Subscription;
  private _previousMouseHoverState: { forceViewMouseHover: boolean, forceViewAnnotationsMouseHover: boolean } = null;
  private _retryAdjustSvgOverlay: Subject<void> = new Subject();
  private _activeOffcanvas: NgbOffcanvasRef;

  constructor(
    public readonly store$: Store<MainState>,
    private readonly actions$: Actions,
    public readonly deviceService: DeviceService,
    public readonly imageService: ImageService,
    public readonly jsonApiService: JsonApiService,
    @Inject(PLATFORM_ID) public readonly platformId: Record<string, unknown>,
    public readonly domSanitizer: DomSanitizer,
    public readonly windowRefService: WindowRefService,
    public readonly utilsService: UtilsService,
    public readonly http: HttpClient,
    public readonly translateService: TranslateService,
    public readonly location: Location,
    public readonly titleService: TitleService,
    public readonly renderer: Renderer2,
    public readonly lightbox: Lightbox,
    public readonly lightboxEvent: LightboxEvent,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly activatedRoute: ActivatedRoute,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly imageViewerService: ImageViewerService,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly modalService: NgbModal,
    public readonly solutionApiService: SolutionApiService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly cookieService: CookieService,
    public readonly searchService: SearchService,
    public readonly contentTranslateService: ContentTranslateService,
    public readonly elementRef: ElementRef,
    public readonly coordinatesFormatterService: CoordinatesFormatterService
  ) {
    super(store$);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  @HostBinding("id")
  get id() {
    return this.image ? `image-viewer-${this.image.hash || this.image.pk}` : null;
  }

  @HostBinding("class.standalone")
  get isStandalone() {
    return this.standalone;
  }
  
  @HostBinding("class.has-saved-annotations")
  get hostHasSavedAnnotations() {
    return this.hasSavedAnnotations;
  }
  
  @HostBinding("class.has-url-annotations")
  get hostHasUrlAnnotations() {
    return this.hasUrlAnnotations;
  }

  ngOnInit(): void {
    this._initImageAlias();
    this._initContentTypes();
    this._initCurrentUserIsImageOwner();

    // Check if URL has annotations parameter
    if (this.isBrowser) {
      const urlParams = new URL(this.windowRefService.nativeWindow.location.href).searchParams;
      if (urlParams.has('annotations')) {
        // Set URL annotations flag
        this.hasUrlAnnotations = true;
        
        // Auto-enable annotation mode when URL has annotations
        this.isAnnotationMode = true;
        this.forceViewAnnotationsMouseHover = true;
        this.forceViewMouseHover = true;
        
        console.log('URL has annotations, enabling annotations with hasUrlAnnotations =', this.hasUrlAnnotations);
      }
    }

    this.offcanvasService.activeInstance.pipe(takeUntil(this.destroyed$)).subscribe(activeOffcanvas => {
      this._activeOffcanvas = activeOffcanvas;
    });

    // Subscribe to the HIDE_FULLSCREEN_IMAGE action to update our local state
    this._hideFullscreenImageSubscription = this.actions$.pipe(
      ofType(AppActionTypes.HIDE_FULLSCREEN_IMAGE),
      takeUntil(this.destroyed$)
    ).subscribe(() => {
      this.viewingFullscreenImage = false;
      
      // Get the latest image data from the store
      this.store$.pipe(
        select(selectImage, this.image.pk),
        filter(image => !!image),
        take(1)
      ).subscribe((updatedImage: ImageInterface) => {
        // Update the local image reference with the latest from the store
        this.image = { ...updatedImage };
        
        // Refresh the revision with the latest data
        this.revision = this.imageService.getRevision(this.image, this.revisionLabel);
        
        // Check for saved annotations again as they may have been updated in fullscreen
        this._checkForSavedAnnotations();
        
        this.changeDetectorRef.markForCheck();
      });
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.active) {
      this._recordHit();
      this._adjustSvgOverlay();

      this.adDisplayed = false;

      if (this.adManagerComponent) {
        this.adManagerComponent.destroyAd().then(() => {
          this._setAd();
        });
      } else {
        this._setAd();
      }
    }

    if (changes.image && changes.image.currentValue) {
      this.setImage(this.image, this.revisionLabel);
      this.initialized.emit();
    }
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      merge(
        this._retryAdjustSvgOverlay.pipe(
          delay(100),
          takeUntil(this.destroyed$)
        ),
        fromEvent(this.windowRefService.nativeWindow, "resize").pipe(
          auditTime(300),
          takeUntil(this.destroyed$)
        )
      ).subscribe(() => {
        this._initImageAlias();
        this._adjustSvgOverlay();

        // Update moon scale if it's visible
        if (this.showMoonOverlay) {
          this._updateMoonScale();
        }

        if (this.adManagerComponent) {
          this._setAd();
        }

        if (this._dataAreaScrollEventSubscription) {
          this._dataAreaScrollEventSubscription.unsubscribe();
          this._initDataAreaScrollHandling();
        }

        this.changeDetectorRef.markForCheck();
      });

      // Check for the fullscreen viewer and subscribe to its events
      this.utilsService.delay(100).subscribe(() => {
        if (this.fullscreenViewer) {
          this.fullscreenViewer.exitFullscreen.subscribe(() => {
            this.exitFullscreen();
          });
        }
      });
    }

    this.changeDetectorRef.detectChanges();
  }

  ngAfterViewChecked() {
    if (this.mainArea && this.dataArea && !this._dataAreaScrollEventSubscription) {
      this._initDataAreaScrollHandling();
    }
  }

  ngOnDestroy() {
    if (this._dataAreaScrollEventSubscription) {
      this._dataAreaScrollEventSubscription.unsubscribe();
    }

    if (this._hideFullscreenImageSubscription) {
      this._hideFullscreenImageSubscription.unsubscribe();
    }

    if (this.adManagerComponent) {
      this.adManagerComponent.destroyAd();
    }

    super.ngOnDestroy();
  }

  @HostListener("window:popstate", ["$event"])
  onPopState(event: PopStateEvent) {
    if (this.standalone && this.viewingFullscreenImage) {
      event.preventDefault();
      this.exitFullscreen();
    }
  }

  @HostListener("document:keydown.escape", ["$event"])
  handleEscapeKey(event: KeyboardEvent) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (!this.active) {
      return;
    }

    if (this.viewingFullscreenImage) {
      // We don't need to do anything here - the FullscreenImageViewerComponent
      // will handle ESC key and emit exitFullscreen event back to us
      return;
    }

    if (this.adjustmentEditorVisible) {
      this.adjustmentEditorVisible = false;
      return;
    }
    
    if (this.isAnnotationMode && !this.annotationReadOnlyMode) {
      // Only exit annotation mode when not in read-only mode
      this.onExitAnnotationMode();
      return;
    }

    if (this._activeOffcanvas) {
      this._activeOffcanvas.dismiss();
      return;
    }

    if (this.modalService.hasOpenModals()) {
      this.modalService.dismissAll();
      return;
    }

    this.popNotificationsService.clear();

    // Reset moon overlay when closing with ESC
    this.resetMoonOverlay();

    if (this.isLightBoxOpen) {
      return;
    }

    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      (event.target as HTMLElement).classList.contains("cke_wysiwyg_div")
    ) {
      const modal: NgbModalRef = this.modalService.open(ConfirmationDialogComponent);
      const instance: ConfirmationDialogComponent = modal.componentInstance;
      instance.message = this.translateService.instant("It looks like you are editing text. Are you sure you want to close this window?");
      instance.confirmLabel = this.translateService.instant("Yes, close");
      instance.showAreYouSure = false;

      modal.closed.subscribe(() => {
        this.closeClick.emit();
      });

      return;
    }

    this.closeClick.emit();
  }

  @HostListener("document:keyup.arrowRight", ["$event"])
  onArrowRight(event: KeyboardEvent | MouseEvent | null): any {
    if (event && event instanceof KeyboardEvent && this._ignoreNavigationEvent(event)) {
      return true;
    }

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Reset moon overlay state before navigation
    this.resetMoonOverlay();

    this.nextClick.emit();
  }

  @HostListener("document:keyup.arrowLeft", ["$event"])
  onArrowLeft(event: KeyboardEvent | MouseEvent | null): any {
    if (event && event instanceof KeyboardEvent && this._ignoreNavigationEvent(event)) {
      return true;
    }

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Reset moon overlay state before navigation
    this.resetMoonOverlay();

    this.previousClick.emit();
  }

  @HostListener("document:keydown.a", ["$event"])
  onAKeyDown(event: KeyboardEvent): any {
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      (event.target instanceof HTMLDivElement && event.target.hasAttribute("contenteditable"))
    ) {
      return;
    }

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Don't do anything if annotation mode is active
    if (this.isAnnotationMode) return;

    this.onToggleAnnotationsOnMouseHoverEnter();
    this._onMouseHoverSvgLoad();
  }

  @HostListener("document:keyup.a", ["$event"])
  onAKeyUp(event: KeyboardEvent): any {
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      (event.target instanceof HTMLDivElement && event.target.hasAttribute("contenteditable"))
    ) {
      return;
    }

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Don't do anything if annotation mode is active
    if (this.isAnnotationMode) return;

    this.onToggleAnnotationsOnMouseHoverLeave();
  }

  @HostListener("document:keydown.m", ["$event"])
  onMKeyDown(event: KeyboardEvent): any {
    // Don't interfere with input fields
    if (
      !this.active ||
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      (event.target instanceof HTMLDivElement && event.target.hasAttribute("contenteditable"))
    ) {
      return;
    }

    if (this.viewingFullscreenImage) {
      return;
    }

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Only toggle if the image has a solution with pixscale
    if (this.revision?.solution?.pixscale) {
      this.toggleMoonOverlay();
    }
  }

  setImage(
    image: ImageInterface,
    revisionLabel: ImageRevisionInterface["label"]
  ): void {
    this._scrollToTop();

    this.imageService.removeInvalidImageNotification();
    this.imageObjectLoaded = true;
    this.imageFileLoaded = false;
    this.image = image;

    // Reset moon overlay state when loading a new image
    this.resetMoonOverlay();
    this.revisionLabel = this.imageService.validateRevisionLabel(this.image, revisionLabel);


    this._initSearchModel();
    this._initAdjustmentEditor();
    this._initRevision();
    this._updateSupportsFullscreen();
    this._initAutoOpenFullscreen();
    this._setNonSolutionMouseHoverImage();
    this._setSolutionMouseHoverImage();
    this._setShowPlateSolvingBanner();
    this._replaceIdWithHash();
    this._checkForCachedTranslation();
    
    // Check if we should auto-enter annotation mode
    this._checkAndShowAnnotations();
    
    // Check if the image has saved annotations
    this._checkForSavedAnnotations();

    // Proactively preload the moon image if this is a plate-solved image
    if (this.revision?.solution?.pixscale) {
      this._preloadMoonImage();
    }

    // Updates to the current image.
    this.store$.pipe(
      select(selectImage, image.pk),
      filter(image => !!image),
      takeUntil(this.destroyed$)
    ).subscribe((image: ImageInterface) => {
      this.image = { ...image };
      this.revision = this.imageService.getRevision(this.image, this.revisionLabel);
      this._setNonSolutionMouseHoverImage();
      this._setSolutionMouseHoverImage();
      this.changeDetectorRef.markForCheck();
    });

    this.changeDetectorRef.detectChanges();
  }

  onToggleAnnotationsOnMouseHoverEnter(): void {
    // Always enable forced view for URL annotations
    this.forceViewAnnotationsMouseHover = true;
    this.forceViewMouseHover = true;
    this._onMouseHoverSvgLoad();
  }

  onToggleAnnotationsOnMouseHoverLeave(): void {
    // If we have URL annotations, don't disable the forced view on mouse leave
    if (!this.hasUrlAnnotations) {
      this.forceViewAnnotationsMouseHover = false;
      this.forceViewMouseHover = false;
    }
  }

  // Mobile menu event handlers
  protected onMobileMenuOpen(): void {
    // No special handling needed when menu opens
  }

  protected onMobileMenuClose(): void {
    // No special handling needed when menu closes
  }

  protected onImageLoaded(): void {
    this.imageFileLoaded = true;
    
    // Get image element for annotation tool when the image is loaded
    if (this.isBrowser && this.imageArea) {
      const imgElement = this.imageArea.nativeElement.querySelector('.image-area astrobin-image img');
      if (imgElement) {
        this.imageElementForAnnotation = imgElement;
        
        // Check if we should activate annotation mode now that the image is loaded
        if (!this.isAnnotationMode) {
          // Check for annotations in URL
          const hasAnnotationsInUrl = new URL(this.windowRefService.nativeWindow.location.href).searchParams.has('annotations');
          
          // Update the URL annotations flag
          this.hasUrlAnnotations = hasAnnotationsInUrl;
          
          // Check for annotations in revision
          const hasAnnotationsInRevision = this.revision && !!this.revision.annotations && 
            this.revision.annotations.trim() !== '' && this.revision.annotations !== '[]';
            
          if (hasAnnotationsInUrl || hasAnnotationsInRevision) {
            console.log("Enabling annotation mode on image load - found annotations in", 
              hasAnnotationsInUrl ? "URL" : "revision");
            
            if (hasAnnotationsInUrl) {
              // For URL annotations, keep them always visible
              this.forceViewAnnotationsMouseHover = true;
              this.forceViewMouseHover = true;
              this.hasUrlAnnotations = true; // Ensure this flag is set
              
              // Force an immediate change detection to apply styles quickly
              setTimeout(() => {
                // Add class directly to host elements
                if (this.elementRef?.nativeElement) {
                  this.elementRef.nativeElement.classList.add('has-url-annotations');
                }
                
                if (this.imageArea?.nativeElement) {
                  this.imageArea.nativeElement.classList.add('has-url-annotations');
                }
                
                this.changeDetectorRef.markForCheck();
              }, 0);
            } else {
              // For saved annotations, use standard behavior with mouse hover
              this._previousMouseHoverState = {
                forceViewMouseHover: this.forceViewMouseHover,
                forceViewAnnotationsMouseHover: this.forceViewAnnotationsMouseHover
              };
              
              // Disable mouse hover features
              this.forceViewMouseHover = false;
              this.forceViewAnnotationsMouseHover = false;
            }
            
            // Enter annotation mode
            this.isAnnotationMode = true;
            this.changeDetectorRef.markForCheck();
          }
        }
      }
    }
  }

  protected onImageMouseEnter(event: MouseEvent): void {
    event.preventDefault();

    // Skip mouse hover effects in touch mode or if annotation mode is active
    if ((this.deviceService.isTouchEnabled() && !this.deviceService.isHybridPC()) || this.isAnnotationMode) {
      return;
    }

    if (
      this.revision.mouseHoverImage !== MouseHoverImageOptions.NOTHING &&
      (
        this.revision.mouseHoverImage !== MouseHoverImageOptions.SOLUTION ||
        (
          this.revision.mouseHoverImage === MouseHoverImageOptions.SOLUTION &&
          this.imageViewerService.showAnnotationsOnMouseHover
        )
      )
    ) {
      this.imageArea.nativeElement.classList.add("hover");
    }
  }

  protected onSolutionChange(solution: SolutionInterface) {
    if (solution) {
      this.revision.solution = solution;
      this._setSolutionMouseHoverImage();

      // Preload moon image if solution has pixscale (means it was successful)
      if (solution.pixscale) {
        this._preloadMoonImage();
      }
    }
  }

  protected onImageMouseLeave(event: MouseEvent): void {
    event.preventDefault();
    this.imageArea.nativeElement.classList.remove("hover");
  }

  @Throttle(20)
  protected onSvgMouseMove(event: MouseEvent): void {
    if (!this.advancedSolutionMatrix || !this.advancedSolutionMatrix.raMatrix) {
      // Matrix not loaded yet, can't calculate coordinates
      return;
    }

    if (this.loadingAdvancedSolutionMatrix || this.isAnnotationMode) {
      // Skip if still loading or if annotation mode is active
      return;
    }

    const imageElement = this.imageArea.nativeElement.querySelector("astrobin-image img");

    if (!imageElement) {
      return;
    }

    // Use the shared service to calculate and format the coordinates
    const result = this.coordinatesFormatterService.calculateMouseCoordinates(
      event,
      imageElement,
      this.advancedSolutionMatrix
    );

    if (!result) {
      return;
    }

    // Set the formatted coordinates and positions
    this.mouseHoverRa = result.coordinates.raHtml;
    this.mouseHoverDec = result.coordinates.decHtml;
    this.mouseHoverGalacticRa = result.coordinates.galacticRaHtml;
    this.mouseHoverGalacticDec = result.coordinates.galacticDecHtml;
    this.mouseHoverX = result.x;
    this.mouseHoverY = result.y;
  }

  protected onRevisionSelected(revisionLabel: ImageRevisionInterface["label"], pushState: boolean): void {
    if (this.revisionLabel === revisionLabel) {
      return;
    }

    this.revisionLabel = revisionLabel;

    if (pushState) {
      let url = this.location.path();
      url = UtilsService.addOrUpdateUrlParam(url, "r", revisionLabel);
      this.windowRefService.pushState(
        {
          imageId: this.image.hash || this.image.pk,
          revisionLabel
        },
        url
      );
    }

    // Turn off the moon scale overlay when changing revisions
    if (this.showMoonOverlay) {
      this.resetMoonOverlay();
    }

    // Clear any preloaded moon image
    this._preloadedMoonImage = null;

    // Clear the current solution matrix to force a reload for the new revision
    this.advancedSolutionMatrix = null;
    this.loadingAdvancedSolutionMatrix = false;

    this.revision = this.imageService.getRevision(this.image, this.revisionLabel);
    this._setNonSolutionMouseHoverImage();
    this._setSolutionMouseHoverImage();
    this._setShowPlateSolvingBanner();
    this._updateNorthArrowRotation();
    
    // Check if the new revision has saved annotations
    this._checkForSavedAnnotations();
    
    // Reset annotation mode when switching revisions to avoid showing wrong annotations
    if (this.isAnnotationMode) {
      this.onExitAnnotationMode();
    }

    // Preload moon image for the new revision if it has a solution
    if (this.revision?.solution?.pixscale) {
      this._preloadMoonImage();
    }

    this.revisionSelected.emit(revisionLabel);
  }

  protected toggleViewMouseHover(): void {
    this.forceViewMouseHover = !this.forceViewMouseHover;
    this.showNorthArrow = this.forceViewMouseHover;
  }

  protected resetMoonOverlay(): void {
    this.showMoonOverlay = false;
    this.moonScaleDiameter = 0;
    this.moonPosition = { x: 50, y: 50 }; // Reset position to center
    this.isMoonImageLoaded = false; // Reset image loaded state
    this.changeDetectorRef.markForCheck();
  }

  protected onMoonDragStart(event: PointerEvent): void {
    // First, make sure this is actually our drag event and not a click on a button
    if (event.target instanceof HTMLButtonElement ||
      (event.target instanceof HTMLElement && event.target.closest("button"))) {
      return;
    }

    // Prevent default and stop propagation
    event.preventDefault();
    event.stopPropagation();

    // Critical for pointer events: capture the pointer to receive all events
    // even if the pointer moves outside the element
    if (event.target instanceof HTMLElement) {
      try {
        event.target.setPointerCapture(event.pointerId);
      } catch (e) {
        console.warn("Failed to set pointer capture:", e);
      }
    }

    // Set swipe-down prevention immediately
    if (this.isBrowser) {
      // Add pointer event listeners directly to document
      document.addEventListener("pointermove", this._handlePointerMove);
      document.addEventListener("pointerup", this._handlePointerUp);
      document.addEventListener("pointercancel", this._handlePointerUp);

      // Change cursor
      document.body.style.cursor = "grabbing";
    }

    this.isDraggingMoon = true;

    // Store initial pointer position
    const initialX = event.pageX;
    const initialY = event.pageY;

    // Get the current moon center position in pixels
    const containerWidth = this.imageArea.nativeElement.clientWidth;
    const containerHeight = this.imageArea.nativeElement.clientHeight;
    const moonCenterX = (this.moonPosition.x / 100) * containerWidth;
    const moonCenterY = (this.moonPosition.y / 100) * containerHeight;

    // Calculate offset between pointer position and moon center
    this._moonStartDragPosition = {
      x: initialX - moonCenterX,
      y: initialY - moonCenterY
    };

    this.changeDetectorRef.markForCheck();
  }

  protected onMoonDrag(event: PointerEvent): void {
    if (!this.isDraggingMoon) {
      return;
    }

    // For pointer events, always prevent default and stop propagation
    event.preventDefault();
    event.stopPropagation();

    // Get current pointer coordinates
    const pageX = event.pageX;
    const pageY = event.pageY;

    // Calculate new position as percentage of container
    const containerWidth = this.imageArea.nativeElement.clientWidth;
    const containerHeight = this.imageArea.nativeElement.clientHeight;

    // Calculate the moon center position based on the current pointer position
    // and the original offset between pointer and moon center
    const moonCenterX = pageX - this._moonStartDragPosition.x;
    const moonCenterY = pageY - this._moonStartDragPosition.y;

    // Convert to percentage of container
    const newX = (moonCenterX / containerWidth) * 100;
    const newY = (moonCenterY / containerHeight) * 100;

    // Clamp values between 0-100%
    this.moonPosition = {
      x: Math.min(Math.max(newX, 0), 100),
      y: Math.min(Math.max(newY, 0), 100)
    };

    this.changeDetectorRef.markForCheck();
  }

  protected onMoonDragEnd(): void {
    this.isDraggingMoon = false;
    this.changeDetectorRef.markForCheck();
  }

  protected onMoonImageLoaded(): void {
    this.isMoonImageLoaded = true;
    this.changeDetectorRef.markForCheck();
  }

  protected toggleMoonOverlay(): void {
    this.showMoonOverlay = !this.showMoonOverlay;

    if (this.showMoonOverlay) {
      this._updateMoonScale();

      // Check if we have a preloaded image that matches our source
      if (this._preloadedMoonImage && this._preloadedMoonImage.src === this.moonImageSrc && this._preloadedMoonImage.complete) {
        // Use the preloaded image - immediately mark as loaded
        this.isMoonImageLoaded = true;
      } else {
        // Reset loading state when showing - the image will trigger onload when it's ready
        this.isMoonImageLoaded = false;

        // Try preloading again if needed
        if (!this._preloadedMoonImage) {
          this._preloadMoonImage();
        }
      }
    } else {
      // Make sure to reset the size and loading state when hiding
      this.moonScaleDiameter = 0;
      this.isMoonImageLoaded = false;
    }

    this.changeDetectorRef.markForCheck();
  }

  protected enterFullscreen(
    event: MouseEvent | TouchEvent | null, 
    options: { activateMeasurementTool?: boolean } = {}
  ): void {
    if (event) {
      event.preventDefault();
    }

    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (this.supportsFullscreen) {
        // Check if this is a GIF file and the device uses touch
        const isGif = this.revision.imageFile && this.revision.imageFile.toLowerCase().endsWith(".gif");
        if (isGif && this.deviceService.isTouchEnabled() && !this.deviceService.isHybridPC()) {
          this.popNotificationsService.warning(
            this.translateService.instant("Sorry, zooming on GIF animations is not available on touch devices.")
          );
          return;
        }

        const limit = this.image.fullSizeDisplayLimitation;
        const allowReal = (
          limit === FullSizeLimitationDisplayOptions.EVERYBODY ||
          (limit === FullSizeLimitationDisplayOptions.MEMBERS && !!user) ||
          (limit === FullSizeLimitationDisplayOptions.PAYING && !!user && !!user.validSubscription) ||
          (limit === FullSizeLimitationDisplayOptions.ME && !!user && user.id === this.image.user)
        );

        // Pass the loaded matrix to the fullscreen component to avoid race conditions
        const solutionMatrixToPass = this.loadingAdvancedSolutionMatrix ? null : this.advancedSolutionMatrix;

        // Check if the annotation button was clicked
        let enableAnnotations = false;
        if (event instanceof MouseEvent) {
          const target = event.target as HTMLElement;
          const annotationButton = target.closest('.annotation-mode-button');
          if (annotationButton) {
            enableAnnotations = true;
          }
        }

        // Show a notification if zoom is disabled
        if (!allowReal) {
          this.popNotificationsService.info(
            this.translateService.instant("Zoom disabled by the image owner.")
          );
        }

        this.store$.dispatch(new ShowFullscreenImage({
          imageId: this.image.pk,
          event,
          externalSolutionMatrix: solutionMatrixToPass,
          enableAnnotations, // Add this flag to the payload
          allowZoom: allowReal // Pass zoom permission flag
        }));
        this.viewingFullscreenImage = true;

        // Reset moon overlay state when entering fullscreen
        this.resetMoonOverlay();

        this.changeDetectorRef.markForCheck();
        this.toggleFullscreen.emit(true);

        if (this.isBrowser) {
          // Add fullscreen to the URL
          const location_ = this.windowRefService.nativeWindow.location;
          
          // Create URL for fullscreen, optionally adding the measurements parameter
          let fullscreenUrl = `${location_.pathname}${location_.search}`;
          
          // If we should activate the measurement tool, add 'measurements=1' to URL
          if (options.activateMeasurementTool) {
            const urlObj = new URL(location_.href);
            urlObj.searchParams.set('measurements', '1');
            fullscreenUrl = `${urlObj.pathname}${urlObj.search}`;
          }
          
          // Add the fullscreen hash
          fullscreenUrl += '#fullscreen';
          
          this.windowRefService.pushState(
            {
              imageId: this.image.hash || this.image.pk,
              revisionLabel: this.revisionLabel,
              fullscreen: true,
              measurementTool: options.activateMeasurementTool || false
            },
            fullscreenUrl
          );
        }
      }
    });
  }

  // Removed unnecessary wrapper method

  public exitFullscreen(): void {
    this.store$.dispatch(new HideFullscreenImage());
    this.viewingFullscreenImage = false;
    this.toggleFullscreen.emit(false);

    // Check for saved annotations again as they may have been updated in fullscreen
    this._checkForSavedAnnotations();

    if (this.isBrowser) {
      const location_ = this.windowRefService.nativeWindow.location;
      this.windowRefService.replaceState(
        {},
        `${location_.pathname}${location_.search}`
      );
    }
  }

  protected onDescriptionClicked(event: MouseEvent) {
    if (this.isLightBoxOpen) {
      return;
    }

    const target = event.target as HTMLElement;

    // Check if the clicked element is an image with the data-src attribute
    if (target.tagName === "IMG" && target.getAttribute("data-src")) {
      // Check if the parent element is not an anchor tag
      const parentElement = target.parentElement;

      if (parentElement && parentElement.tagName !== "A") {
        const src = target.getAttribute("data-src");
        const thumb = target.getAttribute("src");
        const lightBoxEventSubscription = this.lightboxEvent.lightboxEvent$.subscribe((lightBoxEvent: any) => {
          if (lightBoxEvent.id === LIGHTBOX_EVENT.CLOSE) {
            this.isLightBoxOpen = false;
            lightBoxEventSubscription.unsubscribe();
            this.changeDetectorRef.markForCheck();
          }
        });

        this.isLightBoxOpen = true;
        this.lightbox.open([{ src, thumb }], 0);
      }
    }
  }

  protected onTranslateDescriptionClicked(event: Event): void {
    event.preventDefault();

    let scrollPosition: number;

    if (this.isBrowser) {
      scrollPosition = this.dataArea.nativeElement.scrollTop;
    }

    this.translatingDescription = true;

    const imageId = this.image.hash || this.image.pk.toString();

    // Check if we already have a cached translation
    const isTranslated = this.contentTranslateService.hasTranslation("image-description", imageId);
    if (isTranslated) {
      this._loadTranslatedDescription(scrollPosition);
      return;
    }

    // Determine format based on what's available
    const format = !!this.image.descriptionBbcode ? "bbcode" : "html";
    const text = this.image.descriptionBbcode || this.image.description;

    // Get translation through service
    this.contentTranslateService
      .translate({
        text,
        sourceLanguage: this.image.detectedLanguage,
        format,
        itemType: "image-description",
        itemId: imageId
      })
      .subscribe(
        translatedHtml => {
          this.translatingDescription = false;
          this.translatedDescription = translatedHtml;

          if (scrollPosition) {
            this.dataArea.nativeElement.scrollTop = scrollPosition;
          }

          this.changeDetectorRef.markForCheck();
        },
        error => {
          this.translatingDescription = false;
          this.translatedDescription = null;
          this.changeDetectorRef.markForCheck();
        }
      );
  }

  protected onSeeOriginalDescriptionClicked(event: Event): void {
    event.preventDefault();
    this.translatingDescription = false;
    this.translatedDescription = null;

    // Clear the cached translation
    const imageId = this.image.hash || this.image.pk.toString();
    this.contentTranslateService.clearTranslation("image-description", imageId);
  }

  // Preload moon image in memory
  private _preloadMoonImage(): void {
    // Limit the number of retry attempts to avoid infinite recursion
    const MAX_ATTEMPTS = 5;
    if (this._preloadMoonImageAttemptCount >= MAX_ATTEMPTS) {
      this._preloadMoonImageAttemptCount = 0;
      return;
    }

    this._preloadMoonImageAttemptCount++;

    if (!this.isBrowser || !this.revision?.solution?.pixscale) {
      this._preloadMoonImageAttemptCount = 0;
      return;
    }

    // If imageArea is not available yet, wait for AfterViewInit
    if (!this.imageArea) {
      // Schedule preloading after view initialization
      this.utilsService.delay(300).pipe(take(1)).subscribe(() => {
        this._preloadMoonImage();
      });
      return;
    }

    // Get the image element to ensure it's loaded
    const imageElement = this.imageArea.nativeElement.querySelector("astrobin-image img");
    if (!imageElement || !imageElement.complete) {
      // If image isn't fully loaded yet, wait a bit longer
      this.utilsService.delay(500).pipe(take(1)).subscribe(() => {
        this._preloadMoonImage();
      });
      return;
    }

    // Calculate the moon size even though we're not showing it yet
    const moonDiameter = this._calculateMoonScaleDiameter();
    if (moonDiameter <= 0) {
      // If calculation fails, try again after a delay
      this.utilsService.delay(500).pipe(take(1)).subscribe(() => {
        this._preloadMoonImage();
      });
      return;
    }

    // Get the appropriate image source
    const imageSrc = this._getMoonImageSrc(moonDiameter);

    // Create and load the image in the background
    this._preloadedMoonImage = new Image();

    // Set up error handler
    this._preloadedMoonImage.onerror = () => {
      console.error("Failed to preload moon image:", imageSrc);
      this._preloadedMoonImage = null;
    };

    // Start loading the image
    this._preloadedMoonImage.src = imageSrc;

    // Save the source for immediate use later
    this.moonImageSrc = imageSrc;

    // Reset attempts counter on success
    this._preloadMoonImageAttemptCount = 0;
  }

  // Using arrow functions to preserve 'this' context when used as event handlers
  private _handlePointerMove = (event: PointerEvent): void => {
    if (!this.isDraggingMoon) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    // Forward to the drag handler
    this.onMoonDrag(event);
  };

  private _handlePointerUp = (event: PointerEvent): void => {
    // Clean up event listeners
    document.removeEventListener("pointermove", this._handlePointerMove);
    document.removeEventListener("pointerup", this._handlePointerUp);
    document.removeEventListener("pointercancel", this._handlePointerUp);

    // Reset cursor
    if (this.isBrowser) {
      document.body.style.cursor = "";
    }

    // End the drag operation
    this.onMoonDragEnd();
  };

  private _updateMoonScale(): void {
    this.moonScaleDiameter = this._calculateMoonScaleDiameter();

    // Only calculate the appropriate image if we don't already have a preloaded one
    if (!this.moonImageSrc || this.moonImageSrc === "/assets/images/moon-250.png?v=1") {
      this._selectAppropriateImage();
    }
  }

  private _selectAppropriateImage(): void {
    if (!this.isBrowser || !this.moonScaleDiameter) {
      return;
    }

    // Set the image source based on calculated moon diameter
    this.moonImageSrc = this._getMoonImageSrc(this.moonScaleDiameter);
  }

  private _getMoonImageSrc(diameter: number): string {
    if (!this.isBrowser || !diameter || diameter <= 0) {
      return "/assets/images/moon-250.png?v=1"; // Default fallback
    }

    // Get device pixel ratio to account for retina displays
    const pixelRatio = window.devicePixelRatio || 1;

    // Calculate the size we need based on the device pixel ratio
    const requiredSize = Math.round(diameter * pixelRatio);

    // Available moon image sizes
    const availableSizes = [125, 250, 500, 1000, 1500];

    // Find the smallest image that's at least as large as what we need
    let selectedSize = availableSizes[availableSizes.length - 1]; // Default to largest

    for (const size of availableSizes) {
      if (size >= requiredSize) {
        selectedSize = size;
        break;
      }
    }

    // Return the image source with cache-busting parameter
    return `/assets/images/moon-${selectedSize}.png?v=1`;
  }

  private _calculateMoonScaleDiameter(): number {
    if (!this.revision?.solution?.pixscale || !this.imageArea || !this.isBrowser) {
      return 0;
    }

    // Moon's angular diameter is 0.52 degrees.
    const MOON_DIAMETER_ARCSEC = .52 * 3600;

    try {
      // Get the image element
      const imageElement = this.imageArea.nativeElement.querySelector("astrobin-image img");
      if (!imageElement) {
        return 0;
      }

      // Get image dimensions
      const containerWidth = this.imageArea.nativeElement.clientWidth;
      const containerHeight = this.imageArea.nativeElement.clientHeight;
      const imagePlateWidth = this.revision.w || this.image.w;
      const imagePlateHeight = this.revision.h || this.image.h;

      if (!containerWidth || !containerHeight || !imagePlateWidth || !imagePlateHeight) {
        return 0;
      }

      // Calculate image aspect ratio
      const imageAspectRatio = imagePlateWidth / imagePlateHeight;

      // Calculate actual displayed image dimensions accounting for letterboxing
      let actualRenderedWidth, actualRenderedHeight;

      // Handle case where the image is smaller than the container
      if (imagePlateWidth <= containerWidth && imagePlateHeight <= containerHeight) {
        // Small image - use native dimensions (no upscaling)
        actualRenderedWidth = imagePlateWidth;
        actualRenderedHeight = imagePlateHeight;
      } else if (containerWidth / containerHeight > imageAspectRatio) {
        // Image is letterboxed on sides (vertical letterboxing)
        actualRenderedHeight = Math.min(containerHeight, imagePlateHeight);
        actualRenderedWidth = actualRenderedHeight * imageAspectRatio;
      } else {
        // Image is letterboxed on top/bottom (horizontal letterboxing)
        actualRenderedWidth = Math.min(containerWidth, imagePlateWidth);
        actualRenderedHeight = actualRenderedWidth / imageAspectRatio;
      }

      // Get pixscale from the solution (arcseconds per pixel)
      const pixscale = parseFloat(this.revision.solution.advancedPixscale || this.revision.solution.pixscale);
      if (!pixscale || isNaN(pixscale) || pixscale <= 0) {
        console.warn("Invalid pixscale:", pixscale);
        return 0;
      }

      // Calculate moon diameter in native image pixels
      const moonDiameterInOriginalPixels = MOON_DIAMETER_ARCSEC / pixscale;

      // Calculate what percentage of the image FOV the moon takes up
      const moonPercentageOfWidth = moonDiameterInOriginalPixels / imagePlateWidth;

      // Now apply that same percentage to the displayed image size (accounting for letterboxing)
      const moonSizeInDisplayPixels = actualRenderedWidth * moonPercentageOfWidth;

      // Return the final size, with reasonable bounds
      return moonSizeInDisplayPixels;
    } catch (error) {
      console.error("Error calculating moon scale:", error);
      return 0;
    }
  }

  private _loadTranslatedDescription(scrollPosition?: number): void {
    const imageId = this.image.hash || this.image.pk.toString();
    const format = !!this.image.descriptionBbcode ? "bbcode" : "html";
    const text = this.image.descriptionBbcode || this.image.description;

    this.contentTranslateService
      .translate({
        text,
        sourceLanguage: this.image.detectedLanguage,
        format,
        itemType: "image-description",
        itemId: imageId
      })
      .subscribe(
        translatedHtml => {
          this.translatingDescription = false;
          this.translatedDescription = translatedHtml;

          if (scrollPosition) {
            this.dataArea.nativeElement.scrollTop = scrollPosition;
          }

          this.changeDetectorRef.markForCheck();
        },
        error => {
          this.translatingDescription = false;
          this.translatedDescription = null;
          this.changeDetectorRef.markForCheck();
        }
      );
  }

  private _ignoreNavigationEvent(event: KeyboardEvent): boolean {
    return (
      !this.active ||
      this.offcanvasService.hasOpenOffcanvas() ||
      this.modalService.hasOpenModals() ||
      this.viewingFullscreenImage ||
      this.isLightBoxOpen ||
      (event && event.target instanceof HTMLInputElement) ||
      (event && event.target instanceof HTMLTextAreaElement) ||
      (event && event.target instanceof HTMLElement && event.target.classList.contains("cke_wysiwyg_div"))
    );
  }

  private _scrollToTop() {
    if (this.dataArea) {
      this.renderer.setProperty(this.dataArea.nativeElement, "scrollTop", 0);

      if (this.deviceService.mdMax()) {
        this.renderer.setProperty(this.mainArea.nativeElement, "scrollTop", 0);
      }
    }
  }

  private _setNonSolutionMouseHoverImage() {
    if (!this.revision) {
      return;
    }

    switch (this.revision.mouseHoverImage) {
      case MouseHoverImageOptions.NOTHING:
      case MouseHoverImageOptions.SOLUTION:
      case null:
        this.nonSolutionMouseHoverImage = null;
        this.inlineSvg = null;
        break;
      case MouseHoverImageOptions.INVERTED: {
        const thumbnail = this.revision.thumbnails?.find(thumbnail =>
          thumbnail.alias === this.alias + "_inverted"
        );
        this.nonSolutionMouseHoverImage = thumbnail?.url ?? null;
        this.inlineSvg = null;
      }
        break;
      case "ORIGINAL": {
        const thumbnail = this.image.thumbnails?.find(thumbnail =>
          thumbnail.alias === this.alias &&
          thumbnail.revision === (this.image.isFinal ? FINAL_REVISION_LABEL : ORIGINAL_REVISION_LABEL)
        );
        this.nonSolutionMouseHoverImage = thumbnail?.url ?? null;
        this.inlineSvg = null;
      }
        break;
      default: {
        const matchingRevision = this.image.revisions?.find(
          revision => revision.label === this.revision.mouseHoverImage.replace("REVISION__", "")
        );
        if (matchingRevision) {
          const thumbnail = matchingRevision.thumbnails?.find(
            thumbnail => thumbnail.alias === this.alias
          );
          this.nonSolutionMouseHoverImage = thumbnail?.url ?? null;
          this.inlineSvg = null;
        } else {
          this.nonSolutionMouseHoverImage = null;
          this.inlineSvg = null;
        }
      }
    }
  }

  private _setSolutionMouseHoverImage() {
    if (!this.revision) {
      return;
    }

    // Reset appropriate properties first
    this.mouseHoverRa = null;
    this.mouseHoverDec = null;
    this.mouseHoverGalacticRa = null;
    this.mouseHoverGalacticDec = null;

    if (this.revision?.solution?.pixinsightSvgAnnotationRegular) {
      // Load the SVG first
      this._loadInlineSvg$(
        environment.classicBaseUrl + `/platesolving/solution/${this.revision.solution.id}/svg/regular/`
      ).subscribe(inlineSvg => {
        this.solutionMouseHoverImage = null;
        this.inlineSvg = inlineSvg;
        this.changeDetectorRef.markForCheck();
      });

      // Then ensure we have the solution matrix - we need coordinated loading with a clear state
      this._ensureSolutionMatrixLoaded(this.revision.solution.id);
    } else if (this.revision?.solution?.imageFile) {
      this.solutionMouseHoverImage = this.revision.solution.imageFile;
      this.inlineSvg = null;

      // Even with image file, we need the matrix for coordinates
      if (this.revision.solution.id) {
        this._ensureSolutionMatrixLoaded(this.revision.solution.id);
      }
    } else {
      this.solutionMouseHoverImage = null;
      this.inlineSvg = null;
      this.advancedSolutionMatrix = null;
      this.loadingAdvancedSolutionMatrix = false;
    }
  }

  /**
   * Ensures that a solution matrix is loaded, with proper state tracking
   * This prevents race conditions between multiple components trying to load the same matrix
   */
  private _ensureSolutionMatrixLoaded(solutionId: number): void {
    // If matrix is already loaded in component, we're done
    if (this.advancedSolutionMatrix) {
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

  private _setShowPlateSolvingBanner() {
    if (!this.image) {
      this.showPlateSolvingBanner = false;
      return;
    }

    if (!this.revision) {
      this.showPlateSolvingBanner = false;
      return;
    }

    if (!this.imageService.isPlateSolvable(this.image)) {
      this.showPlateSolvingBanner = false;
      return;
    }

    if (
      !!this.revision.solution && (
        this.revision.solution.status === SolutionStatus.SUCCESS ||
        this.revision.solution.status === SolutionStatus.ADVANCED_SUCCESS ||
        this.revision.solution.status === SolutionStatus.FAILED ||
        this.revision.solution.status === SolutionStatus.ADVANCED_FAILED
      )
    ) {
      this.showPlateSolvingBanner = false;
      return;
    }

    // If the image is plate-solvable but doesn't have a solution yet, start the solver
    if (!this.revision.solution || this.revision.solution.status === SolutionStatus.MISSING) {
      this._startBasicSolver();
    }

    this.showPlateSolvingBanner = true;
  }

  private _loadInlineSvg$(svgUrl: string): Observable<SafeHtml> {
    return this.http.get(svgUrl, { responseType: "text" }).pipe(
      map(svgContent => {
        this._onMouseHoverSvgLoad();
        return this.domSanitizer.bypassSecurityTrustHtml(svgContent);
      })
    );
  }

  // Removed _loadAdvancedSolutionMatrix$ in favor of _ensureSolutionMatrixLoaded

  private _onMouseHoverSvgLoad(): void {
    if (this.isBrowser) {
      this.utilsService.delay(100).subscribe(() => {
        const _doc = this.windowRefService.nativeWindow.document;
        const svgObject = _doc.getElementById(`mouse-hover-svg-${this.image.pk}-${this.revision.pk}`) as HTMLObjectElement;

        if (svgObject) {
          const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
          const isFirefox92 = /Firefox\/92./i.test(navigator.userAgent);

          if (isSafari || isFirefox92) {
            // Remove the filter from the SVG element
            const gElements = svgObject.querySelectorAll("svg > g");
            if (gElements) {
              gElements.forEach((element: HTMLElement) => {
                element.removeAttribute("filter");
              });
            }
          }

          // Fix font path
          svgObject.innerHTML = svgObject.innerHTML.replace(
            "/media/static/astrobin/fonts/",
            "/assets/fonts/"
          );
        }

        this._adjustSvgOverlay();
        this.changeDetectorRef.markForCheck();
      });
    }
  }

  private _adjustSvgOverlay(): void {
    if (!this.isBrowser) {
      return;
    }

    if (!this.inlineSvg) {
      return;
    }

    if (!this.imageArea) {
      this._retryAdjustSvgOverlay.next();
      return;
    }

    const imageId = this.image.hash || this.image.pk;
    const imageAreaElement = this.windowRefService.nativeWindow.document.querySelector(
      `#image-viewer-${imageId} .image-area-body`
    ) as HTMLElement;

    if (!imageAreaElement) {
      this._retryAdjustSvgOverlay.next();
      return;
    }

    const overlaySvgElement = imageAreaElement.querySelector(".mouse-hover-svg-container") as HTMLElement;

    if (!overlaySvgElement) {
      this._retryAdjustSvgOverlay.next();
      return;
    }

    // Get the dimensions of the container and the image
    const containerWidth = imageAreaElement.clientWidth;
    const containerHeight = imageAreaElement.clientHeight;

    const naturalWidth = this.revision.w || this.image.w;
    const naturalHeight = this.revision.h || this.image.h;

    // Calculate the aspect ratio of the image and the container
    const imageAspectRatio = naturalWidth / naturalHeight;
    const containerAspectRatio = containerWidth / containerHeight;

    let renderedImageWidth: number, renderedImageHeight: number;

    if (imageAspectRatio > containerAspectRatio) {
      // Image is wider relative to the container, so it's constrained by the container's width
      renderedImageWidth = containerWidth;
      renderedImageHeight = containerWidth / imageAspectRatio;
    } else {
      // Image is taller relative to the container, so it's constrained by the container's height
      renderedImageWidth = containerHeight * imageAspectRatio;
      renderedImageHeight = containerHeight;
    }

    // Calculate the top and left offset to center the image within the container
    const offsetX = (containerWidth - renderedImageWidth) / 2;
    const offsetY = (containerHeight - renderedImageHeight) / 2;

    // Set the SVG overlay size and position
    overlaySvgElement.style.width = `${renderedImageWidth}px`;
    overlaySvgElement.style.height = `${renderedImageHeight}px`;
    overlaySvgElement.style.left = `${offsetX}px`;
    overlaySvgElement.style.top = `${offsetY}px`;
    overlaySvgElement.querySelector(".mouse-hover").classList.add("ready");
  }

  private _initDataAreaScrollHandling() {
    if (!this.isBrowser) {
      return;
    }

    const {
      scrollArea,
      sideToSideLayout
    } = this.imageViewerService.getScrollArea(this.image.hash || this.image.pk);
    const hasMobileMenu = this.deviceService.mdMax();

    if (!scrollArea) {
      return;
    }

    this._dataAreaScrollEventSubscription = fromEvent<Event>(scrollArea, "scroll")
      .pipe(
        throttleTime(100, animationFrameScheduler, { leading: true, trailing: true }),
        observeOn(animationFrameScheduler)
      )
      .subscribe(() => {
        this._handleFloatingTitleOnScroll(scrollArea, this.standalone, hasMobileMenu, sideToSideLayout);
        this._handleNavigationButtonsVisibility(scrollArea);
        this.changeDetectorRef.markForCheck();
      });
  }

  private _initImageAlias() {
    if (this.deviceService.lgMax()) {
      this.alias = ImageAlias.HD;
    } else if (this.deviceService.xlMin()) {
      this.alias = ImageAlias.QHD;
    }
  }

  private _initAdjustmentEditor() {
    if (!this.image) {
      return;
    }

    if (this.image.allowImageAdjustmentsWidget === false) {
      return;
    }

    if (this.image.allowImageAdjustmentsWidget === null && this.image.defaultAllowImageAdjustmentsWidget === false) {
      return;
    }

    if (
      this.activatedRoute.snapshot.queryParams["brightness"] ||
      this.activatedRoute.snapshot.queryParams["contrast"] ||
      this.activatedRoute.snapshot.queryParams["saturation"]
    ) {
      this.adjustmentEditorVisible = true;
    }
  }

  private _initCurrentUserIsImageOwner() {
    this.currentUser$.pipe(
      filter(user => !!user),
      takeUntil(this.destroyed$)
    ).subscribe(user => {
      if (this.image && user) {
        this.currentUserIsImageOwner = user.id === this.image.user;
        this.changeDetectorRef.markForCheck();
      }
    });
  }
  
  /**
   * Utility method to set UI element hover state
   * Used by child components to indicate when mouse is over UI elements
   */
  protected setMouseOverUIElement(value: boolean): void {
    this.isMouseOverUIElement = value;
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Handle N keypress or button click for annotations
   */
  @HostListener("window:keyup.n", ["$event"])
  enterFullscreenWithMeasurementTool(event: MouseEvent): void {
    if (!this.isBrowser) {
      return;
    }
    
    // Prevent default behavior
    event.preventDefault();
    event.stopPropagation();
    
    // Enter fullscreen with measurement tool activated
    this.enterFullscreen(event, { activateMeasurementTool: true });
  }

  toggleAnnotationMode(event: KeyboardEvent | MouseEvent): void {
    if (!this.isBrowser) {
      return;
    }

    // Don't interfere with input fields if this is a keyboard event
    if (event instanceof KeyboardEvent) {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLDivElement && event.target.hasAttribute("contenteditable"))
      ) {
        return;
      }
    }

    // Do nothing if the component is not active or if the revision is a video file
    if (!this.active || (this.revision && this.revision.videoFile)) {
      return;
    }

    if (event) {
      event.preventDefault();
      if (event instanceof MouseEvent) {
        event.stopPropagation();
      }
    }

    // For button click (MouseEvent), we use our enterFullscreen logic which handles enabling annotations
    if (event instanceof MouseEvent) {
      this.enterFullscreen(event);
      return;
    }

    // For keyboard press (N key), toggle view mode only (always read-only)
    // Store the previous state to restore later
    if (!this.isAnnotationMode) {
      this._previousMouseHoverState = {
        forceViewMouseHover: this.forceViewMouseHover,
        forceViewAnnotationsMouseHover: this.forceViewAnnotationsMouseHover
      };
      
      // Disable mouse hover while in annotation mode
      this.forceViewMouseHover = false;
      this.forceViewAnnotationsMouseHover = false;
    } else {
      // Restore previous mouse-hover state when exiting annotation mode
      if (this._previousMouseHoverState) {
        this.forceViewMouseHover = this._previousMouseHoverState.forceViewMouseHover;
        this.forceViewAnnotationsMouseHover = this._previousMouseHoverState.forceViewAnnotationsMouseHover;
      }
    }
    
    // Toggle annotation mode (always read-only)
    this.isAnnotationMode = !this.isAnnotationMode;
    this.annotationReadOnlyMode = true; // Always read-only in regular view
    
    // Force change detection
    this.changeDetectorRef.markForCheck();
  }
  
  /**
   * Handle exiting annotation mode - when exiting, the annotations are cleared
   * from the URL, and the tool emits this event to indicate it's done
   */
  onExitAnnotationMode(): void {
    // Set annotation mode to false
    this.isAnnotationMode = false;
    
    // Reset to read-only mode for next time
    this.annotationReadOnlyMode = true;
    
    // Restore previous mouse-hover state when exiting annotation mode
    if (this._previousMouseHoverState) {
      this.forceViewMouseHover = this._previousMouseHoverState.forceViewMouseHover;
      this.forceViewAnnotationsMouseHover = this._previousMouseHoverState.forceViewAnnotationsMouseHover;
      this._previousMouseHoverState = null;
    }
    
    // Check if the URL still has annotations
    if (this.isBrowser) {
      const currentUrl = new URL(this.windowRefService.nativeWindow.location.href);
      if (!currentUrl.searchParams.has('annotations')) {
        // URL no longer has annotations, so clear the flag
        this.hasUrlAnnotations = false;
      }
    }
    
    // Check for saved annotations again to properly update the state
    this._checkForSavedAnnotations();
    
    // Force change detection to update the DOM
    this.changeDetectorRef.markForCheck();
  }
  
  /**
   * Toggle annotation edit mode between read-only and editable
   */
  toggleAnnotationEditMode(): void {
    if (!this.isAnnotationMode) {
      return;
    }
    
    this.annotationReadOnlyMode = !this.annotationReadOnlyMode;
    this.changeDetectorRef.markForCheck();
  }

  private _initAutoOpenFullscreen() {
    if (this.isBrowser) {
      const hash = this.windowRefService.nativeWindow.location.hash;
      if (hash === "#fullscreen") {
        this.enterFullscreen(null);
      }
    }
  }

  private _initContentTypes() {
    this.store$.pipe(
      select(selectContentType, { appLabel: "astrobin", model: "image" }),
      filter(contentType => !!contentType),
      take(1)
    ).subscribe(contentType => {
      this.imageContentType = contentType;
      this.changeDetectorRef.markForCheck();
    });

    this.store$.pipe(
      select(selectContentType, { appLabel: "astrobin", model: "imagerevision" }),
      filter(contentType => !!contentType),
      take(1)
    ).subscribe(contentType => {
      this.revisionContentType = contentType;
      this.changeDetectorRef.markForCheck();
    });

    this.store$.pipe(
      select(selectContentType, { appLabel: "auth", model: "user" }),
      filter(contentType => !!contentType),
      take(1)
    ).subscribe(contentType => {
      this.userContentType = contentType;
      this.changeDetectorRef.markForCheck();
    });

    this.store$.dispatch(new LoadContentType({
      appLabel: "astrobin",
      model: "image"
    }));

    this.store$.dispatch(new LoadContentType({
      appLabel: "astrobin",
      model: "imagerevision"
    }));

    this.store$.dispatch(new LoadContentType({
      appLabel: "auth",
      model: "user"
    }));
  }

  private _initSearchModel() {
    if (!this.isBrowser) {
      return;
    }

    const currentUrl = this.windowRefService.getCurrentUrl();
    const p = UtilsService.getUrlParam(currentUrl.toString(), "p");
    if (p) {
      this.searchModel = this.searchService.paramsToModel(p);
    }
  }

  private _initRevision() {
    if (this.revisionLabel === ORIGINAL_REVISION_LABEL) {
      this.revision = this.image;
      this.onRevisionSelected(ORIGINAL_REVISION_LABEL, false);
    } else if (this.revisionLabel === FINAL_REVISION_LABEL || this.revisionLabel === null || this.revisionLabel === undefined) {
      this.revision = this.imageService.getFinalRevision(this.image);
      this.onRevisionSelected(FINAL_REVISION_LABEL, false);
    } else {
      this.revision = this.imageService.getRevision(this.image, this.revisionLabel);
      this.onRevisionSelected((this.revision as ImageRevisionInterface).label, false);
    }

    this._updateNorthArrowRotation();
    
    // Check for saved annotations after initializing the revision
    this._checkForSavedAnnotations();
  }

  private _updateNorthArrowRotation(): void {
    if (this.revision?.solution) {
      this.northArrowRotation = this.imageService.calculateCorrectOrientation(this.revision.solution);
    } else {
      this.northArrowRotation = 0;
    }
  }

  private _checkForCachedTranslation(): void {
    if (!this.image || !this.isBrowser) {
      return;
    }

    const imageId = this.image.hash || this.image.pk.toString();
    const hasTranslation = this.contentTranslateService.hasTranslation("image-description", imageId);

    if (hasTranslation && this.image.detectedLanguage && this.image.detectedLanguage !== this.translateService.currentLang) {
      // Load the cached translation
      this._loadTranslatedDescription();
    }
  }
  
  /**
   * Check if the image or revision has annotations and show them
   */
  private _checkAndShowAnnotations(): void {
    if (!this.isBrowser || !this.image) {
      return;
    }
    
    // Check for annotations in URL
    const hasAnnotationsInUrl = this.isBrowser && 
      new URL(this.windowRefService.nativeWindow.location.href).searchParams.has('annotations');
    
    // Set the flag for URL annotations
    this.hasUrlAnnotations = hasAnnotationsInUrl;
      
    // Wait for revision to be fully initialized
    this.utilsService.delay(100).subscribe(() => {
      // Check for annotations in revision or image (but only use if no URL annotations)
      // URL annotations should trump saved annotations
      const hasAnnotationsInRevision = !hasAnnotationsInUrl && 
        this.revision && !!this.revision.annotations && 
        this.revision.annotations.trim() !== '' && this.revision.annotations !== '[]';
      
      // Only check for saved annotations if there are no URL annotations
      if (!hasAnnotationsInUrl) {
        this._checkForSavedAnnotations();
      }
      
      if (hasAnnotationsInUrl || hasAnnotationsInRevision) {
        console.log("Automatically enabling annotation mode - annotations found in", 
          hasAnnotationsInUrl ? "URL" : "revision");
          
        // Wait for the image to load since we need the image element
        this.utilsService.delay(500).subscribe(() => {
          if (this.imageFileLoaded && this.imageElementForAnnotation) {
            // Activate annotation mode
            this._previousMouseHoverState = {
              forceViewMouseHover: this.forceViewMouseHover,
              forceViewAnnotationsMouseHover: this.forceViewAnnotationsMouseHover
            };
            
            // Disable mouse hover features
            this.forceViewMouseHover = false;
            this.forceViewAnnotationsMouseHover = false;
            
            // Enter annotation mode
            this.isAnnotationMode = true;
            this.changeDetectorRef.markForCheck();
          }
        });
      }
    });
  }
  
  /**
   * Check if the image has saved annotations and add appropriate classes
   */
  private _checkForSavedAnnotations(): void {
    if (!this.revision) {
      this.hasSavedAnnotations = false;
      return;
    }
    
    try {
      // Check if there are annotations in the revision
      // Consider that a JSON array (even empty) is a saved state
      if (this.revision.annotations && this.revision.annotations.trim() !== '') {
        // Parse the annotations to check if it's a valid array
        const annotations = JSON.parse(this.revision.annotations);
        // Consider any array (even empty) as a saved state
        this.hasSavedAnnotations = Array.isArray(annotations);
      } else {
        this.hasSavedAnnotations = false;
      }
      
      // Add a class to the image-area when there are saved annotations
      if (this.imageArea?.nativeElement) {
        if (this.hasSavedAnnotations) {
          this.renderer.addClass(this.imageArea.nativeElement, 'has-saved-annotations');
        } else {
          this.renderer.removeClass(this.imageArea.nativeElement, 'has-saved-annotations');
        }
      }
    } catch (error) {
      console.warn('Error checking for saved annotations:', error);
      this.hasSavedAnnotations = false;
    }
  }

  private _updateSupportsFullscreen(): void {
    this.supportsFullscreen = (
      this.revision &&
      !this.revision.videoFile
    );
  }

  private _handleFloatingTitleOnScroll(
    scrollArea: HTMLElement,
    hasSiteHeader: boolean,
    hasMobileMenu: boolean,
    sideToSideLayout: boolean
  ) {
    const imageId = this.image.hash || this.image.pk;
    const imageViewer = document.getElementById(`image-viewer-${imageId}`);
    const socialButtons = scrollArea.querySelector(
      "astrobin-image-viewer-photographers astrobin-image-viewer-social-buttons"
    ) as HTMLElement | null;
    const floatingTitle = scrollArea.querySelector("astrobin-image-viewer-floating-title") as HTMLElement | null;

    if (!socialButtons || !floatingTitle) {
      return;
    }

    const siteHeader = document.querySelector("astrobin-header > nav") as HTMLElement | null;
    const siteHeaderHeight = siteHeader && hasSiteHeader ? siteHeader.offsetHeight : 0;
    const mobileMenu = imageViewer.querySelector("astrobin-mobile-menu") as HTMLElement | null;
    const mobileMenuHeight = mobileMenu && hasMobileMenu ? mobileMenu.offsetHeight : 0;

    // Check if the social buttons are out of view, but only if they are above the visible area
    const socialButtonsRect = socialButtons.getBoundingClientRect();
    const scrollAreaRect = scrollArea.getBoundingClientRect();
    const socialButtonsAboveViewport = socialButtonsRect.bottom < scrollAreaRect.top;

    if (socialButtonsAboveViewport) {
      let translateYValue: string;

      if (sideToSideLayout) {
        // The position is relative to the data area.
        translateYValue = `${mobileMenuHeight - 1}px`;
      } else {
        // The position is relative to the main area.
        translateYValue = `${siteHeaderHeight + mobileMenuHeight - 1}px`;
      }

      this.renderer.setStyle(floatingTitle, "transform", `translateY(${translateYValue})`);
    } else {
      this.renderer.setStyle(floatingTitle, "transform", "translateY(-120%)");
    }
  }

  private _handleNavigationButtonsVisibility(scrollArea: HTMLElement) {
    const image = scrollArea.querySelector("astrobin-image") as HTMLElement | null;
    const nextButton = scrollArea.querySelector(".next-button") as HTMLElement | null;
    const prevButton = scrollArea.querySelector(".previous-button") as HTMLElement | null;

    if (!image || (!nextButton && !prevButton)) {
      return;
    }

    const imageVisible = this.utilsService.isElementVisibleInContainer(image, scrollArea);

    if (imageVisible) {
      if (nextButton) {
        this.renderer.setStyle(nextButton, "opacity", "1");
        this.renderer.setStyle(nextButton, "pointer-events", "auto");
      }

      if (prevButton) {
        this.renderer.setStyle(prevButton, "opacity", "1");
        this.renderer.setStyle(prevButton, "pointer-events", "auto");
      }
    } else {
      if (nextButton) {
        this.renderer.setStyle(nextButton, "opacity", "0", RendererStyleFlags2.Important);
        this.renderer.setStyle(nextButton, "pointer-events", "none");
      }

      if (prevButton) {
        this.renderer.setStyle(prevButton, "opacity", "0", RendererStyleFlags2.Important);
        this.renderer.setStyle(prevButton, "pointer-events", "none");
      }
    }
  }

  private _setAd() {
    if (!this.isBrowser) {
      return;
    }

    if (!this.dataArea) {
      this.utilsService.delay(100).subscribe(() => {
        this._setAd();
        this.changeDetectorRef.markForCheck();
      });
      return;
    }

    this.adConfig = undefined;

    this.userSubscriptionService.displayAds$().pipe(
      filter(showAds => showAds !== undefined),
      take(1)
    ).subscribe(showAds => {
      const dataAreaWidth = this.windowRefService.nativeWindow.document.querySelector(
        `#image-viewer-${this.image.hash || this.image.pk} .data-area-container`
      ).clientWidth;
      const windowHeight = this.windowRefService.nativeWindow.innerHeight;

      this.showAd = this.image && this.image.allowAds && showAds;

      if (this.deviceService.mdMax()) {
        this.adConfig = "wide";
      } else if (windowHeight > dataAreaWidth * 2) {
        this.adConfig = "rectangular";
      } else {
        this.adConfig = "wide";
      }

      this.changeDetectorRef.markForCheck();
    });
  }

  private _replaceIdWithHash() {
    if (!this.isBrowser) {
      return;
    }

    if (!this.image || !this.image.hash) {
      return;
    }

    const currentUrl = this.windowRefService.nativeWindow.location.href;
    const urlObj = new URL(currentUrl);
    const queryString = urlObj.search;  // Includes the '?'
    const fragment = urlObj.hash;       // Includes the '#'

    // If the URL contains the image id, replace it while keeping query and fragment
    if (this.activatedRoute.snapshot.params["imageId"] === this.image.pk.toString()) {
      this.windowRefService.replaceState(
        {},
        `/i/${this.image.hash}${queryString}${fragment}`
      );
    }
  }

  private _recordHit() {
    if (!this.isBrowser || !this.active) {
      return;
    }

    const contentTypePayload = {
      appLabel: "astrobin",
      model: "image"
    };

    // No need to dispatch this because it's already done.
    this.currentUser$
      .pipe(
        switchMap(user =>
          this.store$.select(selectContentType, contentTypePayload).pipe(
            filter(contentType => !!contentType),
            take(1),
            map(contentType => [user, contentType])
          )
        ),
        switchMap(([user, contentType]) => {
          if (!user || user.id !== this.image.user) {
            return this.jsonApiService.recordHit(contentType.id, this.image.pk);
          }

          return of(null);
        }),
        take(1)
      )
      .subscribe();
  }

  private _startBasicSolver() {
    if (!this.imageContentType || !this.revisionContentType || !this.revision) {
      // If not ready yet, retry after a delay
      this.utilsService.delay(200).subscribe(() => {
        this._startBasicSolver();
      });
      return;
    }

    let contentTypeId: ContentTypeInterface["id"];

    // Determine the correct objectId and contentType to use
    if (this.revision.hasOwnProperty("label")) {
      contentTypeId = this.revisionContentType.id;
    } else {
      contentTypeId = this.imageContentType.id;
    }

    this.solutionApiService.startBasicSolver(contentTypeId, this.revision.pk.toString())
      .pipe(take(1))
      .subscribe(() => {
        // Solution won't be immediately available
        // The banner component will handle polling for updates
        this.changeDetectorRef.markForCheck();
      });
  }
}
