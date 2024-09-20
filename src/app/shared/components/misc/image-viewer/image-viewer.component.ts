import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding, HostListener, Inject, Input, OnDestroy, OnInit, Output, PLATFORM_ID, Renderer2, TemplateRef, ViewChild } from "@angular/core";
import { FINAL_REVISION_LABEL, ImageInterface, ImageRevisionInterface, MouseHoverImageOptions, ORIGINAL_REVISION_LABEL } from "@shared/interfaces/image.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { select, Store } from "@ngrx/store";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { DeviceService } from "@shared/services/device.service";
import { LoadImage } from "@app/store/actions/image.actions";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { filter, map, switchMap, take, takeUntil } from "rxjs/operators";
import { ImageService } from "@shared/services/image/image.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { SearchService } from "@features/search/services/search.service";
import { ActivatedRoute, Router } from "@angular/router";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { LoadContentType } from "@app/store/actions/content-type.actions";
import { selectContentType } from "@app/store/selectors/app/content-type.selectors";
import { NgbModal, NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { NestedCommentsAutoStartTopLevelStrategy } from "@shared/components/misc/nested-comments/nested-comments.component";
import { HideFullscreenImage, ShowFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import { combineLatest, fromEvent, Observable, of, Subject, Subscription, throttleTime } from "rxjs";
import { isPlatformBrowser, isPlatformServer, Location } from "@angular/common";
import { JsonApiService } from "@shared/services/api/classic/json/json-api.service";
import { ImageApiService } from "@shared/services/api/classic/images/image/image-api.service";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { WindowRefService } from "@shared/services/window-ref.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { HttpClient } from "@angular/common/http";
import { environment } from "@env/environment";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { TitleService } from "@shared/services/title/title.service";
import { LoadingService } from "@shared/services/loading.service";
import { Lightbox, LIGHTBOX_EVENT, LightboxEvent } from "ngx-lightbox";
import { UserSubscriptionService } from "@shared/services/user-subscription/user-subscription.service";
import { AdManagerComponent } from "@shared/components/misc/ad-manager/ad-manager.component";
import { BBCodeToHtmlPipe } from "@shared/pipes/bbcode-to-html.pipe";

enum SharingMode {
  LINK = "link",
  BBCODE = "bbcode",
  HTML = "html"
}

export interface ImageViewerNavigationContextItem {
  imageId: ImageInterface["hash"] | ImageInterface["pk"];
  thumbnailUrl: string;
}

export type ImageViewerNavigationContext = ImageViewerNavigationContextItem[];

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
  searchComponentId: string;

  @Input()
  navigationContext: ImageViewerNavigationContext;

  // This is used to determine whether the view is fixed and occupying the entire screen.
  @Input()
  fullscreenMode = false;

  @Input()
  showCloseButton = false;

  @Output()
  closeViewer = new EventEmitter<void>();

  @Output()
  initialized = new EventEmitter<void>();

  @Output()
  nearEndOfContext = new EventEmitter<string>();

  @ViewChild("mainArea")
  mainArea: ElementRef;

  @ViewChild("imageArea")
  imageArea: ElementRef;

  @ViewChild("dataArea")
  dataArea: ElementRef;

  @ViewChild("ad", { static: false, read: AdManagerComponent })
  adManagerComponent: AdManagerComponent;

  @ViewChild("buttonsArea", { static: false, read: ElementRef })
  buttonsAreaElement: ElementRef;

  @ViewChild("scrollToTopMdMax", { static: false, read: ElementRef })
  scrollToTopMdMax: ElementRef;

  @ViewChild("scrollToTopLgMin", { static: false, read: ElementRef })
  scrollToTopLgMin: ElementRef;

  @ViewChild("navigationContextElement")
  navigationContextElement: ElementRef;

  @ViewChild("nestedCommentsTemplate")
  nestedCommentsTemplate: TemplateRef<any>;

  @ViewChild("shareTemplate")
  shareTemplate: TemplateRef<any>;

  @ViewChild("mouseHoverSvgObject", { static: false })
  mouseHoverSvgObject: ElementRef;

  protected readonly ImageAlias = ImageAlias;
  protected readonly NestedCommentsAutoStartTopLevelStrategy = NestedCommentsAutoStartTopLevelStrategy;
  protected readonly isPlatformBrowser = isPlatformBrowser;

  // This is computed from `image` and `revisionLabel` and is used to display data for the current revision.
  protected revision: ImageInterface | ImageRevisionInterface;
  protected imageLoaded = false;
  protected alias: ImageAlias = ImageAlias.QHD;
  protected hasOtherImages = false;
  protected currentIndex = null;
  protected imageContentType: ContentTypeInterface;
  protected userContentType: ContentTypeInterface;
  protected supportsFullscreen: boolean;
  protected viewingFullscreenImage = false;
  protected showRevisions = false;
  protected mouseHoverImage: string;
  protected forceViewMouseHover = false;
  protected inlineSvg: SafeHtml;
  protected readonly shareForm: FormGroup = new FormGroup({});
  protected shareModel: {
    sharingMode: SharingMode;
    copyThis: string;
  } = {
    sharingMode: SharingMode.LINK,
    copyThis: ""
  };
  protected readonly shareFields: FormlyFieldConfig[] = [
    {
      key: "sharingMode",
      type: "ng-select",
      wrappers: ["default-wrapper"],
      defaultValue: SharingMode.LINK,
      props: {
        label: this.translateService.instant("Sharing mode"),
        options: [
          { value: SharingMode.LINK, label: this.translateService.instant("Simple link") },
          { value: SharingMode.BBCODE, label: this.translateService.instant("Forums (BBCode)") },
          { value: SharingMode.HTML, label: this.translateService.instant("HTML") }
        ],
        searchable: false,
        clearable: false
      },
      hooks: {
        onInit: field => {
          field.formControl.valueChanges.subscribe(() => {
            this.shareModel = {
              ...this.shareModel,
              copyThis: this.getSharingValue(this.shareModel.sharingMode)
            };
          });
        }
      }
    },
    {
      key: "copyThis",
      type: "textarea",
      wrappers: ["default-wrapper"],
      defaultValue: this.getSharingValue(SharingMode.LINK),
      props: {
        label: this.translateService.instant("Copy this"),
        rows: 5,
        readonly: true
      }
    }
  ];
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

  private _imageChangedSubject = new Subject<ImageInterface>();
  private _imageChanged$ = this._imageChangedSubject.asObservable();
  private _navigationContextChangedSubject = new Subject<void>();
  public navigationContextChanged$ = this._navigationContextChangedSubject.asObservable();
  private _navigationContextWheelEventSubscription: Subscription;
  private _navigationContextScrollEventSubscription: Subscription;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly deviceService: DeviceService,
    public readonly imageService: ImageService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly modalService: NgbModal,
    public readonly jsonApiService: JsonApiService,
    @Inject(PLATFORM_ID) public readonly platformId: Record<string, unknown>,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly imageApiService: ImageApiService,
    public readonly domSanitizer: DomSanitizer,
    public readonly windowRefService: WindowRefService,
    public readonly utilsService: UtilsService,
    public readonly http: HttpClient,
    public readonly translateService: TranslateService,
    public readonly location: Location,
    public readonly titleService: TitleService,
    public readonly loadingService: LoadingService,
    public readonly renderer: Renderer2,
    public readonly lightbox: Lightbox,
    public readonly lightboxEvent: LightboxEvent,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly activatedRoute: ActivatedRoute,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly bbCodeToHtmlPipe: BBCodeToHtmlPipe
  ) {
    super(store$);
  }

  @HostBinding("class.fullscreen-mode")
  get isFullscreenMode() {
    return this.fullscreenMode || this.viewingFullscreenImage;
  }

  ngOnInit(): void {
    if (this.deviceService.lgMax()) {
      this.alias = ImageAlias.HD;
    } else if (this.deviceService.xlMin()) {
      this.alias = ImageAlias.QHD;
    }

    if (
      this.activatedRoute.snapshot.queryParams["brightness"] ||
      this.activatedRoute.snapshot.queryParams["contrast"] ||
      this.activatedRoute.snapshot.queryParams["saturation"]
    ) {
      this.adjustmentEditorVisible = true;
    }

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

    this.initialized.emit();
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      fromEvent(this.windowRefService.nativeWindow, "resize").pipe(
        throttleTime(300)
      ).subscribe(() => {
        this.adjustSvgOverlay();

        if (this.adManagerComponent) {
          this._setAd();
        }
      });
    }

    this.autoOpenComments();
  }

  ngAfterViewChecked() {
    if (this.navigationContextElement && !this._navigationContextWheelEventSubscription) {
      this.initNavigationScrollHandling();
    }
  }

  ngOnDestroy() {
    if (this._navigationContextWheelEventSubscription) {
      this._navigationContextWheelEventSubscription.unsubscribe();
    }

    if (this._navigationContextScrollEventSubscription) {
      this._navigationContextScrollEventSubscription.unsubscribe();
    }

    super.ngOnDestroy();
  }

  initNavigationScrollHandling() {
    if (this.navigationContextElement) {
      const el = this.navigationContextElement.nativeElement;

      this._navigationContextWheelEventSubscription = fromEvent<WheelEvent>(el, "wheel")
        .subscribe(event => {
          const scrollAmount = event.deltaY;
          if (scrollAmount) {
            el.scrollLeft += scrollAmount;
          }
        });

      this._navigationContextScrollEventSubscription = fromEvent<Event>(el, "scroll")
        .pipe(throttleTime(200))
        .subscribe(() => {
          const maxScrollLeft = el.scrollWidth;
          const currentScrollLeft = el.scrollLeft + el.clientWidth;

          if (currentScrollLeft >= maxScrollLeft - el.clientWidth * 2) {
            this.nearEndOfContext.emit(this.searchComponentId);
          }
        });

      // Ensure that change detection runs to update the view
      this.changeDetectorRef.detectChanges();
    }
  }

  autoOpenComments(): void {
    const fragment = this.activatedRoute.snapshot.fragment;
    if (fragment && fragment[0] === "c") {
      this.openComments(null);
    }
  }

  onDescriptionClicked(event: MouseEvent) {
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

  setNavigationContext(navigationContext: ImageViewerNavigationContext): void {
    let currentScrollLeft = null;
    const navigationContextLength = navigationContext.length;

    if (this.navigationContextElement) {
      currentScrollLeft = this.navigationContextElement.nativeElement.scrollLeft;
    }

    if (this.navigationContext) {
      this.navigationContext.splice(0, this.navigationContext.length, ...navigationContext);
    } else {
      this.navigationContext = navigationContext;
    }

    if (currentScrollLeft !== null && navigationContextLength !== this.navigationContext.length) {
      this.utilsService.delay(1).subscribe(() => {
        this.navigationContextElement.nativeElement.scrollLeft = currentScrollLeft;
      });
    }

    this._updateNavigationContextInformation();

    this._navigationContextChangedSubject.next();
  }

  setImage(
    image: ImageInterface,
    revisionLabel: ImageRevisionInterface["label"],
    fullscreenMode: boolean,
    navigationContext: ImageViewerNavigationContext,
    pushState: boolean
  ): void {
    if (this.dataArea) {
      this.renderer.setProperty(this.dataArea.nativeElement, "scrollTop", 0);

      if (this.deviceService.mdMax()) {
        this.renderer.setProperty(this.mainArea.nativeElement, "scrollTop", 0);
      }
    }

    if (image === null) {
      this.imageLoaded = false;
      this.image = null;
      this.revisionLabel = null;
      this.revision = null;
      this.mouseHoverImage = null;
      this.inlineSvg = null;
      this.supportsFullscreen = false;
      this.viewingFullscreenImage = false;
      this.showRevisions = false;
      this.imageService.showInvalidImageNotification();
      this.close();
      return;
    }

    this.imageService.removeInvalidImageNotification();
    this.imageLoaded = false;
    this.image = image;
    this.revisionLabel = revisionLabel;
    this.revision = this.imageService.getRevision(this.image, this.revisionLabel);

    this.updateSupportsFullscreen();

    if (this.revision.hasOwnProperty("label")) {
      this.onRevisionSelected((this.revision as ImageRevisionInterface).label, false);
    } else {
      this.onRevisionSelected(ORIGINAL_REVISION_LABEL, false);
    }

    if (fullscreenMode) {
      this.enterFullscreen(null);
    }

    this.setMouseHoverImage();
    this.setNavigationContext(navigationContext);
    this._recordHit();
    this._setAd();

    if (this.navigationContextElement) {
      this.windowRefService.scrollToElement(
        `#image-viewer-context-${image.hash || image.pk}`,
        {
          behavior: "smooth",
          block: "center",
          inline: "center"
        }
      );
    }

    this._imageChangedSubject.next(image);

    // Updates to the current image.
    this.store$.pipe(
      select(selectImage, image.pk),
      filter(image => !!image),
      takeUntil(this._imageChanged$)
    ).subscribe((image: ImageInterface) => {
      this.image = { ...image };
      this.revision = this.imageService.getRevision(this.image, this.revisionLabel);
    });

    this.changeDetectorRef.detectChanges();

    if (pushState) {
      this.windowRefService.pushState(
        {
          imageId: image.hash || image.pk,
          revisionLabel,
          fullscreenMode
        },
        this._getPath(image, revisionLabel, fullscreenMode)
      );
    }

    this._setMetaTags();
  }

  setMouseHoverImage() {
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
          this.loadInlineSvg$(
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

  @HostListener("window:popstate", ["$event"])
  onPopState(event: any) {
    if (this.viewingFullscreenImage) {
      this.exitFullscreen(false);
    } else {
      if (event.state?.imageId && event.state?.imageId !== (this.image.hash || this.image.pk)) {
        this._navigateToImage(
          event.state.imageId,
          event.state.revisionLabel || FINAL_REVISION_LABEL,
          !!event.state.fullscreen,
          false);
      } else {
        this.close();
      }
    }
  }

  @HostListener("document:keydown.escape", ["$event"])
  handleEscapeKey(event: KeyboardEvent) {
    if (this.viewingFullscreenImage) {
      this.exitFullscreen(true);
      return;
    }

    if (this.adjustmentEditorVisible) {
      this.adjustmentEditorVisible = false;
      return;
    }

    if (this._ignoreNavigationEvent()) {
      return;
    }

    this.close();
  }

  @HostListener("document:keydown.arrowRight", ["$event"])
  onNextClicked(): void {
    if (this._ignoreNavigationEvent()) {
      return;
    }

    const contextItem = this.navigationContext[this.currentIndex + 1];

    if (!contextItem) {
      return;
    }

    this._navigateToImage(contextItem.imageId, FINAL_REVISION_LABEL, false, true);
  }

  @HostListener("document:keydown.arrowLeft", ["$event"])
  onPreviousClicked(): void {
    if (this._ignoreNavigationEvent()) {
      return;
    }

    const contextItem = this.navigationContext[this.currentIndex - 1];

    if (!contextItem) {
      return;
    }

    this._navigateToImage(contextItem.imageId, FINAL_REVISION_LABEL, false, true);
  }

  onImageLoaded(): void {
    this.imageLoaded = true;
  }

  onImageMouseEnter(event: MouseEvent): void {
    event.preventDefault();
    if (!this.deviceService.isTouchEnabled()) {
      this.imageArea.nativeElement.classList.add("hover");
    }
  }

  onImageMouseLeave(event: MouseEvent): void {
    event.preventDefault();
    this.imageArea.nativeElement.classList.remove("hover");
  }

  onRevisionSelected(revisionLabel: ImageRevisionInterface["label"], pushState: boolean): void {
    if (this.revisionLabel === revisionLabel) {
      return;
    }

    this.revisionLabel = revisionLabel;
    this.revision = this.imageService.getRevision(this.image, this.revisionLabel);
    this.setMouseHoverImage();

    if (pushState) {
      this.windowRefService.pushState(
        {
          imageId: this.image.hash || this.image.pk,
          revisionLabel
        },
        this._getPath(this.image, revisionLabel)
      );
    }
  }

  openShare(event: MouseEvent): void {
    event.preventDefault();

    this.shareModel = {
      sharingMode: SharingMode.LINK,
      copyThis: this.getSharingValue(SharingMode.LINK)
    };

    this.offcanvasService.open(this.shareTemplate, {
      position: this.deviceService.offcanvasPosition(),
      panelClass: "image-viewer-share-offcanvas"
    });
  }

  openComments(event: MouseEvent): void {
    if (event) {
      event.preventDefault();
    }

    this.offcanvasService.open(this.nestedCommentsTemplate, {
      position: this.deviceService.offcanvasPosition(),
      panelClass: "image-viewer-nested-comments-offcanvas"
    });
  }

  toggleViewMouseHover(): void {
    this.forceViewMouseHover = !this.forceViewMouseHover;
  }

  updateSupportsFullscreen(): void {
    this.supportsFullscreen = (
      this.revision &&
      !this.revision.videoFile &&
      (
        !this.revision.imageFile ||
        !this.revision.imageFile.toLowerCase().endsWith(".gif")
      )
    );
  }

  enterFullscreen(event: MouseEvent | null): void {
    if (event) {
      event.preventDefault();
    }

    if (this.supportsFullscreen) {
      this.store$.dispatch(new ShowFullscreenImage(this.image.pk));
      this.viewingFullscreenImage = true;

      this.windowRefService.pushState(
        {
          imageId: this.image.hash || this.image.pk,
          revisionLabel: this.revisionLabel,
          fullscreen: true
        },
        this._getPath(this.image, this.revisionLabel, true)
      );
    }
  }

  exitFullscreen(pushState: boolean): void {
    if (this.viewingFullscreenImage) {
      this.store$.dispatch(new HideFullscreenImage());
      this.viewingFullscreenImage = false;

      if (pushState) {
        this.windowRefService.pushState(
          {
            imageId: this.image.hash || this.image.pk,
            revisionLabel: this.revisionLabel
          },
          this._getPath(this.image, this.revisionLabel)
        );
      }
    }
  }

  close(): void {
    this.exitFullscreen(true);
    this.modalService.dismissAll();
    this.offcanvasService.dismiss();
    this.closeViewer.emit();
  }

  loadInlineSvg$(svgUrl: string): Observable<SafeHtml> {
    return this.http.get(svgUrl, { responseType: "text" }).pipe(
      map(svgContent => {
        this.onMouseHoverSvgLoad();
        return this.domSanitizer.bypassSecurityTrustHtml(svgContent);
      })
    );
  }

  onMouseHoverSvgLoad(): void {
    if (isPlatformBrowser(this.platformId)) {
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

        this.adjustSvgOverlay();
      });
    }
  }

  adjustSvgOverlay(): void {
    if (!this.imageArea) {
      return;
    }

    const imageAreaElement = this.imageArea.nativeElement as HTMLElement;
    const overlaySvgElement = imageAreaElement.querySelector(".mouse-hover-svg-container") as HTMLElement;

    if (!overlaySvgElement) {
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
  }

  protected navigationContextTrackByFn(
    index: number,
    item: ImageViewerNavigationContextItem
  ): ImageViewerNavigationContextItem["imageId"] {
    return item.imageId;
  }

  protected onNavigationContextClicked(index: number) {
    const imageId = this.navigationContext[index].imageId;
    this._navigateToImage(imageId, FINAL_REVISION_LABEL, false, true);
  }

  protected scrollNavigationContextLeft(): void {
    const el = this.navigationContextElement.nativeElement;
    el.scrollBy({
      left: -el.clientWidth,
      behavior: "smooth"
    });
  }

  protected scrollNavigationContextRight(): void {
    const el = this.navigationContextElement.nativeElement;
    el.scrollBy({
      left: el.clientWidth,
      behavior: "smooth"
    });
  }

  protected onButtonsAreaHidden() {
    if (this.scrollToTopMdMax) {
      this.renderer.setStyle(this.scrollToTopMdMax.nativeElement, "transform", "translateY(0)");
    }

    if (this.scrollToTopLgMin) {
      this.renderer.setStyle(this.scrollToTopLgMin.nativeElement, "transform", "translateY(0)");
    }
  }

  protected onButtonsAreaShown() {
    let amount: number;

    if (this.deviceService.xsMax()) {
      amount = -77;
    } else if (this.deviceService.mdMax()) {
      amount = -50;
    }

    if (amount) {
      if (this.scrollToTopMdMax) {
        this.renderer.setStyle(this.scrollToTopMdMax.nativeElement, "transform", `translateY(${amount}px)`);
      }

      if (this.scrollToTopLgMin) {
        this.renderer.setStyle(this.scrollToTopLgMin.nativeElement, "transform", `translateY(${amount}px)`);
      }
    }
  }

  protected getSharingValue(sharingMode: SharingMode): string {
    if (!this.revision) {
      return "";
    }

    const galleryThumbnailUrl = this.revision.thumbnails.find(thumbnail => thumbnail.alias === ImageAlias.GALLERY).url;
    const url = this.imageService.getShareUrl(this.image, this.revisionLabel);

    switch (sharingMode) {
      case SharingMode.LINK:
        return url;
      case SharingMode.BBCODE:
        return `[url=${url}][img]${galleryThumbnailUrl}[/img][/url]`;
      case SharingMode.HTML:
        return `<a href="${url}"><img src="${galleryThumbnailUrl}" /></a>`;
    }
  }

  private _setAd() {
    if (isPlatformServer(this.platformId)) {
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

      this.showAd = this.image.allowAds && showAds;

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

  private _ignoreNavigationEvent() {
    return this.offcanvasService.hasOpenOffcanvas() ||
      this.modalService.hasOpenModals() ||
      this.isLightBoxOpen;
  }

  private _navigateToImage(
    imageId: ImageInterface["hash"] | ImageInterface["pk"],
    revisionLabel: ImageRevisionInterface["label"],
    fullscreenMode: boolean,
    pushState: boolean
  ): void {
    this.modalService.dismissAll();
    this.offcanvasService.dismiss();
    this.exitFullscreen(false);
    this.imageLoaded = false;

    this.imageService.loadImage(imageId).subscribe({
      next: image => {
        this.setImage(
          image,
          revisionLabel,
          fullscreenMode,
          this.navigationContext,
          pushState
        );
      },
      error: err => {
        this.setImage(
          null,
          null,
          fullscreenMode,
          this.navigationContext,
          pushState
        );
      }
    });
    this.store$.dispatch(new LoadImage({ imageId }));
  }

  private _updateCurrentImageIndexInNavigationContext(): void {
    const byHash = this.navigationContext.findIndex(item => item.imageId === this.image.hash);
    const byPk = this.navigationContext.findIndex(item => {
        try {
          const itemImageIdAsNumber = parseInt(item.imageId + "", 10);
          const imagePkAsNumber = parseInt(this.image.pk + "", 10);
          return itemImageIdAsNumber === imagePkAsNumber;
        } catch (e) {
          return -1;
        }
      }
    );

    this.currentIndex = byHash !== -1 ? byHash : byPk;
  }

  private _updateNavigationContextInformation(): void {
    const previousIndex = this.currentIndex;

    this._updateCurrentImageIndexInNavigationContext();

    this.hasOtherImages = this.navigationContext.filter(item =>
      item.imageId !== this.image.hash &&
      item.imageId !== this.image.pk
    ).length > 0;

    if (
      this.currentIndex > previousIndex &&
      this.navigationContext.length > 5
      && this.currentIndex === this.navigationContext.length - 5
    ) {
      this.nearEndOfContext.emit(this.searchComponentId);
    }
  }

  private _recordHit() {
    const contentTypePayload = {
      appLabel: "astrobin",
      model: "image"
    };

    if (isPlatformServer(this.platformId)) {
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

  private _setMetaTags(): void {
    const maxDescriptionLength = 200;
    let description: string;
    let image: string;

    if (this.image.descriptionBbcode && this.image.descriptionBbcode.length > 0) {
      description = this.bbCodeToHtmlPipe.transform(this.image.descriptionBbcode).slice(0, maxDescriptionLength) + "...";
    } else if (this.image.description && this.image.description.length > 0) {
      description = this.image.description.slice(0, maxDescriptionLength) + "...";
    } else {
      description = this.translateService.instant("An image on AstroBin.");
    }

    if (this.image.thumbnails && this.image.thumbnails.length > 0) {
      image = this.image.thumbnails.find(thumbnail => thumbnail.alias === ImageAlias.REGULAR).url;
    }

    this.titleService.setTitle(this.image.title);
    this.titleService.setDescription(description);

    if (image) {
      this.titleService.addMetaTag({ property: "og:image", content: image });
    }

    this.titleService.addMetaTag({
      property: "og:url",
      content: this.windowRefService.getCurrentUrl().toString()
    });
  }

  private _getPath(
    image: ImageInterface,
    revisionLabel: ImageRevisionInterface["label"],
    fullscreenMode = false
  ): string {
    const revision = this.imageService.getRevision(image, revisionLabel);
    let path = this.location.path().split("#")[0];

    if (!path.includes(image.hash || image.pk + "")) {
      path = UtilsService.addOrUpdateUrlParam(path, "i", image.hash || ("" + image.pk));
    }

    if (
      revisionLabel !== FINAL_REVISION_LABEL &&
      (
        image.isFinal === false ||
        revisionLabel !== ORIGINAL_REVISION_LABEL
      )
    ) {
      path = UtilsService.addOrUpdateUrlParam(path, "r", revisionLabel);
    } else {
      path = UtilsService.removeUrlParam(path, "r");
    }

    if (fullscreenMode) {
      path += `#fullscreen`;
    }

    return path;
  }

  protected readonly ORIGINAL_REVISION_LABEL = ORIGINAL_REVISION_LABEL;
}
