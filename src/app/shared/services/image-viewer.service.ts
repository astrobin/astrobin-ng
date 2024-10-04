import { isPlatformBrowser, Location } from "@angular/common";
import { ComponentRef, Inject, Injectable, PLATFORM_ID, ViewContainerRef } from "@angular/core";
import { FINAL_REVISION_LABEL, ImageInterface, ImageRevisionInterface } from "@shared/interfaces/image.interface";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { DeleteImageSuccess } from "@app/store/actions/image.actions";
import { map, take, takeUntil } from "rxjs/operators";
import { WindowRefService } from "@shared/services/window-ref.service";
import { DeviceService } from "@shared/services/device.service";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { ActivatedRoute, Router } from "@angular/router";
import { TitleService } from "@shared/services/title/title.service";
import { ImageService } from "@shared/services/image/image.service";
import { ImageViewerSlideshowComponent } from "@shared/components/misc/image-viewer-slideshow/image-viewer-slideshow.component";
import { HideFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import { UtilsService } from "@shared/services/utils/utils.service";

export interface ImageViewerNavigationContextItem {
  imageId: ImageInterface["hash"] | ImageInterface["pk"];
  thumbnailUrl: string;
  image?: ImageInterface;
}

export type ImageViewerNavigationContext = ImageViewerNavigationContextItem[];

@Injectable({
  providedIn: "root"
})
export class ImageViewerService extends BaseService {
  slideshow: ComponentRef<ImageViewerSlideshowComponent>;

  private _previousTitle: string;
  private _previousDescription: string;
  private _previousUrl: string;

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
      if (this.slideshow && this.slideshow.instance.activeImage.pk === pk) {
        this.closeSlideShow(true);
      }
    });
  }


  autoOpenSlideshow(
    callerComponentId: string,
    activatedRoute: ActivatedRoute,
    viewContainerRef: ViewContainerRef
  ): void {
    const queryParams = activatedRoute.snapshot.queryParams;

    if (queryParams["i"]) {
      const currentImageId = this.slideshow?.instance?.activeId;

      if (currentImageId && currentImageId === queryParams["i"]) {
        return;
      }

      this.openSlideshow(
        callerComponentId,
        queryParams["i"],
        queryParams["r"] || FINAL_REVISION_LABEL,
        [],
        viewContainerRef,
        false
      );
    }
  }

  openSlideshow(
    callerComponentId: string,
    imageId: ImageInterface["hash"] | ImageInterface["pk"],
    revisionLabel: ImageRevisionInterface["label"],
    navigationContext: ImageViewerNavigationContext,
    viewContainerRef: ViewContainerRef,
    pushState: boolean
  ): ComponentRef<ImageViewerSlideshowComponent> {
    if (!this.slideshow) {
      this._previousTitle = this.titleService.getTitle();
      this._previousDescription = this.titleService.getDescription();
      this._previousUrl = this.windowRefService.getCurrentUrl().toString();

      this.slideshow = viewContainerRef.createComponent(ImageViewerSlideshowComponent);

      this._stopBodyScrolling();

      this.slideshow.instance.closeSlideshow.pipe(take(1)).subscribe(pushState => {
        this.closeSlideShow(pushState);
        this.titleService.setTitle(this._previousTitle);
        this.titleService.setDescription(this._previousDescription);
        this.titleService.updateMetaTag({ property: "og:url", content: this._previousUrl });
      });

      this.slideshow.instance.imageChange.subscribe((image: ImageInterface) => {
        if (isPlatformBrowser(this.platformId)) {
          let url = this.windowRefService.getCurrentUrl().href;
          const fragment = url.split("#")[1];

          url = UtilsService.addOrUpdateUrlParam(url, "i", image.hash || image.pk.toString());

          if (fragment) {
            url += "#" + fragment;
          }

          this.windowRefService.pushState({ imageId: image.hash || image.pk }, url);
        }
      });
    }

    this.slideshow.instance.setCallerComponentId(callerComponentId);
    this.slideshow.instance.setNavigationContext(navigationContext);
    this.slideshow.instance.setImage(imageId, revisionLabel, pushState).subscribe({
      error: () => {
        this.closeSlideShow(false);
      }
    });
    return this.slideshow;
  }

  closeSlideShow(pushState: boolean): void {
    if (this.slideshow) {
      this.slideshow.destroy();
      this.slideshow = null;

      this.store$.dispatch(new HideFullscreenImage());
      this._resumeBodyScrolling();

      if (pushState) {
        let url = UtilsService.removeUrlParam(this.windowRefService.getCurrentUrl().href, "i");
        url = UtilsService.removeUrlParam(url, "r");
        url = url.split("#")[0];

        this.windowRefService.replaceState(
          {},
          url
        );
      }
    }
  }

  getScrollArea(imageId: ImageInterface["hash"] | ImageInterface["pk"]): {
    scrollArea: HTMLElement;
    windowWidth: number;
    windowHeight: number;
    viewPortAspectRatio: number;
    sideToSideLayout: boolean;
  } | null {
    let scrollArea: HTMLElement;

    const windowWidth = this.windowRefService.nativeWindow.innerWidth;
    const windowHeight = this.windowRefService.nativeWindow.innerHeight;
    const viewPortAspectRatio = windowWidth / windowHeight;
    const sideToSideLayout = this.deviceService.lgMin() || viewPortAspectRatio > 1;

    if (sideToSideLayout) {
      scrollArea = this.windowRefService.nativeWindow.document.querySelector(
        `#image-viewer-${imageId} > .main-area-container > .main-area > .data-area-container > .data-area`
      );
    } else {
      scrollArea = this.windowRefService.nativeWindow.document.querySelector(
        `#image-viewer-${imageId} > .main-area-container > .main-area`
      );
    }

    return {
      scrollArea,
      windowWidth,
      windowHeight,
      viewPortAspectRatio,
      sideToSideLayout
    };
  }

  private _stopBodyScrolling(): void {
    this.windowRefService.changeBodyOverflow("hidden");
  }

  private _resumeBodyScrolling(): void {
    this.windowRefService.changeBodyOverflow("auto");
  }
}
