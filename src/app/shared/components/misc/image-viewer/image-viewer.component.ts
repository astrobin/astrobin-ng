import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Inject, Input, OnInit, Output, PLATFORM_ID, TemplateRef, ViewChild } from "@angular/core";
import { FINAL_REVISION_LABEL, ImageInterface, ImageRevisionInterface, MouseHoverImageOptions, ORIGINAL_REVISION_LABEL } from "@shared/interfaces/image.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { select, Store } from "@ngrx/store";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { DeviceService } from "@shared/services/device.service";
import { LoadImage } from "@app/store/actions/image.actions";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { filter, map, switchMap, take } from "rxjs/operators";
import { ImageService } from "@shared/services/image/image.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { SearchService } from "@features/search/services/search.service";
import { Router } from "@angular/router";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { LoadContentType } from "@app/store/actions/content-type.actions";
import { selectContentType } from "@app/store/selectors/app/content-type.selectors";
import { NgbModal, NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { NestedCommentsAutoStartTopLevelStrategy } from "@shared/components/misc/nested-comments/nested-comments.component";
import { HideFullscreenImage, ShowFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import { Observable, of } from "rxjs";
import { isPlatformBrowser, isPlatformServer } from "@angular/common";
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

enum SharingMode {
  LINK = "link",
  BBCODE = "bbcode",
  HTML = "html"
}

@Component({
  selector: "astrobin-image-viewer",
  templateUrl: "./image-viewer.component.html",
  styleUrls: ["./image-viewer.component.scss"]
})
export class ImageViewerComponent extends BaseComponentDirective implements OnInit {
  @Input()
  image: ImageInterface;

  @Input()
  revisionLabel = FINAL_REVISION_LABEL;

  @Input()
  navigationContext: (ImageInterface["hash"] | ImageInterface["pk"])[];

  @Input()
  fullscreenMode = false;

  @Input()
  showCloseButton = false;

  @Output()
  closeViewer = new EventEmitter<void>();

  @Output()
  initialized = new EventEmitter<void>();

  @ViewChild("imageArea")
  imageArea: ElementRef;

  @ViewChild("nestedCommentsTemplate")
  nestedCommentsTemplate: TemplateRef<any>;

  @ViewChild("shareTemplate")
  shareTemplate: TemplateRef<any>;

  @ViewChild("histogramModalTemplate")
  histogramModalTemplate: TemplateRef<any>;

  @ViewChild("skyplotModalTemplate")
  skyplotModalTemplate: TemplateRef<any>;

  @ViewChild("mouseHoverSvgObject", { static: false })
  mouseHoverSvgObject: ElementRef;
  protected readonly ImageAlias = ImageAlias;
  // This is computed from `image` and `revisionLabel` and is used to display data for the current revision.
  protected revision: ImageInterface | ImageRevisionInterface;
  protected loading = false;
  protected imageLoaded = false;
  protected alias: ImageAlias;
  protected hasOtherImages = false;
  protected currentIndex = null;
  protected imageContentType: ContentTypeInterface;
  protected userContentType: ContentTypeInterface;
  protected viewingFullscreenImage = false;
  protected showRevisions = false;
  protected loadingHistogram = false;
  protected histogram: string;
  protected mouseHoverImage: string;
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
  protected readonly MouseHoverImageOptions = MouseHoverImageOptions;
  protected readonly NestedCommentsAutoStartTopLevelStrategy = NestedCommentsAutoStartTopLevelStrategy;

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
    public readonly translateService: TranslateService
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

  setImage(
    image: ImageInterface,
    revisionLabel: ImageRevisionInterface["label"],
    navigationContext: (ImageInterface["pk"] | ImageInterface["hash"])[]
  ): void {
    this.imageLoaded = false;
    this.image = image;
    this.revisionLabel = revisionLabel;
    this.navigationContext = [...navigationContext];
    this.revision = this.imageService.getRevision(this.image, this.revisionLabel);
    this.setMouseHoverImage();
    this._updateNavigationContextInformation();
    this._recordHit();
  }

  setMouseHoverImage() {
    switch (this.revision.mouseHoverImage) {
      case MouseHoverImageOptions.NOTHING:
        this.mouseHoverImage = null;
        this.inlineSvg = null;
        break;
      case MouseHoverImageOptions.SOLUTION:
        if (this.revision?.solution?.pixinsightSvgAnnotationRegular) {
          this.mouseHoverImage = null;
          this.loadInlineSvg$(
            environment.classicApiUrl + `/platesolving/solution/${this.revision.solution.id}/svg/regular/`
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

  @HostListener("document:keydown.escape", ["$event"])
  handleEscapeKey(event: KeyboardEvent) {
    if (this.viewingFullscreenImage) {
      this.exitFullscreen();
      return;
    }

    if (this.offcanvasService.hasOpenOffcanvas()) {
      return;
    }

    this.close();
  }

  updateCurrentImageIndexInNavigationContext(): void {
    const byHash = this.navigationContext.indexOf(this.image.hash);
    const byPk = this.navigationContext.indexOf(this.image.pk);

    this.currentIndex = byHash !== -1 ? byHash : byPk;
  }

  loadNextImages(n: number): void {
    for (let i = 1; i <= n; i++) {
      const nextIndex = this.currentIndex + i;
      if (nextIndex < this.navigationContext.length) {
        this.store$.dispatch(new LoadImage({ imageId: this.navigationContext[nextIndex] }));
      }
    }
  }

  loadPreviousImages(n: number): void {
    for (let i = 1; i <= n; i++) {
      const previousIndex = this.currentIndex - i;
      if (previousIndex >= 0) {
        this.store$.dispatch(new LoadImage({ imageId: this.navigationContext[previousIndex] }));
      }
    }
  }

  @HostListener("document:keydown.arrowRight", ["$event"])
  onNextClicked(): void {
    this.modalService.dismissAll();

    if (this.currentIndex < this.navigationContext.length - 1) {
      this.store$.pipe(
        select(selectImage, this.navigationContext[this.currentIndex + 1]),
        filter(image => !!image),
        take(1)
      ).subscribe((image: ImageInterface) => {
        this.setImage(image, FINAL_REVISION_LABEL, this.navigationContext);
      });
    }
  }

  @HostListener("document:keydown.arrowLeft", ["$event"])
  onPreviousClicked(): void {
    this.modalService.dismissAll();

    if (this.currentIndex > 0) {
      this.store$.pipe(
        select(selectImage, this.navigationContext[this.currentIndex - 1]),
        filter(image => !!image),
        take(1)
      ).subscribe((image: ImageInterface) => {
        this.setImage(image, FINAL_REVISION_LABEL, this.navigationContext);
      });
    }
  }

  @HostListener("window:resize")
  onResize(): void {
    this.adjustSvgOverlay();
  }

  onImageLoaded(): void {
    this.imageLoaded = true;
  }

  onRevisionSelected(revisionLabel: ImageRevisionInterface["label"]): void {
    if (this.revisionLabel === revisionLabel) {
      return;
    }

    this.imageLoaded = false;
    this.revisionLabel = revisionLabel;
    this.revision = this.imageService.getRevision(this.image, this.revisionLabel);
    this.setMouseHoverImage();
  }

  openShare(event: MouseEvent): void {
    event.preventDefault();

    this.shareModel = {
      sharingMode: SharingMode.LINK,
      copyThis: this.getSharingValue(SharingMode.LINK)
    };

    const position = this.deviceService.smMax() ? "bottom" : "end";
    this.offcanvasService.open(this.shareTemplate, {
      position,
      panelClass: "image-viewer-share-offcanvas"
    });
  }

  openComments(event: MouseEvent): void {
    event.preventDefault();

    const position = this.deviceService.smMax() ? "bottom" : "end";
    this.offcanvasService.open(this.nestedCommentsTemplate, {
      position,
      panelClass: "image-viewer-nested-comments-offcanvas"
    });
  }

  openHistogram(event: MouseEvent): void {
    event.preventDefault();

    if (this.loadingHistogram) {
      return;
    }

    this.modalService.open(this.histogramModalTemplate, { size: "sm" });
    this.loadingHistogram = true;

    this.imageApiService.getThumbnail(
      this.image.hash || this.image.pk, this.revisionLabel, ImageAlias.HISTOGRAM
    ).subscribe(thumbnail => {
      this.loadingHistogram = false;
      this.histogram = thumbnail.url;
    });
  }

  openSkyplot(event: MouseEvent): void {
    event.preventDefault();

    this.modalService.open(this.skyplotModalTemplate, { size: "md" });
  }

  enterFullscreen(event: MouseEvent): void {
    event.preventDefault();

    if (!this.revision.videoFile) {
      this.store$.dispatch(new ShowFullscreenImage(this.image.pk));
      this.viewingFullscreenImage = true;
    }
  }

  exitFullscreen(): void {
    this.store$.dispatch(new HideFullscreenImage());
    this.viewingFullscreenImage = false;
  }

  close(): void {
    this.exitFullscreen();
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
    const imageAreaElement = this.imageArea.nativeElement as HTMLElement;
    const overlaySvgElement = imageAreaElement.querySelector(".mouse-hover-svg-container") as HTMLElement;

    if (!overlaySvgElement) {
      return;
    }

    // Get the dimensions of the container and the image
    const containerWidth = imageAreaElement.clientWidth;
    const containerHeight = imageAreaElement.clientHeight;

    const naturalWidth = this.image.w;
    const naturalHeight = this.image.h;

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

  protected getSharingValue(sharingMode: SharingMode): string {
    if (!this.revision) {
      return "";
    }

    const baseUrl = this.windowRefService.nativeWindow.location.origin;
    const imagePath = `/i/${this.image.hash || this.image.pk}/`;
    const galleryThumbnailUrl = this.revision.thumbnails.find(thumbnail => thumbnail.alias === ImageAlias.GALLERY).url;
    const url = baseUrl + imagePath;

    switch (sharingMode) {
      case SharingMode.LINK:
        return url;
      case SharingMode.BBCODE:
        return `[url=${url}][img]${galleryThumbnailUrl}[/img][/url]`;
      case SharingMode.HTML:
        return `<a href="${url}"><img src="${galleryThumbnailUrl}" /></a>`;
    }
  }

  private _updateNavigationContextInformation(): void {
    this.hasOtherImages = this.navigationContext.filter(id => id !== this.image.hash && id !== this.image.pk).length > 0;
    this.updateCurrentImageIndexInNavigationContext();
    this.loadNextImages(5);
    this.loadPreviousImages(5);
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
}
