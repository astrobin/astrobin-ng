import { Location } from "@angular/common";
import { ComponentRef, Inject, Injectable, PLATFORM_ID, ViewContainerRef } from "@angular/core";
import { FINAL_REVISION_LABEL, ImageInterface, ImageRevisionInterface } from "@shared/interfaces/image.interface";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { DeleteImageSuccess } from "@app/store/actions/image.actions";
import { map, switchMap, take, takeUntil } from "rxjs/operators";
import { ImageViewerComponent } from "@shared/components/misc/image-viewer/image-viewer.component";
import { WindowRefService } from "@shared/services/window-ref.service";
import { HideFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import { DeviceService } from "@shared/services/device.service";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { ActivatedRoute, Router } from "@angular/router";
import { TitleService } from "@shared/services/title/title.service";
import { ImageService } from "@shared/services/image/image.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { Subscription } from "rxjs";


export interface ImageViewerNavigationContextItem {
  imageId: ImageInterface["hash"] | ImageInterface["pk"];
  thumbnailUrl: string;
}

export type ImageViewerNavigationContext = ImageViewerNavigationContextItem[];


@Injectable({
  providedIn: "root"
})
export class ImageViewerService extends BaseService {
  activeImageViewer?: ComponentRef<ImageViewerComponent>;
  nextImageViewer?: ComponentRef<ImageViewerComponent>;
  previousImageViewer?: ComponentRef<ImageViewerComponent>;

  private _currentImageIndex: number = -1;
  private _activeViewerSubscriptions: Subscription = new Subscription();

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

    this._currentImageIndex = navigationContext.findIndex(context => context.imageId === imageId);

    this.activeImageViewer = this._createImageViewer(viewContainerRef, searchComponentId);
    this._loadImageIntoViewer(this.activeImageViewer, imageId, revisionLabel, navigationContext, fullscreen);
    this._initializeAdjacentViewers(viewContainerRef, searchComponentId, navigationContext);

    this._activeViewerSubscriptions.add(
      this.activeImageViewer.instance.next.subscribe(
        () => this.handleNext(viewContainerRef, searchComponentId, navigationContext)
      )
    );

    this._activeViewerSubscriptions.add(
      this.activeImageViewer.instance.previous.subscribe(
        () => this.handlePrevious(viewContainerRef, searchComponentId, navigationContext)
        )
    );

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

    this._activeViewerSubscriptions.unsubscribe();
    this._activeViewerSubscriptions = new Subscription();
  }

  private _initializeAdjacentViewers(
    viewContainerRef: ViewContainerRef,
    searchComponentId: string,
    navigationContext: ImageViewerNavigationContext
  ): void {
    const nextImageIndex = this._currentImageIndex + 1;
    const previousImageIndex = this._currentImageIndex - 1;

    if (nextImageIndex < navigationContext.length) {
      const nextImageId = navigationContext[nextImageIndex].imageId;
      this.nextImageViewer = this._createImageViewer(viewContainerRef, searchComponentId, 'next');
      this._loadImageIntoViewer(this.nextImageViewer, nextImageId, FINAL_REVISION_LABEL, navigationContext, false, 'next');
    }

    if (previousImageIndex >= 0) {
      const previousImageId = navigationContext[previousImageIndex].imageId;
      this.previousImageViewer = this._createImageViewer(viewContainerRef, searchComponentId, 'previous');
      this._loadImageIntoViewer(this.previousImageViewer, previousImageId, FINAL_REVISION_LABEL, navigationContext, false, 'previous');
    }
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

  private handleNext(
    viewContainerRef: ViewContainerRef,
    searchComponentId: string,
    navigationContext: ImageViewerNavigationContext
  ): void {
    if (this._currentImageIndex + 1 >= navigationContext.length) {
      console.warn("No next image available.");
      return;
    }

    // Clean up the previous viewer
    this.closeImageViewer(this.previousImageViewer, false);

    // Shift the viewers
    this.previousImageViewer = this.activeImageViewer;
    this.activeImageViewer = this.nextImageViewer;
    this.nextImageViewer = undefined;

    this._currentImageIndex += 1;

    // Update classes for CSS animations if needed
    this._updateViewerClasses();

    // Subscribe to events of the new active viewer
    this._subscribeToActiveViewerEvents(viewContainerRef, navigationContext);

    // Load new next viewer if available
    const newNextIndex = this._currentImageIndex + 1;
    if (newNextIndex < navigationContext.length) {
      const newNextImageId = navigationContext[newNextIndex].imageId;
      this.nextImageViewer = this._createImageViewer(viewContainerRef, searchComponentId, 'next');
      this._loadImageIntoViewer(this.nextImageViewer, newNextImageId, FINAL_REVISION_LABEL, navigationContext, false, 'next');
    }
  }

  private handlePrevious(
    viewContainerRef: ViewContainerRef,
    searchComponentId: string,
    navigationContext: ImageViewerNavigationContext
  ): void {
    if (this._currentImageIndex - 1 < 0) {
      console.warn("No previous image available.");
      return;
    }

    // Clean up the next viewer
    this.closeImageViewer(this.nextImageViewer, false);

    // Shift the viewers
    this.nextImageViewer = this.activeImageViewer;
    this.activeImageViewer = this.previousImageViewer;
    this.previousImageViewer = undefined;

    this._currentImageIndex -= 1;

    // Update classes for CSS animations if needed
    this._updateViewerClasses();

    // Subscribe to events of the new active viewer
    this._subscribeToActiveViewerEvents(viewContainerRef, navigationContext);

    // Load new previous viewer if available
    const newPreviousIndex = this._currentImageIndex - 1;
    if (newPreviousIndex >= 0) {
      const newPreviousImageId = navigationContext[newPreviousIndex].imageId;
      this.previousImageViewer = this._createImageViewer(viewContainerRef, searchComponentId, 'previous');
      this._loadImageIntoViewer(this.previousImageViewer, newPreviousImageId, FINAL_REVISION_LABEL, navigationContext, false, 'previous');
    }
  }

  private _updateViewerClasses(): void {
    if (this.activeImageViewer) {
      this.activeImageViewer.instance.elementRef.nativeElement.classList.remove("next");
      this.activeImageViewer.instance.elementRef.nativeElement.classList.remove("previous");
      this.activeImageViewer.instance.elementRef.nativeElement.classList.add("active");
    }

    if (this.nextImageViewer) {
      this.nextImageViewer.instance.elementRef.nativeElement.classList.remove("active");
      this.nextImageViewer.instance.elementRef.nativeElement.classList.remove("previous");
      this.nextImageViewer.instance.elementRef.nativeElement.classList.add("next");
    }

    if (this.previousImageViewer) {
      this.previousImageViewer.instance.elementRef.nativeElement.classList.remove("active");
      this.previousImageViewer.instance.elementRef.nativeElement.classList.remove("next");
      this.previousImageViewer.instance.elementRef.nativeElement.classList.add("previous");
    }
  }

  private _subscribeToActiveViewerEvents(
    viewContainerRef: ViewContainerRef,
    navigationContext: ImageViewerNavigationContext
  ): void {
    // Unsubscribe from previous subscriptions to avoid memory leaks
    this._activeViewerSubscriptions.unsubscribe();
    this._activeViewerSubscriptions = new Subscription();

    if (this.activeImageViewer) {
      this._activeViewerSubscriptions.add(
        this.activeImageViewer.instance.closeViewer.subscribe(() => {
          this.closeAllImageViewers(true);
        })
      );

      this._activeViewerSubscriptions.add(
        this.activeImageViewer.instance.next.subscribe(
          () => this.handleNext(
            viewContainerRef, this.activeImageViewer!.instance.searchComponentId, navigationContext)
        )
      );

      this._activeViewerSubscriptions.add(
        this.activeImageViewer.instance.previous.subscribe(() => this.handlePrevious(
            viewContainerRef, this.activeImageViewer!.instance.searchComponentId,navigationContext
          )
        )
      );
    }
  }


  private _stopBodyScrolling(): void {
    this.windowRefService.changeBodyOverflow("hidden");
  }

  private _resumeBodyScrolling(): void {
    this.windowRefService.changeBodyOverflow("auto");
  }
}
