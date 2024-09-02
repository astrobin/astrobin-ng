import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { FINAL_REVISION_LABEL, ImageInterface } from "@shared/interfaces/image.interface";
import { ImageViewerComponent } from "@shared/components/misc/image-viewer/image-viewer.component";
import { distinctUntilChangedObj } from "@shared/services/utils/utils.service";
import { filter, take, takeUntil } from "rxjs/operators";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { DeleteImageFailure, DeleteImageSuccess } from "@app/store/actions/image.actions";
import { WindowRefService } from "@shared/services/window-ref.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";

@Component({
  selector: "astrobin-image-page",
  templateUrl: "./image-page.component.html",
  styleUrls: ["./image-page.component.scss"]
})
export class ImagePageComponent extends BaseComponentDirective implements OnInit {
  @ViewChild("imageViewer", { static: true })
  imageViewer: ImageViewerComponent;

  protected image: ImageInterface;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly route: ActivatedRoute,
    public readonly windowRefService: WindowRefService,
    public readonly classicRoutesService: ClassicRoutesService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.route.data.pipe(
      takeUntil(this.destroyed$),
      distinctUntilChangedObj()
    ).subscribe(data => {
      this.image = data.image;

      if (this.image && this.imageViewer) {
        this.imageViewer.setImage(
          this.image,
          FINAL_REVISION_LABEL,
          false,
          [],
          false
        );
      }
    });

    this._setupOnDelete();
  }

  private _setupOnDelete(): void {
    this.actions$.pipe(
      ofType(AppActionTypes.DELETE_IMAGE_SUCCESS, AppActionTypes.DELETE_IMAGE_FAILURE), // Listen for both success and failure
      filter((action: DeleteImageSuccess | DeleteImageFailure) => action.payload.pk === this.image.pk),
      take(1)
    ).subscribe(() => {
      this.windowRefService.nativeWindow.location.href =
        this.classicRoutesService.GALLERY(this.image.username);
    });
  }
}
