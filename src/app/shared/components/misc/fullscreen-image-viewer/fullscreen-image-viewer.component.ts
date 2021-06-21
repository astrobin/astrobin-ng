import { Component, HostBinding, HostListener, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
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
import { distinctUntilChanged, filter, map, switchMap, take, tap } from "rxjs/operators";
import { ImageThumbnailInterface } from "@shared/interfaces/image-thumbnail.interface";

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

  @HostBinding("class")
  klass = "d-none";

  zoomLensSize: number;
  showZoomIndicator = false;
  isTouchDevice = false;

  hdThumbnail$: Observable<SafeUrl>;
  realThumbnail$: Observable<SafeUrl>;
  show$: Observable<boolean>;
  hdLoadingProgress$: Observable<number>;
  realLoadingProgress$: Observable<number>;

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
    public readonly domSanitizer: DomSanitizer
  ) {
    super();

    this.hdLoadingProgress$ = this._hdLoadingProgressSubject.asObservable();
    this.realLoadingProgress$ = this._realLoadingProgressSubject.asObservable();
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
      filter(thumbnail => !!thumbnail),
      switchMap(thumbnail =>
        this.imageService
          .loadImageFile(thumbnail.url, (progress: number) => {
            this._hdLoadingProgressSubject.next(progress);
          })
          .pipe(map(url => this.domSanitizer.bypassSecurityTrustUrl(url)))
      )
    );

    this.realThumbnail$ = this.store$.select(selectThumbnail, this._getRealOptions()).pipe(
      filter(thumbnail => !!thumbnail),
      switchMap(thumbnail =>
        this.imageService
          .loadImageFile(thumbnail.url, (progress: number) => {
            this._realLoadingProgressSubject.next(progress);
          })
          .pipe(map(url => this.domSanitizer.bypassSecurityTrustUrl(url)))
      ),
      tap(
        () =>
          (this._zoomReadyNotification = this.popNotificationsService.info(
            this.translateService.instant("Click on the image and scroll to magnify up to 8x."),
            this.translateService.instant("Zoom ready"),
            {
              progressBar: false,
              timeOut: 5000,
              positionClass: "toast-bottom-right"
            }
          ))
      )
    );

    this.show$ = this.store$.select(selectApp).pipe(
      map(state => state.currentFullscreenImage === this.id),
      distinctUntilChanged(),
      tap(show => {
        if (show) {
          this.store$.dispatch(new LoadThumbnail(this._getHdOptions()));

          if (!this.isTouchDevice) {
            this.store$.dispatch(new LoadThumbnail(this._getRealOptions()));
          }

          setTimeout(() => {
            this.klass = "d-flex";
          }, 1);
        } else {
          if (this._zoomReadyNotification) {
            this.popNotificationsService.clear(this._zoomReadyNotification.id);
          }

          setTimeout(() => {
            this.klass = "d-none";
          }, 1);
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
    if (this._zoomIndicatorTimeout) {
      clearTimeout(this._zoomIndicatorTimeout);
    }

    this._zoomIndicatorTimeout = this.windowRef.nativeWindow.setTimeout(() => {
      this.showZoomIndicator = false;
    }, this._zoomIndicatorTimeoutDuration);
  }

  private _getHdOptions(): Omit<ImageThumbnailInterface, "url"> {
    return {
      id: this.id,
      revision: this.revision,
      alias: ImageAlias.HD_ANONYMIZED
    };
  }

  private _getRealOptions(): Omit<ImageThumbnailInterface, "url"> {
    return {
      id: this.id,
      revision: this.revision,
      alias: ImageAlias.REAL_ANONYMIZED
    };
  }
}
