import { Component, HostBinding, HostListener, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { HideFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import { LoadThumbnail } from "@app/store/actions/thumbnail.actions";
import { selectApp } from "@app/store/selectors/app/app.selectors";
import { selectThumbnail } from "@app/store/selectors/app/thumbnail.selectors";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { Coord } from "ngx-image-zoom";
import { Observable } from "rxjs";
import { distinctUntilChanged, filter, map, switchMap, tap } from "rxjs/operators";

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

  @HostBinding("class")
  klass = "d-none";

  zoomLensSize: number;
  showZoomIndicator = false;

  hdThumbnail$: Observable<string>;
  realThumbnail$: Observable<string>;
  show$: Observable<boolean>;

  private _zoomReadyNotification;
  private _zoomPosition: Coord;
  private _zoomScroll = 1;
  private _zoomIndicatorTimeout: number;
  private _zoomIndicatorTimeoutDuration = 3000;

  constructor(
    public readonly store$: Store<State>,
    public readonly windowRef: WindowRefService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translateService: TranslateService
  ) {
    super();
  }

  @HostListener("document:keydown.escape", ["$event"])
  onKeydownEscape(event: KeyboardEvent) {
    this.hide();
  }

  @HostListener("window:resize", ["$event"])
  onResize(event) {
    this._setZoomLensSize();
  }

  ngOnInit(): void {
    if (this.id === undefined) {
      throw new Error("Attribute 'id' is required");
    }

    this._setZoomLensSize();

    const hdOptions = {
      id: this.id,
      revision: this.revision,
      alias: ImageAlias.HD_ANONYMIZED
    };

    const realOptions = {
      id: this.id,
      revision: this.revision,
      alias: ImageAlias.REAL_ANONYMIZED
    };

    this.hdThumbnail$ = this.store$.select(selectThumbnail, hdOptions).pipe(
      filter(thumbnail => !!thumbnail),
      switchMap(
        thumbnail =>
          new Observable<string>(observer => {
            const image = new Image();
            image.onload = () => {
              observer.next(thumbnail.url);
              observer.complete();
            };
            image.src = thumbnail.url;
          })
      )
    );
    this.realThumbnail$ = this.store$.select(selectThumbnail, realOptions).pipe(
      filter(thumbnail => !!thumbnail),
      switchMap(
        thumbnail =>
          new Observable<string>(observer => {
            const image = new Image();
            image.onload = () => {
              observer.next(thumbnail.url);
              observer.complete();
            };
            image.src = thumbnail.url;
          })
      ),
      tap(
        () =>
          (this._zoomReadyNotification = this.popNotificationsService.info(
            this.translateService.instant("Click on the image scroll to magnify up to 8x."),
            null,
            { timeOut: 5000 }
          ))
      )
    );
    this.show$ = this.store$.select(selectApp).pipe(
      map(state => state.currentFullscreenImage === this.id),
      distinctUntilChanged(),
      tap(show => {
        if (show) {
          this.store$.dispatch(new LoadThumbnail(hdOptions));
          this.store$.dispatch(new LoadThumbnail(realOptions));
          this.klass = "d-block";
        } else {
          this.klass = "d-none";
        }
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.ngOnInit();
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

  hide(): void {
    if (this._zoomReadyNotification) {
      this.popNotificationsService.clear(this._zoomReadyNotification.id);
    }

    this.store$.dispatch(new HideFullscreenImage());
  }

  private _setZoomLensSize(): void {
    this.zoomLensSize = Math.floor(this.windowRef.nativeWindow.innerWidth / 3);
  }

  private _setZoomIndicatorTimeout(): void {
    if (this._zoomIndicatorTimeout) {
      clearTimeout(this._zoomIndicatorTimeout);
    }

    this._zoomIndicatorTimeout = setTimeout(() => {
      this.showZoomIndicator = false;
    }, this._zoomIndicatorTimeoutDuration);
  }
}
