import { Location } from "@angular/common";
import { ComponentRef, Inject, Injectable, PLATFORM_ID, ViewContainerRef } from "@angular/core";
import { FINAL_REVISION_LABEL, ImageInterface, ImageRevisionInterface } from "@shared/interfaces/image.interface";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { DeleteImageSuccess } from "@app/store/actions/image.actions";
import { map, switchMap, take, takeUntil } from "rxjs/operators";
import { ImageViewerComponent, ImageViewerNavigationContext } from "@shared/components/misc/image-viewer/image-viewer.component";
import { WindowRefService } from "@shared/services/window-ref.service";
import { HideFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import { DeviceService } from "@shared/services/device.service";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { ActivatedRoute, Router } from "@angular/router";
import { TitleService } from "@shared/services/title/title.service";
import { ImageService } from "@shared/services/image/image.service";
import { UtilsService } from "@shared/services/utils/utils.service";

@Injectable({
  providedIn: "root"
})
export class ImageViewerService extends BaseService {
  activeImageViewer?: ComponentRef<ImageViewerComponent>;
  nextImageViewer?: ComponentRef<ImageViewerComponent>;
  previousImageViewer?: ComponentRef<ImageViewerComponent>;

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

      this.closeImageViewer(this.nextImageViewer, false);
      this.closeImageViewer(this.previousImageViewer, false);
    });
  }

  autoOpenImageViewer(activatedRoute: ActivatedRoute, componentId: string, viewContainerRef: ViewContainerRef): void {
    const queryParams = activatedRoute.snapshot.queryParams;

    if (queryParams["i"]) {
      const currentImage = this.activeImageViewer?.instance?.image;
      const currentImageId = currentImage?.hash || currentImage?.pk;

      if (currentImageId && currentImageId === queryParams["i"]) {
        return;
      }

      if (this.activeImageViewer) {
        this.closeActiveImageViewer(false);
      }

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
    fullscreen: boolean,
    searchComponentId: string,
    navigationContext: ImageViewerNavigationContext,
    viewContainerRef: ViewContainerRef
  ): ComponentRef<ImageViewerComponent> {
    const currentPageTitle = this.titleService.getTitle();
    const currentPageDescription = this.titleService.getDescription();
    const currentPageUrl = this.windowRefService.getCurrentUrl().toString();

    if (this.activeImageViewer) {
      return this.activeImageViewer;
    }

    this.activeImageViewer = this._createImageViewer(viewContainerRef, searchComponentId);
    this._loadImageIntoViewer(this.activeImageViewer, imageId, revisionLabel, navigationContext, fullscreen);

    if (navigationContext?.length > 1) {
      const activeImageIndex = navigationContext.findIndex(context => context.imageId === imageId);
      const nextImageIndex = activeImageIndex + 1;
      const previousImageIndex = activeImageIndex - 1;

      if (nextImageIndex < navigationContext.length) {
        this.nextImageViewer = this._createImageViewer(viewContainerRef, searchComponentId, 'next');
        this._loadImageIntoViewer(
          this.nextImageViewer,
          navigationContext[nextImageIndex].imageId,
          FINAL_REVISION_LABEL, navigationContext,
          false,
          'next'
        );
      }

      if (previousImageIndex >= 0) {
        this.previousImageViewer = this._createImageViewer(viewContainerRef, searchComponentId, 'previous');
        this._loadImageIntoViewer(
          this.previousImageViewer,
          navigationContext[previousImageIndex].imageId,
          FINAL_REVISION_LABEL,
          navigationContext,
          false,
          'previous'
        );
      }
    }

    this.activeImageViewer.instance.closeViewer.subscribe(() => {
      this.closeAllImageViewers(true);
      this.titleService.setTitle(currentPageTitle);
      this.titleService.setDescription(currentPageDescription);
      this.titleService.updateMetaTag({ property: "og:url", content: currentPageUrl });
    });

    this._stopBodyScrolling();

    return this.activeImageViewer;
  }

  closeImageViewer(instance: ComponentRef<ImageViewerComponent>, pushState: boolean): void {
    if (instance) {
      this.store$.dispatch(new HideFullscreenImage());
      instance.destroy();
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

  closeActiveImageViewer(pushState: boolean): void {
    this.closeImageViewer(this.activeImageViewer, pushState);
    this.activeImageViewer = undefined;
  }

  closeAllImageViewers(pushState: boolean): void {
    this.closeImageViewer(this.activeImageViewer, pushState);
    this.activeImageViewer = undefined;

    this.closeImageViewer(this.nextImageViewer, false);
    this.nextImageViewer = undefined;

    this.closeImageViewer(this.previousImageViewer, false);
    this.previousImageViewer = undefined;
  }

  private _createImageViewer(
    viewContainerRef: ViewContainerRef,
    searchComponentId: string,
    viewerType: 'active' | 'next' | 'previous' = 'active'
  ): ComponentRef<ImageViewerComponent> {
    const viewer = viewContainerRef.createComponent(ImageViewerComponent);
    viewer.instance.showCloseButton = viewerType === 'active';
    viewer.instance.fullscreenMode = true;
    viewer.instance.searchComponentId = searchComponentId;
    viewer.instance.elementRef.nativeElement.classList.add(viewerType);
    return viewer;
  }

  private _loadImageIntoViewer(
    viewer: ComponentRef<ImageViewerComponent>,
    imageId: ImageInterface["hash"] | ImageInterface["pk"],
    revisionLabel: ImageRevisionInterface["label"],
    navigationContext: ImageViewerNavigationContext,
    fullscreen: boolean,
    viewerType: 'active' | 'next' | 'previous' = 'active'
  ): void {
    viewer.instance.initialized.pipe(
      take(1),
      switchMap(() => this.imageService.loadImage(imageId))
    ).subscribe({
      next: image => {
        viewer.instance.setImage(
          image,
          revisionLabel,
          fullscreen,
          navigationContext,
          viewerType === 'active'
        );
      },
      error: () => {
        viewer.instance.setImage(
          null,
          null,
          false,
          navigationContext,
          viewerType === 'active'
        );
      }
    });
  }

  private _stopBodyScrolling(): void {
    this.windowRefService.changeBodyOverflow("hidden");
  }

  private _resumeBodyScrolling(): void {
    this.windowRefService.changeBodyOverflow("auto");
  }
}
