import { isPlatformBrowser } from "@angular/common";
import type { OnInit } from "@angular/core";
import { Component, Inject, PLATFORM_ID, ViewChild } from "@angular/core";
import type { ActivatedRoute } from "@angular/router";
import { AppActionTypes } from "@app/store/actions/app.actions";
import type { DeleteImageFailure, DeleteImageSuccess } from "@app/store/actions/image.actions";
import type { MainState } from "@app/store/state";
import type { ImageInterface, ImageRevisionInterface } from "@core/interfaces/image.interface";
import { FINAL_REVISION_LABEL } from "@core/interfaces/image.interface";
import type { ClassicRoutesService } from "@core/services/classic-routes.service";
import type { ImageService } from "@core/services/image/image.service";
import type { UserService } from "@core/services/user.service";
import type { UtilsService } from "@core/services/utils/utils.service";
import { distinctUntilChangedObj } from "@core/services/utils/utils.service";
import type { WindowRefService } from "@core/services/window-ref.service";
import { selectCurrentUser, selectCurrentUserProfile } from "@features/account/store/auth.selectors";
import type { Actions } from "@ngrx/effects";
import { ofType } from "@ngrx/effects";
import type { Store } from "@ngrx/store";
import type { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import type { ImageViewerComponent } from "@shared/components/misc/image-viewer/image-viewer.component";
import { forkJoin } from "rxjs";
import { filter, switchMap, take, takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-image-page",
  templateUrl: "./image-page.component.html",
  styleUrls: ["./image-page.component.scss"]
})
export class ImagePageComponent extends BaseComponentDirective implements OnInit {
  @ViewChild("imageViewer", { static: false })
  imageViewer: ImageViewerComponent;

  protected readonly isBrowser: boolean;
  protected image: ImageInterface;
  protected revisionLabel: ImageRevisionInterface["label"];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly route: ActivatedRoute,
    public readonly windowRefService: WindowRefService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly translateService: TranslateService,
    public readonly userService: UserService,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly imageService: ImageService,
    public readonly utilsService: UtilsService
  ) {
    super(store$);
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.route.data.pipe(takeUntil(this.destroyed$), distinctUntilChangedObj()).subscribe(data => {
      this.image = data.image;
      this.revisionLabel = this.route.snapshot.queryParams.r || FINAL_REVISION_LABEL;
      this.imageService.setMetaTags(this.image);
    });

    this._setupOnDelete();
  }

  private _setupOnDelete(): void {
    this.actions$
      .pipe(
        ofType(AppActionTypes.DELETE_IMAGE_SUCCESS, AppActionTypes.DELETE_IMAGE_FAILURE), // Listen for both success and failure
        filter((action: DeleteImageSuccess | DeleteImageFailure) => action.payload.pk === this.image.pk),
        switchMap(() =>
          forkJoin([
            this.store$.select(selectCurrentUser).pipe(take(1)),
            this.store$.select(selectCurrentUserProfile).pipe(take(1))
          ])
        ),
        take(1)
      )
      .subscribe(data => {
        this.userService.openGallery(data[0].username, data[1].enableNewGalleryExperience);
      });
  }
}
