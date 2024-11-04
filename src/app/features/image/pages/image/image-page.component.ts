import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { FINAL_REVISION_LABEL, ImageInterface } from "@shared/interfaces/image.interface";
import { ImageViewerComponent } from "@shared/components/misc/image-viewer/image-viewer.component";
import { distinctUntilChangedObj } from "@shared/services/utils/utils.service";
import { filter, switchMap, take, takeUntil } from "rxjs/operators";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { DeleteImageFailure, DeleteImageSuccess } from "@app/store/actions/image.actions";
import { WindowRefService } from "@shared/services/window-ref.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { TitleService } from "@shared/services/title/title.service";
import { TranslateService } from "@ngx-translate/core";
import { UserService } from "@shared/services/user.service";
import { LoadUser } from "@features/account/store/auth.actions";
import { selectCurrentUser, selectCurrentUserProfile } from "@features/account/store/auth.selectors";
import { concat, forkJoin } from "rxjs";

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
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly titleService: TitleService,
    public readonly translateService: TranslateService,
    public readonly userService: UserService
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
          this.route.snapshot.queryParams.r || FINAL_REVISION_LABEL
        );
      }
    });

    this._setupOnDelete();
  }

  private _setupOnDelete(): void {
    this.actions$.pipe(
      ofType(AppActionTypes.DELETE_IMAGE_SUCCESS, AppActionTypes.DELETE_IMAGE_FAILURE), // Listen for both success and failure
      filter((action: DeleteImageSuccess | DeleteImageFailure) => action.payload.pk === this.image.pk),
      switchMap(() =>
        forkJoin([
          this.store$.select(selectCurrentUser).pipe(take(1)),
          this.store$.select(selectCurrentUserProfile).pipe(take(1))
        ])),
      take(1)
    ).subscribe(data => {
      this.userService.openGallery(data[0].username, data[1].enableNewGalleryExperience);
    });
  }
}
