import { Location } from "@angular/common";
import { ComponentRef, Inject, Injectable, PLATFORM_ID, ViewContainerRef } from "@angular/core";
import { FINAL_REVISION_LABEL, ImageInterface, ImageRevisionInterface } from "@shared/interfaces/image.interface";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { DeleteImageSuccess } from "@app/store/actions/image.actions";
import { map, switchMap, takeUntil } from "rxjs/operators";
import { ImageViewerComponent, ImageViewerNavigationContext } from "@shared/components/misc/image-viewer/image-viewer.component";
import { WindowRefService } from "@shared/services/window-ref.service";
import { HideFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import { UtilsService } from "@shared/services/utils/utils.service";
import { DeviceService } from "@shared/services/device.service";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { ActivatedRoute, Router } from "@angular/router";
import { TitleService } from "@shared/services/title/title.service";
import { ImageService } from "@shared/services/image/image.service";

@Injectable({
  providedIn: "root"
})
export class ImageViewerService extends BaseService {
  activeImageViewer?: ComponentRef<ImageViewerComponent>;

  constructor(
    public readonly loadingService: LoadingService,
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly windowRefService: WindowRefService,
    public readonly location: Location,
    public readonly deviceService: DeviceService,
    public readonly router: Router,
    public readonly titleService: TitleService,
    public readonly imageService: ImageService
  ) {
    super(loadingService);

    this.actions$.pipe(
      ofType(AppActionTypes.DELETE_IMAGE_SUCCESS),
      takeUntil(this.destroyed$),
      map((action: DeleteImageSuccess) => action.payload.pk)
    ).subscribe((pk: ImageInterface["pk"]) => {
      if (this.activeImageViewer && this.activeImageViewer.instance.image.pk === pk) {
        this.closeActiveImageViewer(false);
      }
    });
  }

  autoOpenImageViewer(activatedRoute: ActivatedRoute, componentId: string, viewContainerRef: ViewContainerRef): void {
    const queryParams = activatedRoute.snapshot.queryParams;

    if (queryParams["i"]) {
      this.openImageViewer(
        queryParams["i"],
        queryParams["r"] || FINAL_REVISION_LABEL,
        activatedRoute.snapshot.fragment?.includes("fullscreen"),
        componentId,
        [],
        viewContainerRef
      );
    }
  }

  openImageViewer(
    imageId: ImageInterface["hash"] | ImageInterface["pk"],
    revisionLabel: ImageRevisionInterface["label"],
    fullscreenMode: boolean,
    searchComponentId: string,
    navigationContext: ImageViewerNavigationContext,
    viewContainerRef: ViewContainerRef
  ): ComponentRef<ImageViewerComponent> {
    const currentPageTitle = this.titleService.getTitle();

    if (this.activeImageViewer) {
      return this.activeImageViewer;
    }

    this.activeImageViewer = viewContainerRef.createComponent(ImageViewerComponent);
    this.activeImageViewer.instance.showCloseButton = true;
    this.activeImageViewer.instance.fullscreenMode = true;
    this.activeImageViewer.instance.searchComponentId = searchComponentId;

    this.activeImageViewer.instance.initialized.pipe(
      switchMap(() => this.imageService.loadImage(imageId))
    ).subscribe({
      next: image => {
        this.activeImageViewer.instance.setImage(
          image,
          revisionLabel,
          fullscreenMode,
          navigationContext,
          true
        );
      },
      error: err => {
        this.activeImageViewer.instance.setImage(
          null,
          null,
          fullscreenMode,
          navigationContext,
          true
        );
      }
    });

    this.activeImageViewer.instance.closeViewer.subscribe(() => {
      this.closeActiveImageViewer(true);
      this.titleService.setTitle(currentPageTitle);
    });

    this._stopBodyScrolling();

    return this.activeImageViewer;
  }

  closeActiveImageViewer(pushState: boolean): void {
    if (this.activeImageViewer) {
      this.store$.dispatch(new HideFullscreenImage());
      this.activeImageViewer.destroy();
      this.activeImageViewer = undefined;
      this._resumeBodyScrolling();

      if (pushState) {
        let path = UtilsService.removeUrlParam(this.location.path(), "i");
        path = UtilsService.removeUrlParam(path, "r");
        path = path.split("#")[0];

        this.windowRefService.pushState(
          {},
          path
        );
      }
    }
  }

  private _stopBodyScrolling(): void {
    this.windowRefService.changeBodyOverflow("hidden");
  }

  private _resumeBodyScrolling(): void {
    this.windowRefService.changeBodyOverflow("auto");
  }
}
