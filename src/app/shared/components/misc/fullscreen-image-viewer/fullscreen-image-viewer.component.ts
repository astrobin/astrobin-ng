import { Component, ElementRef, EventEmitter, HostBinding, HostListener, Inject, Input, OnChanges, OnDestroy, OnInit, Output, PLATFORM_ID, SimpleChanges, ViewChild } from "@angular/core";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { HideFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import { LoadThumbnail, LoadThumbnailCancel } from "@app/store/actions/thumbnail.actions";
import { selectCurrentFullscreenImage } from "@app/store/selectors/app/app.selectors";
import { selectThumbnail } from "@app/store/selectors/app/thumbnail.selectors";
import { MainState } from "@app/store/state";
import { select, Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { ImageService } from "@shared/services/image/image.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { Coord, NgxImageZoomComponent } from "ngx-image-zoom";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { distinctUntilChanged, filter, map, switchMap, take, tap } from "rxjs/operators";
import { ImageThumbnailInterface } from "@shared/interfaces/image-thumbnail.interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { isPlatformBrowser } from "@angular/common";
import { DeviceService } from "@shared/services/device.service";
import { CookieService } from "ngx-cookie";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";

@Component({
  selector: "astrobin-fullscreen-image-viewer",
  templateUrl: "./fullscreen-image-viewer.component.html",
  styleUrls: ["./fullscreen-image-viewer.component.scss"]
})
export class FullscreenImageViewerComponent extends BaseComponentDirective implements OnInit, OnChanges, OnDestroy {
  @Input()
  id: ImageInterface["pk"];

  @Input()
  revision = "final";

  @Input()
  anonymized = false;

  @Output()
  enterFullscreen = new EventEmitter<void>();

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

  hdThumbnail: SafeUrl;
  realThumbnail: SafeUrl;
  show: boolean = false;
  hdImageLoadingProgress$: Observable<number>;
  realImageLoadingProgress$: Observable<number>;
  hdThumbnailLoading = false;
  realThumbnailLoading = false;
  ready = false;

  private _imageSubscription: Subscription;
  private _hdThumbnailSubscription: Subscription;
  private _realThumbnailSubscription: Subscription;
  private _currentFullscreenImageSubscription: Subscription;
  private _zoomPosition: Coord;
  private _zoomScroll = 1;
  private _zoomIndicatorTimeout: number;
  private _zoomIndicatorTimeoutDuration = 1000;
  private _hdLoadingProgressSubject = new BehaviorSubject<number>(0);
  private _realLoadingProgressSubject = new BehaviorSubject<number>(0);
  private readonly LENS_ENABLED_COOKIE_NAME = "astrobin-fullscreen-lens-enabled";

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly windowRef: WindowRefService,
    public readonly translateService: TranslateService,
    public readonly imageService: ImageService,
    public readonly domSanitizer: DomSanitizer,
    public readonly utilsService: UtilsService,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly deviceService: DeviceService,
    public readonly cookieService: CookieService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly windowRefService: WindowRefService
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
    this.isTouchDevice = this.deviceService.isTouchEnabled();
    this.enableLens = this.cookieService.get(this.LENS_ENABLED_COOKIE_NAME) === "true";
    this._setZoomLensSize();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.id === undefined) {
      throw new Error("Attribute 'id' is required");
    }

    if (this._imageSubscription) {
      this._imageSubscription.unsubscribe();
    }

    this._imageSubscription = this.store$.pipe(
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

    if (this._hdThumbnailSubscription) {
      this._hdThumbnailSubscription.unsubscribe();
    }

    this._hdThumbnailSubscription = this.store$.select(selectThumbnail, this._getHdOptions()).pipe(
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
    ).subscribe(url => {
      this.hdThumbnail = url;
    });

    if (this._realThumbnailSubscription) {
      this._realThumbnailSubscription.unsubscribe();
    }

    this._realThumbnailSubscription = this.store$.select(selectThumbnail, this._getRealOptions()).pipe(
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
    ).subscribe(url => {
      this.realThumbnail = url;
    });

    if (this._currentFullscreenImageSubscription) {
      this._currentFullscreenImageSubscription.unsubscribe();
    }

    this._currentFullscreenImageSubscription = this.store$.pipe(
      select(selectCurrentFullscreenImage),
      distinctUntilChanged(),
      filter(currentFullscreenImage => currentFullscreenImage === this.id)
    ).subscribe(() => {
      this.actions$.pipe(
        ofType(AppActionTypes.HIDE_FULLSCREEN_IMAGE),
        take(1)
      ).subscribe(() => {
        this.show = false;
        this.klass = "d-none";
        this.hdThumbnail = null;
        this.realThumbnail = null;
        this.exitFullscreen.emit();
      });

      this.show = true;
      this.klass = "d-flex";
      this.enterFullscreen.emit();
      this.store$.dispatch(new LoadThumbnail({ data: this._getHdOptions(), bustCache: false }));
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();

    if (this._imageSubscription) {
      this._imageSubscription.unsubscribe();
    }

    if (this._hdThumbnailSubscription) {
      this._hdThumbnailSubscription.unsubscribe();
    }

    if (this._realThumbnailSubscription) {
      this._realThumbnailSubscription.unsubscribe();
    }

    if (this._currentFullscreenImageSubscription) {
      this._currentFullscreenImageSubscription.unsubscribe();
    }
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

    this.store$.dispatch(new HideFullscreenImage());
    this.store$.dispatch(new LoadThumbnailCancel({ thumbnail: this._getHdOptions() }));
    this.store$.dispatch(new LoadThumbnailCancel({ thumbnail: this._getRealOptions() }));
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
