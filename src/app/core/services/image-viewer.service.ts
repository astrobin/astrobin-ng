import { isPlatformBrowser, Location } from "@angular/common";
import type { ComponentRef } from "@angular/core";
import { ApplicationRef, createComponent, Inject, Injectable, PLATFORM_ID } from "@angular/core";
import type {
  ActivatedRoute,
  ActivationEnd,
  ActivationStart,
  ChildActivationEnd,
  ChildActivationStart,
  GuardsCheckEnd,
  GuardsCheckStart,
  NavigationCancel,
  NavigationError,
  NavigationSkipped,
  NavigationStart,
  Params,
  ResolveEnd,
  ResolveStart,
  RouteConfigLoadEnd,
  RouteConfigLoadStart,
  RoutesRecognized,
  Scroll
} from "@angular/router";
import { NavigationEnd, Router } from "@angular/router";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { HideFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import type { DeleteImageSuccess } from "@app/store/actions/image.actions";
import type { MainState } from "@app/store/state";
import type { ImageInterface, ImageRevisionInterface } from "@core/interfaces/image.interface";
import { FINAL_REVISION_LABEL } from "@core/interfaces/image.interface";
import { BaseService } from "@core/services/base.service";
import { DeviceService } from "@core/services/device.service";
import { ImageService } from "@core/services/image/image.service";
import { LoadingService } from "@core/services/loading.service";
import { TitleService } from "@core/services/title/title.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { ImageViewerSlideshowComponent } from "@shared/components/misc/image-viewer-slideshow/image-viewer-slideshow.component";
import { CookieService } from "ngx-cookie";
import type { Subscriber, Subscription } from "rxjs";
import { EMPTY, Observable, Subject } from "rxjs";
import { map, take, takeUntil } from "rxjs/operators";

export const SHOW_ANNOTATIONS_ON_MOUSE_HOVER_COOKIE: string = "astrobin-images-show-annotations-on-mouse-hover";

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

  public slideshowState$: Observable<boolean>;
  public showAnnotationsOnMouseHover: boolean = false;

  private readonly _isBrowser: boolean;
  private _previousTitle: string;
  private _previousDescription: string;
  private _previousUrl: string;
  private _slideshowStateSubject: Subject<boolean> = new Subject<boolean>();
  private _routerEventsSubscription: Subscription;

  // eslint-disable-next-line max-params
  constructor(
    public readonly loadingService: LoadingService,
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    @Inject(PLATFORM_ID) public readonly platformId: object,
    public readonly windowRefService: WindowRefService,
    public readonly location: Location,
    public readonly deviceService: DeviceService,
    public readonly router: Router,
    public readonly titleService: TitleService,
    public readonly imageService: ImageService,
    public readonly applicationRef: ApplicationRef,
    public readonly utilsService: UtilsService,
    public readonly cookieService: CookieService
  ) {
    super(loadingService);

    this.slideshowState$ = this._slideshowStateSubject.asObservable();

    this._isBrowser = isPlatformBrowser(platformId);

    this.actions$
      .pipe(
        ofType(AppActionTypes.DELETE_IMAGE_SUCCESS),
        takeUntil(this.destroyed$),
        map((action: DeleteImageSuccess): number => action.payload.pk)
      )
      .subscribe((pk: ImageInterface["pk"]): void => {
        if (this.slideshow && this.slideshow.instance.activeImage.pk === pk) {
          this.closeSlideShow(true);
        }
      });

    this._initShowAnnotationsOnMouseHover();
  }

  autoOpenSlideshow(callerComponentId: string, activatedRoute: ActivatedRoute): void {
    const queryParams: Params = activatedRoute.snapshot.queryParams;

    if (queryParams.i) {
      const currentImageId: number | string = this.slideshow?.instance?.activeId;

      if (currentImageId && currentImageId === queryParams.i) {
        return;
      }

      this.openSlideshow(
        callerComponentId,
        queryParams.i,
        queryParams.r || FINAL_REVISION_LABEL,
        [],
        false
      ).subscribe();
    }
  }

  openSlideshow(
    callerComponentId: string,
    imageId: ImageInterface["hash"] | ImageInterface["pk"],
    revisionLabel: ImageRevisionInterface["label"],
    navigationContext: ImageViewerNavigationContext,
    pushState: boolean
  ): Observable<ComponentRef<ImageViewerSlideshowComponent>> {
    if (!this._isBrowser) {
      return EMPTY;
    }

    return new Observable((observer: Subscriber<ComponentRef<ImageViewerSlideshowComponent>>): void => {
      if (!this.slideshow) {
        this._previousTitle = this.titleService.getTitle();
        this._previousDescription = this.titleService.getDescription();
        this._previousUrl = this.windowRefService.getCurrentUrl().toString();

        this.slideshow = createComponent(ImageViewerSlideshowComponent, {
          environmentInjector: this.applicationRef.injector
        });

        this.utilsService.delay(100).subscribe((): void => {
          if (!this._routerEventsSubscription) {
            this._routerEventsSubscription = this.router.events
              .pipe(
                takeUntil(this.slideshow.instance.closeSlideshow) // Unsubscribe when slideshow closes
              )
              .subscribe(
                (
                  event:
                    | NavigationStart
                    | NavigationEnd
                    | NavigationCancel
                    | NavigationError
                    | RoutesRecognized
                    | GuardsCheckStart
                    | GuardsCheckEnd
                    | RouteConfigLoadStart
                    | RouteConfigLoadEnd
                    | ChildActivationStart
                    | ChildActivationEnd
                    | ActivationStart
                    | ActivationEnd
                    | Scroll
                    | ResolveStart
                    | ResolveEnd
                    | NavigationSkipped
                ): void => {
                  if (event instanceof NavigationEnd) {
                    this.closeSlideShow(false);
                  }
                }
              );
          }
        });

        if (this._isBrowser) {
          const body: HTMLElement = this.windowRefService.nativeWindow.document.body;
          body.appendChild(this.slideshow.location.nativeElement);
          body.classList.add("image-viewer-open");
        }

        this.applicationRef.attachView(this.slideshow.hostView);

        this._slideshowStateSubject.next(true);
        this._stopBodyScrolling();

        this.slideshow.instance.closeSlideshow.pipe(take(1)).subscribe((_pushState: boolean): void => {
          this.closeSlideShow(_pushState);
          this.titleService.setTitle(this._previousTitle);
          this.titleService.setDescription(this._previousDescription);
          this.titleService.updateMetaTag({ property: "og:url", content: this._previousUrl });
        });

        this.slideshow.instance.imageChange.subscribe((image: ImageInterface): void => {
          if (isPlatformBrowser(this.platformId)) {
            let url: string = this.windowRefService.getCurrentUrl().href;
            url = UtilsService.addOrUpdateUrlParam(url, "i", image.hash || image.pk.toString());
            this.windowRefService.pushState({ imageId: image.hash || image.pk }, url);
          }
        });
      }

      this.slideshow.instance.setCallerComponentId(callerComponentId);
      this.slideshow.instance.setNavigationContext(navigationContext);
      this.slideshow.instance.setImage(imageId, revisionLabel, pushState).subscribe({
        next: (): void => {
          observer.next(this.slideshow);
          observer.complete();
        },
        error: (): void => {
          this.closeSlideShow(false);
          observer.error();
        }
      });
    });
  }

  closeSlideShow(pushState: boolean): void {
    if (this.slideshow) {
      this.slideshow.location.nativeElement.remove();
      this.slideshow.destroy();
      this.slideshow = null;

      if (this._routerEventsSubscription) {
        this._routerEventsSubscription.unsubscribe();
        this._routerEventsSubscription = null;
      }

      if (this._isBrowser) {
        const body: HTMLElement = this.windowRefService.nativeWindow.document.body;
        body.classList.remove("image-viewer-open");
      }

      this._slideshowStateSubject.next(false);

      this.store$.dispatch(new HideFullscreenImage());
      this._resumeBodyScrolling();

      if (pushState) {
        let url: string = UtilsService.removeUrlParam(this.windowRefService.getCurrentUrl().href, "i");
        url = UtilsService.removeUrlParam(url, "r");
        url = UtilsService.removeUrlParam(url, "annotations");
        url = UtilsService.removeUrlParam(url, "measurements");
        url = url.split("#")[0];

        this.windowRefService.replaceState({}, url);
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

    const windowWidth: number = this.windowRefService.nativeWindow.innerWidth;
    const windowHeight: number = this.windowRefService.nativeWindow.innerHeight;
    const viewPortAspectRatio: number = windowWidth / windowHeight;
    const sideToSideLayout: boolean = this.deviceService.lgMin() || viewPortAspectRatio > 1;

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

  toggleShowAnnotationsOnMouseHover(): void {
    this.showAnnotationsOnMouseHover = !this.showAnnotationsOnMouseHover;
    this.cookieService.put(SHOW_ANNOTATIONS_ON_MOUSE_HOVER_COOKIE, this.showAnnotationsOnMouseHover.toString());
  }

  private _stopBodyScrolling(): void {
    this.windowRefService.changeBodyOverflow("hidden");
  }

  private _resumeBodyScrolling(): void {
    this.windowRefService.changeBodyOverflow("auto");
  }

  private _initShowAnnotationsOnMouseHover(): void {
    const showAnnotationsOnMouseHoverCookie: string = this.cookieService.get(SHOW_ANNOTATIONS_ON_MOUSE_HOVER_COOKIE);

    this.showAnnotationsOnMouseHover =
      showAnnotationsOnMouseHoverCookie === "true" ||
      showAnnotationsOnMouseHoverCookie === null ||
      showAnnotationsOnMouseHoverCookie === undefined;
  }
}
