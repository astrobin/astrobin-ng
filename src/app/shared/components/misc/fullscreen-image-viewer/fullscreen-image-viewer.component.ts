import { Component, HostBinding, HostListener, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { HideFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import { LoadThumbnail } from "@app/store/actions/thumbnail.actions";
import { selectApp } from "@app/store/selectors/app/app.selectors";
import { selectThumbnail } from "@app/store/selectors/app/thumbnail.selectors";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { ImageThumbnailInterface } from "@shared/interfaces/image-thumbnail.interface";
import { WindowRefService } from "@shared/services/window-ref.service";
import { Observable } from "rxjs";
import { distinctUntilChanged, map, tap } from "rxjs/operators";

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

  thumbnail$: Observable<ImageThumbnailInterface>;
  show$: Observable<boolean>;

  constructor(public readonly store$: Store<State>, public readonly windowRef: WindowRefService) {
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

    const options = {
      id: this.id,
      revision: this.revision,
      alias: ImageAlias.REAL
    };

    this.thumbnail$ = this.store$.select(selectThumbnail, options);
    this.show$ = this.store$.select(selectApp).pipe(
      map(state => state.currentFullscreenImage === this.id),
      distinctUntilChanged(),
      tap(show => {
        if (show) {
          this.store$.dispatch(new LoadThumbnail(options));
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

  hide(): void {
    this.store$.dispatch(new HideFullscreenImage());
  }

  private _setZoomLensSize(): void {
    this.zoomLensSize = Math.floor(this.windowRef.nativeWindow.innerWidth / 4);
  }
}
