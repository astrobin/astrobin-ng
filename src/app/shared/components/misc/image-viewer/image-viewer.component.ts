import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding, HostListener, Inject, Input, OnDestroy, OnInit, Output, PLATFORM_ID, Renderer2, RendererStyleFlags2, TemplateRef, ViewChild } from "@angular/core";
import { FINAL_REVISION_LABEL, ImageInterface, ImageRevisionInterface, MouseHoverImageOptions, ORIGINAL_REVISION_LABEL } from "@shared/interfaces/image.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { select, Store } from "@ngrx/store";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { DeviceService } from "@shared/services/device.service";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { delay, filter, map, observeOn, switchMap, take, takeUntil } from "rxjs/operators";
import { ImageService } from "@shared/services/image/image.service";
import { ActivatedRoute } from "@angular/router";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { LoadContentType } from "@app/store/actions/content-type.actions";
import { selectContentType } from "@app/store/selectors/app/content-type.selectors";
import { HideFullscreenImage, ShowFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import { animationFrameScheduler, combineLatest, fromEvent, merge, Observable, of, Subject, Subscription, throttleTime } from "rxjs";
import { isPlatformBrowser, Location } from "@angular/common";
import { JsonApiService } from "@shared/services/api/classic/json/json-api.service";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { WindowRefService } from "@shared/services/window-ref.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { HttpClient } from "@angular/common/http";
import { environment } from "@env/environment";
import { TranslateService } from "@ngx-translate/core";
import { TitleService } from "@shared/services/title/title.service";
import { Lightbox, LIGHTBOX_EVENT, LightboxEvent } from "ngx-lightbox";
import { UserSubscriptionService } from "@shared/services/user-subscription/user-subscription.service";
import { AdManagerComponent } from "@shared/components/misc/ad-manager/ad-manager.component";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { NgbModal, NgbModalRef, NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";


@Component({
  selector: "astrobin-image-viewer",
  templateUrl: "./image-viewer.component.html",
  styleUrls: ["./image-viewer.component.scss"]
})
export class ImageViewerComponent
  extends BaseComponentDirective
  implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy {
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

  @HostBinding("id")
  get id() {
    return this.image ? `image-viewer-${this.image.hash || this.image.pk}` : null;
  }

  protected readonly ImageAlias = ImageAlias;
  protected readonly isPlatformBrowser = isPlatformBrowser;

  // This is computed from `image` and `revisionLabel` and is used to display data for the current revision.
  protected revision: ImageInterface | ImageRevisionInterface;
  protected imageObjectLoaded = false;
  protected imageFileLoaded = false;
  protected alias: ImageAlias = ImageAlias.QHD;
  protected imageContentType: ContentTypeInterface;
  protected userContentType: ContentTypeInterface;
  protected supportsFullscreen: boolean;
  protected viewingFullscreenImage = false;
  protected showRevisions = false;
  protected mouseHoverImage: string;
  protected forceViewMouseHover = false;
  protected inlineSvg: SafeHtml;
  protected isLightBoxOpen = false;
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
  private readonly _isBrowser: boolean;
  private _dataAreaScrollEventSubscription: Subscription;
  private _retryAdjustSvgOverlay: Subject<void> = new Subject();

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
    public readonly modalService: NgbModal
  ) {
    super(store$);
    this._isBrowser = isPlatformBrowser(platformId);
  }

  @HostBinding("class.standalone")
  get isStandalone() {
    return this.standalone;
  }

  ngOnInit(): void {
    this._initImageAlias();
    this._initAdjustmentEditor();
    this._initContentTypes();

    if (this.image) {
      this.setImage(this.image, this.revisionLabel);
    }

    this.initialized.emit();
  }

  ngAfterViewInit() {
    if (this._isBrowser) {
      merge(
        this._retryAdjustSvgOverlay.pipe(
          delay(100),
          takeUntil(this.destroyed$)
        ),
        fromEvent(this.windowRefService.nativeWindow, "resize").pipe(
          throttleTime(300),
          takeUntil(this.destroyed$)
        )
      ).subscribe(() => {
        this._adjustSvgOverlay();

        if (this.adManagerComponent) {
          this._setAd();
        }

        if (this._dataAreaScrollEventSubscription) {
          this._dataAreaScrollEventSubscription.unsubscribe();
          this._initDataAreaScrollHandling();
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

    super.ngOnDestroy();
  }

  @HostListener("window:popstate", ["$event"])
  onPopState(event: PopStateEvent) {
    if (this.standalone && this.viewingFullscreenImage) {
      this.exitFullscreen();
    }
  }

  @HostListener("document:keydown.escape", ["$event"])
  handleEscapeKey(event: KeyboardEvent) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (this.viewingFullscreenImage) {
      this.exitFullscreen();
      return;
    }

    if (this.adjustmentEditorVisible) {
      this.adjustmentEditorVisible = false;
      return;
    }

    if (this.offcanvasService.hasOpenOffcanvas()) {
      this.offcanvasService.dismiss();
      return;
    }

    if (this.modalService.hasOpenModals()) {
      this.modalService.dismissAll();
      return;
    }

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

    this._initRevision();
    this._updateSupportsFullscreen();
    this._initAutoOpenFullscreen();
    this._setMouseHoverImage();
    this._recordHit();
    this._setAd();

    // Updates to the current image.
    this.store$.pipe(
      select(selectImage, image.pk),
      filter(image => !!image),
      takeUntil(this.destroyed$)
    ).subscribe((image: ImageInterface) => {
      this.image = { ...image };
      this.revision = this.imageService.getRevision(this.image, this.revisionLabel);
      this._setMouseHoverImage();
    });

    this.changeDetectorRef.detectChanges();
  }

  protected onImageLoaded(): void {
    this.imageFileLoaded = true;
  }

  protected onImageMouseEnter(event: MouseEvent): void {
    event.preventDefault();
    if (!this.deviceService.isTouchEnabled()) {
      this.imageArea.nativeElement.classList.add("hover");
    }
  }

  protected onImageMouseLeave(event: MouseEvent): void {
    event.preventDefault();
    this.imageArea.nativeElement.classList.remove("hover");
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
    this._setMouseHoverImage();
    this.revisionSelected.emit(revisionLabel);
  }

  protected toggleViewMouseHover(): void {
    this.forceViewMouseHover = !this.forceViewMouseHover;
  }

  protected enterFullscreen(event: MouseEvent | null): void {
    if (event) {
      event.preventDefault();
    }

    if (this.supportsFullscreen) {
      this.store$.dispatch(new ShowFullscreenImage(this.image.pk));
      this.viewingFullscreenImage = true;
      this.toggleFullscreen.emit(true);

      if (this._isBrowser) {
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
  }

  protected exitFullscreen(): void {
    this.store$.dispatch(new HideFullscreenImage());
    this.viewingFullscreenImage = false;
    this.toggleFullscreen.emit(false);

    if (this._isBrowser) {
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
          }
        });

        this.isLightBoxOpen = true;
        this.lightbox.open([{ src, thumb }], 0);
      }
    }
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

  private _setMouseHoverImage() {
    if (!this.revision) {
      return;
    }

    switch (this.revision.mouseHoverImage) {
      case MouseHoverImageOptions.NOTHING:
      case null:
        this.mouseHoverImage = null;
        this.inlineSvg = null;
        break;
      case MouseHoverImageOptions.SOLUTION:
        if (this.revision?.solution?.pixinsightSvgAnnotationRegular) {
          this.mouseHoverImage = null;
          this._loadInlineSvg$(
            environment.classicBaseUrl + `/platesolving/solution/${this.revision.solution.id}/svg/regular/`
          ).subscribe(inlineSvg => {
            this.inlineSvg = inlineSvg;
          });
        } else if (this.revision?.solution?.imageFile) {
          this.mouseHoverImage = this.revision.solution.imageFile;
          this.inlineSvg = null;
        } else {
          this.mouseHoverImage = null;
          this.inlineSvg = null;
        }
        break;
      case MouseHoverImageOptions.INVERTED:
        this.mouseHoverImage = this.revision.thumbnails.find(thumbnail =>
          thumbnail.alias === this.alias + "_inverted"
        ).url;
        this.inlineSvg = null;
        break;
      case "ORIGINAL":
        this.mouseHoverImage = this.image.thumbnails.find(thumbnail =>
          thumbnail.alias === this.alias &&
          thumbnail.revision === ORIGINAL_REVISION_LABEL
        ).url;
        this.inlineSvg = null;
        break;
      default:
        const matchingRevision = this.image.revisions.find(
          revision => revision.label === this.revision.mouseHoverImage.replace("REVISION__", "")
        );
        if (matchingRevision) {
          this.mouseHoverImage = matchingRevision.thumbnails.find(
            thumbnail => thumbnail.alias === this.alias
          ).url;
          this.inlineSvg = null;
        }
    }
  }

  private _loadInlineSvg$(svgUrl: string): Observable<SafeHtml> {
    return this.http.get(svgUrl, { responseType: "text" }).pipe(
      map(svgContent => {
        this._onMouseHoverSvgLoad();
        return this.domSanitizer.bypassSecurityTrustHtml(svgContent);
      })
    );
  }

  private _onMouseHoverSvgLoad(): void {
    if (this._isBrowser) {
      this.utilsService.delay(100).subscribe(() => {
        const _doc = this.windowRefService.nativeWindow.document;
        const svgObject = _doc.getElementById("mouse-hover-svg-" + this.image.pk) as HTMLObjectElement;

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
      });
    }
  }

  private _adjustSvgOverlay(): void {
    if (!this.inlineSvg) {
      return;
    }

    if (!this.imageArea) {
      this._retryAdjustSvgOverlay.next();
      return;
    }

    const imageAreaElement = this.imageArea.nativeElement.querySelector(".image-area-body") as HTMLElement;
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
    if (!this._isBrowser) {
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
    if (
      this.activatedRoute.snapshot.queryParams["brightness"] ||
      this.activatedRoute.snapshot.queryParams["contrast"] ||
      this.activatedRoute.snapshot.queryParams["saturation"]
    ) {
      this.adjustmentEditorVisible = true;
    }
  }

  private _initAutoOpenFullscreen() {
    if (this._isBrowser) {
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
    });

    this.store$.pipe(
      select(selectContentType, { appLabel: "auth", model: "user" }),
      filter(contentType => !!contentType),
      take(1)
    ).subscribe(contentType => {
      this.userContentType = contentType;
    });

    this.store$.dispatch(new LoadContentType({
      appLabel: "astrobin",
      model: "image"
    }));

    this.store$.dispatch(new LoadContentType({
      appLabel: "auth",
      model: "user"
    }));
  }

  private _initRevision() {
    if (this.revisionLabel === ORIGINAL_REVISION_LABEL) {
      this.revision = this.image;
      this.onRevisionSelected(ORIGINAL_REVISION_LABEL, false);
      return;
    }

    if (this.revisionLabel === FINAL_REVISION_LABEL || this.revisionLabel === null || this.revisionLabel === undefined) {
      this.revision = this.imageService.getFinalRevision(this.image);
      this.onRevisionSelected(FINAL_REVISION_LABEL, false);
      return;
    }

    this.revision = this.imageService.getRevision(this.image, this.revisionLabel);
    this.onRevisionSelected((this.revision as ImageRevisionInterface).label, false);
  }

  private _updateSupportsFullscreen(): void {
    this.supportsFullscreen = (
      this.revision &&
      !this.revision.videoFile &&
      (
        !this.revision.imageFile ||
        !this.revision.imageFile.toLowerCase().endsWith(".gif")
      )
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
    const adManagerHeight = adManager ? adManager.offsetHeight : 0;
    const siteHeader = document.querySelector("astrobin-header > nav") as HTMLElement | null;
    const siteHeaderHeight = siteHeader && hasSiteHeader ? siteHeader.offsetHeight : 0;
    const mobileMenu = imageViewer.querySelector("astrobin-mobile-menu") as HTMLElement | null;
    const mobileMenuHeight = mobileMenu && hasMobileMenu ? mobileMenu.offsetHeight : 0;
    const globalLoadingIndicator = document.querySelector(".global-loading-indicator") as HTMLElement | null;
    const globalLoadingIndicatorHeight = globalLoadingIndicator ? globalLoadingIndicator.offsetHeight : 0;

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
        translateYValue = `${globalLoadingIndicatorHeight + siteHeaderHeight + mobileMenuHeight - 1}px`;
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
      }

      if (prevButton) {
        this.renderer.setStyle(prevButton, "opacity", "1");
      }
    } else {
      if (nextButton) {
        this.renderer.setStyle(nextButton, "opacity", "0", RendererStyleFlags2.Important);
      }

      if (prevButton) {
        this.renderer.setStyle(prevButton, "opacity", "0", RendererStyleFlags2.Important);
      }
    }
  }

  private _setAd() {
    if (!this._isBrowser) {
      return;
    }

    if (!this.dataArea) {
      this.utilsService.delay(100).subscribe(() => {
        this._setAd();
      });
      return;
    }

    this.userSubscriptionService.displayAds$().pipe(
      filter(showAds => showAds !== undefined),
      take(1)
    ).subscribe(showAds => {
      const dataAreaWidth = this.dataArea.nativeElement.clientWidth;
      const windowHeight = this.windowRefService.nativeWindow.innerHeight;

      this.showAd = this.image && this.image.allowAds && showAds;

      if (this.deviceService.mdMax()) {
        this.adConfig = "wide";
      } else if (windowHeight > dataAreaWidth * 2) {
        this.adConfig = "rectangular";
      } else {
        this.adConfig = "wide";
      }

      if (this.adManagerComponent && this.adDisplayed) {
        this.adManagerComponent.refreshAd();
      }
    });
  }

  private _recordHit() {
    const contentTypePayload = {
      appLabel: "astrobin",
      model: "image"
    };

    if (!this._isBrowser) {
      return;
    }

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
}
