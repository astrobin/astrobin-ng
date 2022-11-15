import {
  Component,
  HostBinding,
  HostListener,
  Inject,
  Input,
  OnChanges,
  PLATFORM_ID,
  SimpleChanges
} from "@angular/core";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { HideFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import { LoadThumbnail, LoadThumbnailCancel } from "@app/store/actions/thumbnail.actions";
import { selectApp } from "@app/store/selectors/app/app.selectors";
import { selectThumbnail } from "@app/store/selectors/app/thumbnail.selectors";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { ImageService } from "@shared/services/image/image.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { Coord } from "ngx-image-zoom";
import { BehaviorSubject, Observable } from "rxjs";
import { distinctUntilChanged, filter, map, switchMap, take, takeUntil, tap } from "rxjs/operators";
import { ImageThumbnailInterface } from "@shared/interfaces/image-thumbnail.interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { isPlatformBrowser } from "@angular/common";

@Component({
  selector: "astrobin-fullscreen-image-viewer",
  templateUrl: "./fullscreen-image-viewer.component.html",
  styleUrls: ["./fullscreen-image-viewer.component.scss"]
})
export class FullscreenImageViewerComponent extends BaseComponentDirective implements OnChanges {
  @Input()
  id: number;

  @Input()
  revision = "final";

  @Input()
  anonymized = false;

  @HostBinding("class")
  klass = "d-none";

  zoomLensSize: number;
  showZoomIndicator = false;
  isTouchDevice = false;

  hdThumbnail$: Observable<SafeUrl>;
  realThumbnail$: Observable<SafeUrl>;
  show$: Observable<boolean>;
  hdImageLoadingProgress$: Observable<number>;
  realImageLoadingProgress$: Observable<number>;
  hdThumbnailLoading = false;
  realThumbnailLoading = false;

  private _zoomReadyNotification;
  private _zoomPosition: Coord;
  private _zoomScroll = 1;
  private _zoomIndicatorTimeout: number;
  private _zoomIndicatorTimeoutDuration = 3000;
  private _hdLoadingProgressSubject = new BehaviorSubject<number>(0);
  private _realLoadingProgressSubject = new BehaviorSubject<number>(0);

  constructor(
    public readonly store$: Store<State>,
    public readonly windowRef: WindowRefService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translateService: TranslateService,
    public readonly imageService: ImageService,
    public readonly domSanitizer: DomSanitizer,
    public readonly utilsService: UtilsService,
    @Inject(PLATFORM_ID) public readonly platformId
  ) {
    super(store$);

    this.hdImageLoadingProgress$ = this._hdLoadingProgressSubject.asObservable();
    this.realImageLoadingProgress$ = this._realLoadingProgressSubject.asObservable();
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this._setZoomLensSize();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.id === undefined) {
      throw new Error("Attribute 'id' is required");
    }

    this._setZoomLensSize();

    const document = this.windowRef.nativeWindow.document;
    if (document && "ontouchend" in document) {
      this.isTouchDevice = true;
    }

    this.hdThumbnail$ = this.store$.select(selectThumbnail, this._getHdOptions()).pipe(
      takeUntil(this.destroyed$),
      tap(() => (this.hdThumbnailLoading = true)),
      filter(thumbnail => !!thumbnail),
      switchMap(thumbnail =>
        this.imageService.loadImageFile(thumbnail.url, (progress: number) => {
          this._hdLoadingProgressSubject.next(progress);
          if (progress > 0) {
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
          if (progress > 0) {
            this.realThumbnailLoading = false;
          }
        })
      ),
      map(url => this.domSanitizer.bypassSecurityTrustUrl(url)),
      tap(() => {
        const message = this.isTouchDevice
          ? this.translateService.instant("Pinch & zoom to view details closer.")
          : this.translateService.instant("Click on the image and scroll to magnify up to 8x.");

        this._zoomReadyNotification = this.popNotificationsService.info(
          message,
          this.translateService.instant("Zoom ready"),
          {
            progressBar: false,
            timeOut: 5000,
            positionClass: "toast-bottom-right"
          }
        );
      })
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
          if (this._zoomReadyNotification) {
            this.popNotificationsService.clear(this._zoomReadyNotification.id);
          }

          this.utilsService.delay(1).subscribe(() => {
            this.klass = "d-none";
          });
        }
      })
    );
  }

  setZoomPosition(position: Coord) {
    this._zoomPosition = position;
    this.showZoomIndicator = true;
    this._setZoomIndicatorTimeout();
  }

  getZoomPosition(): Coord {
    return this._zoomPosition;
  }

  setZoomScroll(scroll: number) {
    this._zoomScroll = scroll;
    this.showZoomIndicator = true;
    this._setZoomIndicatorTimeout();
  }

  getZoomScroll(): number {
    return this._zoomScroll;
  }

  @HostListener("document:keyup.escape", ["$event"])
  hide(): void {
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
        }
      });
  }

  private _setZoomLensSize(): void {
    this.zoomLensSize = Math.floor(this.windowRef.nativeWindow.innerWidth / 3);
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
      alias: this.anonymized ? ImageAlias.HD_ANONYMIZED : ImageAlias.HD
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
