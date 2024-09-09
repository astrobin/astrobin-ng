import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Inject, Input, OnChanges, OnInit, Output, PLATFORM_ID, SimpleChanges, ViewChild } from "@angular/core";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { HideFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import { LoadThumbnail, LoadThumbnailCancel } from "@app/store/actions/thumbnail.actions";
import { selectApp } from "@app/store/selectors/app/app.selectors";
import { selectThumbnail } from "@app/store/selectors/app/thumbnail.selectors";
import { MainState } from "@app/store/state";
import { select, Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { ImageService } from "@shared/services/image/image.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { Coord, NgxImageZoomComponent } from "ngx-image-zoom";
import { BehaviorSubject, Observable } from "rxjs";
import { distinctUntilChanged, filter, map, switchMap, take, takeUntil, tap } from "rxjs/operators";
import { ImageThumbnailInterface } from "@shared/interfaces/image-thumbnail.interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { isPlatformBrowser } from "@angular/common";
import { DeviceService } from "@shared/services/device.service";
import { CookieService } from "ngx-cookie";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";

@Component({
  selector: "astrobin-fullscreen-image-viewer",
  templateUrl: "./fullscreen-image-viewer.component.html",
  styleUrls: ["./fullscreen-image-viewer.component.scss"]
})
export class FullscreenImageViewerComponent extends BaseComponentDirective implements OnInit, OnChanges {
  @Input()
  id: number;

  @Input()
  revision = "final";

  @Input()
  anonymized = false;

  @Output()
  exitFullscreen = new EventEmitter<void>();

  @HostBinding("class")
  klass = "d-none";

  @ViewChild("ngxImageZoom", { static: false, read: NgxImageZoomComponent })
  ngxImageZoom: NgxImageZoomComponent;

  @ViewChild("ngxImageZoom", { static: false, read: ElementRef })
  ngxImageZoomEl: ElementRef;

  enableLens = true;
  zoomLensSize: number;
  showZoomIndicator = false;
  isTouchDevice = false;
  isLargeEnough = false;

  hdThumbnail$: Observable<SafeUrl>;
  realThumbnail$: Observable<SafeUrl>;
  show$: Observable<boolean>;
  hdImageLoadingProgress$: Observable<number>;
  realImageLoadingProgress$: Observable<number>;
  hdThumbnailLoading = false;
  realThumbnailLoading = false;
  ready = false;

  private _zoomPosition: Coord;
  private _zoomScroll = 1;
  private _zoomIndicatorTimeout: number;
  private _zoomIndicatorTimeoutDuration = 1000;
  private _hdLoadingProgressSubject = new BehaviorSubject<number>(0);
  private _realLoadingProgressSubject = new BehaviorSubject<number>(0);
  private readonly LENS_ENABLED_COOKIE_NAME = "astrobin-fullscreen-lens-enabled";

  constructor(
    public readonly store$: Store<MainState>,
    public readonly windowRef: WindowRefService,
    public readonly translateService: TranslateService,
    public readonly imageService: ImageService,
    public readonly domSanitizer: DomSanitizer,
    public readonly utilsService: UtilsService,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly deviceService: DeviceService,
    public readonly cookieService: CookieService,
    public readonly classicRoutesService: ClassicRoutesService
  ) {
    super(store$);

    this.hdImageLoadingProgress$ = this._hdLoadingProgressSubject.asObservable();
    this.realImageLoadingProgress$ = this._realLoadingProgressSubject.asObservable();
  }

  get zoomingEnabled(): boolean {
    return this.ngxImageZoom && (this.ngxImageZoom as any).zoomingEnabled;
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this._setZoomLensSize();
  }

  ngOnInit() {
    this.enableLens = this.cookieService.get(this.LENS_ENABLED_COOKIE_NAME) === "true";
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.id === undefined) {
      throw new Error("Attribute 'id' is required");
    }

    this._setZoomLensSize();

    this.isTouchDevice = this.deviceService.isTouchEnabled();

    this.store$.pipe(
      select(selectImage, this.id),
      filter(image => !!image),
      take(1)
    ).subscribe(image => {
      const revision = this.imageService.getRevision(image, this.revision);
      this.isLargeEnough = (
        revision.w > this.windowRef.nativeWindow.innerWidth ||
        revision.h > this.windowRef.nativeWindow.innerHeight
      );
    });

    this.hdThumbnail$ = this.store$.select(selectThumbnail, this._getHdOptions()).pipe(
      takeUntil(this.destroyed$),
      tap(() => (this.hdThumbnailLoading = true)),
      filter(thumbnail => !!thumbnail),
      switchMap(thumbnail =>
        this.imageService.loadImageFile(thumbnail.url, (progress: number) => {
          this._hdLoadingProgressSubject.next(progress);
          if (progress >= 100) {
            this.hdThumbnailLoading = false;
          }
        })
      ),
      map(url => this.domSanitizer.bypassSecurityTrustUrl(url)),
      tap(() => this.store$.dispatch(new LoadThumbnail({ data: this._getRealOptions(), bustCache: false })))
    );

    this.realThumbnail$ = this.store$.select(selectThumbnail, this._getRealOptions()).pipe(
      takeUntil(this.destroyed$),
      tap(() => (this.realThumbnailLoading = true)),
      filter(thumbnail => !!thumbnail),
      switchMap(thumbnail =>
        this.imageService.loadImageFile(thumbnail.url, (progress: number) => {
          this._realLoadingProgressSubject.next(progress);
          if (progress >= 100) {
            this.realThumbnailLoading = false;
          }
        })
      ),
      map(url => this.domSanitizer.bypassSecurityTrustUrl(url))
    );

    this.show$ = this.store$.select(selectApp).pipe(
      takeUntil(this.destroyed$),
      map(state => state.currentFullscreenImage === this.id),
      distinctUntilChanged(),
      tap(show => {
        if (show) {
          this.store$.dispatch(new LoadThumbnail({ data: this._getHdOptions(), bustCache: false }));

          this.utilsService.delay(1).subscribe(() => {
            this.klass = "d-flex";
          });
        } else {
          this.utilsService.delay(1).subscribe(() => {
            this.klass = "d-none";
          });
        }
      })
    );
  }

  onImagesLoaded(loaded: boolean) {
    this.ready = loaded;
    // Prevents the jarring resetting of the zoom when the mouse wanders off the image.
    this.utilsService.delay(100).subscribe(() => {
      if (this.ngxImageZoom) {
        (this.ngxImageZoom as any).clickMouseLeave = () => {
        };
      }
    });
  }

  setZoomPosition(position: Coord) {
    this._zoomPosition = position;
    this.showZoomIndicator = true;
    this._setZoomIndicatorTimeout();
  }

  getZoomIndicatorStyle(): { left: string; top: string, transform: string } {
    if (!this._zoomPosition) {
      return { left: "0", top: "0", transform: "none" };
    }

    if (!this.enableLens) {
      return {
        top: "1.25rem",
        left: "3.5rem",
        transform: "none"
      };
    }

    const x = this._zoomPosition.x;
    const y = this._zoomPosition.y;

    return {
      top: `calc(${y}px + ${this.zoomLensSize / 2}px)`,
      left: `${x}px`,
      transform: `translate(-50%, 20%)`
    };
  }

  setZoomScroll(scroll: number) {
    this._zoomScroll = scroll;
    this.showZoomIndicator = true;
    this._setZoomIndicatorTimeout();
  }

  getZoomScroll(): number {
    return this._zoomScroll;
  }

  toggleEnableLens(): void {
    this.enableLens = !this.enableLens;
    this.cookieService.put(this.LENS_ENABLED_COOKIE_NAME, this.enableLens.toString());
    if (this.enableLens) {
      this._setZoomLensSize();
    }
  }

  @HostListener("window:keyup.escape", ["$event"])
  hide(event: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.store$
      .select(selectApp)
      .pipe(
        map(state => state.currentFullscreenImage === this.id),
        take(1)
      )
      .subscribe(shown => {
        if (shown) {
          this.store$.dispatch(new HideFullscreenImage());
          this.store$.dispatch(new LoadThumbnailCancel(this._getHdOptions()));
          this.store$.dispatch(new LoadThumbnailCancel(this._getRealOptions()));
          this.exitFullscreen.emit();
        }
      });
  }

  private _setZoomLensSize(): void {
    this.zoomLensSize = Math.floor(this.windowRef.nativeWindow.innerWidth / 4);
    if (this.ngxImageZoom) {
      this.ngxImageZoom.lensWidth = this.zoomLensSize;
      this.ngxImageZoom.lensHeight = this.zoomLensSize;
    }
  }

  private _setZoomIndicatorTimeout(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this._zoomIndicatorTimeout) {
        clearTimeout(this._zoomIndicatorTimeout);
      }

      this._zoomIndicatorTimeout = this.windowRef.nativeWindow.setTimeout(() => {
        this.showZoomIndicator = false;
      }, this._zoomIndicatorTimeoutDuration);
    }
  }

  private _getHdOptions(): Omit<ImageThumbnailInterface, "url"> {
    return {
      id: this.id,
      revision: this.revision,
      alias: this.anonymized ? ImageAlias.HD_ANONYMIZED : ImageAlias.QHD
    };
  }

  private _getRealOptions(): Omit<ImageThumbnailInterface, "url"> {
    return {
      id: this.id,
      revision: this.revision,
      alias: this.anonymized ? ImageAlias.REAL_ANONYMIZED : ImageAlias.REAL
    };
  }
}
