import { AfterViewChecked, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding, HostListener, Inject, Input, OnChanges, OnDestroy, OnInit, Output, PLATFORM_ID, Renderer2, RendererStyleFlags2, SimpleChanges, TemplateRef, ViewChild } from "@angular/core";
import { FINAL_REVISION_LABEL, FullSizeLimitationDisplayOptions, ImageInterface, ImageRevisionInterface, MouseHoverImageOptions, ORIGINAL_REVISION_LABEL } from "@core/interfaces/image.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { select, Store } from "@ngrx/store";
import { ImageAlias } from "@core/enums/image-alias.enum";
import { DeviceService } from "@core/services/device.service";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { catchError, delay, filter, map, observeOn, switchMap, take, takeUntil } from "rxjs/operators";
import { ImageService } from "@core/services/image/image.service";
import { ActivatedRoute } from "@angular/router";
import { ContentTypeInterface } from "@core/interfaces/content-type.interface";
import { LoadContentType } from "@app/store/actions/content-type.actions";
import { selectContentType } from "@app/store/selectors/app/content-type.selectors";
import { HideFullscreenImage, ShowFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
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

  private _dataAreaScrollEventSubscription: Subscription;
  private _retryAdjustSvgOverlay: Subject<void> = new Subject();
  private _activeOffcanvas: NgbOffcanvasRef;

  constructor(
    public readonly store$: Store<MainState>,
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
    public readonly elementRef: ElementRef
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

  ngOnInit(): void {
    this._initImageAlias();
    this._initContentTypes();

    this.offcanvasService.activeInstance.pipe(takeUntil(this.destroyed$)).subscribe(activeOffcanvas => {
      this._activeOffcanvas = activeOffcanvas;
    });
  }

  // Mobile menu event handlers
  protected onMobileMenuOpen(): void {
    // No special handling needed when menu opens
  }

  protected onMobileMenuClose(): void {
    // No special handling needed when menu closes
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

        if (this.adManagerComponent) {
          this._setAd();
        }

        if (this._dataAreaScrollEventSubscription) {
          this._dataAreaScrollEventSubscription.unsubscribe();
          this._initDataAreaScrollHandling();
        }

        this.changeDetectorRef.markForCheck();
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
      this.exitFullscreen();
      return;
    }

    if (this.adjustmentEditorVisible) {
      this.adjustmentEditorVisible = false;
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
  onArrowRight(event: KeyboardEvent): any {
    if (this._ignoreNavigationEvent(event)) {
      return true;
    }

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.nextClick.emit();
  }

  @HostListener("document:keyup.arrowLeft", ["$event"])
  onArrowLeft(event: KeyboardEvent): any {
    if (this._ignoreNavigationEvent(event)) {
      return true;
    }

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

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

    this.onToggleAnnotationsOnMouseHoverLeave();
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

  protected onImageLoaded(): void {
    this.imageFileLoaded = true;
  }

  protected onImageMouseEnter(event: MouseEvent): void {
    event.preventDefault();

    if (this.deviceService.isTouchEnabled() && !this.deviceService.isHybridPC()) {
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
    }
  }

  protected onImageMouseLeave(event: MouseEvent): void {
    event.preventDefault();
    this.imageArea.nativeElement.classList.remove("hover");
  }

  @Throttle(20)
  protected onSvgMouseMove(event: MouseEvent): void {
    if (!this.advancedSolutionMatrix || !this.advancedSolutionMatrix.raMatrix) {
      return;
    }

    const imageElement = this.imageArea.nativeElement.querySelector("astrobin-image img");

    if (!imageElement) {
      return;
    }

    const imageRenderedWidth = imageElement.clientWidth;
    const imageNaturalWidth = imageElement.naturalWidth;
    const hdWidth = Math.min(imageNaturalWidth, 1824);
    const scale = imageRenderedWidth / hdWidth;
    const raMatrix = this.advancedSolutionMatrix.raMatrix.split(",").map(Number);
    const decMatrix = this.advancedSolutionMatrix.decMatrix.split(",").map(Number);
    const rect = this.advancedSolutionMatrix.matrixRect.split(",").map(Number);
    const delta = this.advancedSolutionMatrix.matrixDelta;

    const interpolation = new CoordinateInterpolation(
      raMatrix,
      decMatrix,
      rect[0],
      rect[1],
      rect[2],
      rect[3],
      delta,
      undefined,
      scale
    );

    const interpolationText = interpolation.interpolateAsText(
      event.offsetX / scale,
      event.offsetY / scale,
      false,
      true,
      true
    );

    const ra = interpolationText.alpha.trim().split(" ").map(x => x.padStart(2, "0"));
    const dec = interpolationText.delta.trim().split(" ").map(x => x.padStart(2, "0"));

    this.mouseHoverRa = `
      <span class="symbol">α</span>:
      <span class="value">${ra[0]}</span><span class="unit">h</span>
      <span class="value">${ra[1]}</span><span class="unit">m</span>
      <span class="value">${ra[2]}</span><span class="unit">s</span>
    `;
    this.mouseHoverDec = `
      <span class="symbol">δ</span>:
      <span class="value">${dec[0]}</span><span class="unit">°</span>
      <span class="value">${dec[1]}</span><span class="unit">'</span>
      <span class="value">${dec[2]}</span><span class="unit">"</span>
    `;

    const galacticRa = interpolationText.l.trim().split(" ").map(x => x.padStart(2, "0"));
    const galacticDec = interpolationText.b.trim().split(" ").map(x => x.padStart(2, "0"));

    this.mouseHoverGalacticRa = `
      <span class="symbol">l</span>:
      <span class="value">${galacticRa[0]}</span><span class="unit">°</span>
      <span class="value">${galacticRa[1]}</span><span class="unit">'</span>
      <span class="value">${galacticRa[2]}</span><span class="unit>"</span>
    `;

    this.mouseHoverGalacticDec = `
      <span class="symbol">b</span>:
      <span class="value">${galacticDec[0]}</span><span class="unit">°</span>
      <span class="value">${galacticDec[1]}</span><span class="unit">'</span>
      <span class="value">${galacticDec[2]}</span><span class="unit"></span>
    `;

    this.mouseHoverX = event.offsetX;
    this.mouseHoverY = event.offsetY;
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

    this.revision = this.imageService.getRevision(this.image, this.revisionLabel);
    this._setNonSolutionMouseHoverImage();
    this._setSolutionMouseHoverImage();
    this._setShowPlateSolvingBanner();
    this.revisionSelected.emit(revisionLabel);
  }

  protected toggleViewMouseHover(): void {
    this.forceViewMouseHover = !this.forceViewMouseHover;
  }

  onToggleAnnotationsOnMouseHoverEnter(): void {
    this.forceViewAnnotationsMouseHover = true;
    this.forceViewMouseHover = true;
    this._onMouseHoverSvgLoad();
  }

  onToggleAnnotationsOnMouseHoverLeave(): void {
    this.forceViewAnnotationsMouseHover = false;
    this.forceViewMouseHover = false;
  }

  protected enterFullscreen(event: MouseEvent | TouchEvent | null): void {
    if (event) {
      event.preventDefault();
    }

    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (this.supportsFullscreen) {
        // Check if this is a GIF file and the device uses touch
        const isGif = this.revision.imageFile && this.revision.imageFile.toLowerCase().endsWith('.gif');
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

        if (!allowReal) {
          this.popNotificationsService.info(
            this.translateService.instant("Zoom disabled by the image owner.")
          );
          return;
        }

        this.store$.dispatch(new ShowFullscreenImage({ imageId: this.image.pk, event }));
        this.viewingFullscreenImage = true;
        this.changeDetectorRef.markForCheck();
        this.toggleFullscreen.emit(true);

        if (this.isBrowser) {
          const location_ = this.windowRefService.nativeWindow.location;
          this.windowRefService.pushState(
            {
              imageId: this.image.hash || this.image.pk,
              revisionLabel: this.revisionLabel,
              fullscreen: true
            },
            `${location_.pathname}${location_.search}#fullscreen`
          );
        }
      }
    });
  }

  protected exitFullscreen(): void {
    this.store$.dispatch(new HideFullscreenImage());
    this.viewingFullscreenImage = false;
    this.toggleFullscreen.emit(false);

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

    let scrollPosition : number;

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
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      (event.target as HTMLElement).classList.contains("cke_wysiwyg_div")
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

    if (this.revision?.solution?.pixinsightSvgAnnotationRegular) {
      this._loadInlineSvg$(
        environment.classicBaseUrl + `/platesolving/solution/${this.revision.solution.id}/svg/regular/`
      ).subscribe(inlineSvg => {
        this.solutionMouseHoverImage = null;
        this.inlineSvg = inlineSvg;
        this.changeDetectorRef.markForCheck();
      });
      this._loadAdvancedSolutionMatrix$(this.revision.solution.id).subscribe(matrix => {
        this.advancedSolutionMatrix = matrix;
        this.loadingAdvancedSolutionMatrix = false;
        this.changeDetectorRef.markForCheck();
      });
    } else if (this.revision?.solution?.imageFile) {
      this.solutionMouseHoverImage = this.revision.solution.imageFile;
      this.inlineSvg = null;
    } else {
      this.solutionMouseHoverImage = null;
      this.inlineSvg = null;
    }
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

  private _loadAdvancedSolutionMatrix$(solutionId: number): Observable<{
    matrixRect: string;
    matrixDelta: number;
    raMatrix: string;
    decMatrix: string;
  }> {
    if (this.loadingAdvancedSolutionMatrix || this.advancedSolutionMatrix) {
      return of(this.advancedSolutionMatrix);
    }

    this.loadingAdvancedSolutionMatrix = true;

    return this.solutionApiService.getAdvancedMatrix(solutionId);
  }

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

    const adManager = scrollArea.querySelector("astrobin-ad-manager") as HTMLElement | null;
    const adManagerHeight = adManager && adManager.querySelector(".ad-container").classList.contains("ad-rendered") ? adManager.offsetHeight : 0;
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
        translateYValue = `${adManagerHeight + mobileMenuHeight - 1}px`;
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

  protected readonly MouseHoverImageOptions = MouseHoverImageOptions;
}
