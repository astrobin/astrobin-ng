import { isPlatformBrowser } from "@angular/common";
import {
  ChangeDetectorRef,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  Inject,
  Input,
  Output,
  PLATFORM_ID,
  ViewChild
} from "@angular/core";
import { Router } from "@angular/router";
import { HideFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import { ForceCheckTogglePropertyAutoLoad } from "@app/store/actions/image.actions";
import { MainState } from "@app/store/state";
import { ImageAlias } from "@core/enums/image-alias.enum";
import { FINAL_REVISION_LABEL, ImageInterface, ImageRevisionInterface } from "@core/interfaces/image.interface";
import { DeviceService } from "@core/services/device.service";
import { ImageService } from "@core/services/image/image.service";
import { ImageViewerNavigationContext, ImageViewerNavigationContextItem } from "@core/services/image-viewer.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { SwipeDownService } from "@core/services/swipe-down.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { NgbCarousel, NgbSlideEvent } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { fadeInOut } from "@shared/animations";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageViewerSlideshowContextComponent } from "@shared/components/misc/image-viewer-slideshow/image-viewer-slideshow-context.component";
import { Observable, Subscription } from "rxjs";
import { switchMap } from "rxjs/operators";

const SLIDESHOW_BUFFER = 1;
const SLIDESHOW_WINDOW = 3;

@Component({
  selector: "astrobin-image-viewer-slideshow",
  template: `
    <div
      #carouselContainer
      class="carousel-container"
      (touchstart)="onTouchStart($event)"
      (touchmove)="onTouchMove($event)"
      (touchend)="onTouchEnd($event)"
    >
      <div class="carousel-area">
        <ngb-carousel
          #carousel
          *ngIf="visibleContext.length > 0; else loadingTemplate"
          (slide)="onSlide($event)"
          [animation]="false"
          [activeId]="activeId"
          [interval]="0"
          [showNavigationArrows]="false"
          [showNavigationIndicators]="false"
          [keyboard]="false"
          [wrap]="false"
          [class.is-on-first]="activeId === navigationContext[0].imageId"
          [class.is-on-last]="activeId === navigationContext[navigationContext.length - 1].imageId"
        >
          <ng-template
            ngbSlide
            *ngFor="let item of visibleContext; let i = index; trackBy: contextTrackByFn"
            [attr.id]="item.imageId"
          >
            <astrobin-image-viewer
              *ngIf="item.image; else loadingTemplate"
              (closeClick)="closeSlideshow.emit(true)"
              (nextClick)="onNextClick()"
              (previousClick)="onPreviousClick()"
              (revisionSelected)="onRevisionSelected($event)"
              [active]="item.imageId === activeId"
              [image]="item.image"
              [revisionLabel]="activeImageRevisionLabel"
              [showCloseButton]="true"
              [showPreviousButton]="activeId !== navigationContext[0].imageId && navigationContext.length > 1"
              [showNextButton]="
                activeId !== navigationContext[navigationContext.length - 1].imageId && navigationContext.length > 1
              "
              [standalone]="false"
            ></astrobin-image-viewer>
          </ng-template>
        </ngb-carousel>
      </div>

      <div *ngIf="navigationContext?.length > 1" class="context-area">
        <astrobin-image-viewer-slideshow-context
          #context
          [activeId]="activeId"
          [callerComponentId]="callerComponentId"
          [navigationContext]="navigationContext"
          (itemSelected)="onNavigationContextItemSelected($event)"
          (nearEndOfContext)="nearEndOfContext.emit($event)"
        ></astrobin-image-viewer-slideshow-context>
      </div>
    </div>

    <astrobin-fullscreen-image-viewer
      *ngIf="activeImage"
      [id]="activeImage.pk"
      [eagerLoading]="true"
      [revisionLabel]="activeImageRevisionLabel"
      (enterFullscreen)="onEnterFullscreen()"
      (exitFullscreen)="onExitFullscreen()"
    ></astrobin-fullscreen-image-viewer>

    <ng-template #loadingTemplate>
      <div class="loading-area" @fadeInOut>
        <div class="close-button" (click)="closeSlideshow.emit(true)">
          <fa-icon icon="times"></fa-icon>
        </div>
        <astrobin-loading-indicator></astrobin-loading-indicator>
      </div>
    </ng-template>
  `,
  styleUrls: ["./image-viewer-slideshow.component.scss"],
  animations: [fadeInOut]
})
export class ImageViewerSlideshowComponent extends BaseComponentDirective implements OnInit, OnDestroy {
  @HostBinding("@fadeInOut") fadeInOut = true;

  @Input()
  imageId: ImageInterface["pk"] | ImageInterface["hash"];

  @Input()
  navigationContext: ImageViewerNavigationContext;

  @Output()
  closeSlideshow = new EventEmitter<boolean>();

  @Output()
  nearEndOfContext = new EventEmitter<ImageViewerNavigationContextItem["imageId"]>();

  @Output()
  imageChange = new EventEmitter<ImageInterface>();

  @ViewChild("context", { read: ImageViewerSlideshowContextComponent })
  protected context: ImageViewerSlideshowContextComponent;

  activeId: ImageInterface["pk"] | ImageInterface["hash"];
  activeImage: ImageInterface;
  activeImageRevisionLabel: ImageRevisionInterface["label"] = FINAL_REVISION_LABEL;

  @ViewChild("carousel", { static: false, read: NgbCarousel })
  protected carousel: NgbCarousel;

  @ViewChild("carouselContainer")
  protected carouselContainer: ElementRef;

  protected readonly FINAL_REVISION_LABEL = FINAL_REVISION_LABEL;

  protected visibleContext: ImageViewerNavigationContext = [];
  protected fullscreen = false;
  protected loadingImage = false;
  protected callerComponentId: string;

  // Swipe handling properties
  protected touchStartY: { value: number } = { value: 0 };
  protected touchCurrentY: { value: number } = { value: 0 };
  protected touchPreviousY: { value: number } = { value: 0 }; // Used to track direction changes
  protected isSwiping: { value: boolean } = { value: false };
  protected swipeProgress: { value: number } = { value: 0 };
  protected swipeThreshold = 150; // Minimum distance to consider a swipe
  protected swipeDirectionDown: { value: boolean } = { value: true }; // Track if the swipe is currently going down

  private readonly _isBrowser: boolean;
  private _delayedLoadSubscription: Subscription = new Subscription();
  private _skipSlideEvent = false;
  private _navigationInProgress = false;
  private _boundOnKeyDown: (event: KeyboardEvent) => void;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly imageService: ImageService,
    public readonly utilsService: UtilsService,
    public readonly router: Router,
    public readonly windowRefService: WindowRefService,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly elementRef: ElementRef,
    public readonly deviceService: DeviceService,
    public readonly renderer: Renderer2,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translateService: TranslateService,
    public readonly swipeDownService: SwipeDownService
  ) {
    super(store$);
    this._isBrowser = isPlatformBrowser(this.platformId);
  }

  @HostListener("window:popstate", ["$event"])
  onPopState(event: PopStateEvent) {
    if (this.fullscreen) {
      event.preventDefault();
      this.store$.dispatch(new HideFullscreenImage());
      this.onExitFullscreen();
    } else if (event.state?.imageId && this.activeId !== event.state.imageId) {
      event.preventDefault();
    } else {
      this.closeSlideshow.emit(false);
    }
  }

  ngOnInit() {
    if (this._isBrowser) {
      const _doc = this.windowRefService.nativeWindow.document;
      this._boundOnKeyDown = this._onKeyDown.bind(this);
      _doc.addEventListener("keydown", this._boundOnKeyDown, true);
    }
  }

  ngOnDestroy() {
    this._delayedLoadSubscription.unsubscribe();

    if (this._isBrowser) {
      const _doc = this.windowRefService.nativeWindow.document;
      _doc.removeEventListener("keydown", this._boundOnKeyDown, true);

      // Make sure to clean up any transition classes
      document.body.classList.remove("image-viewer-closing");

      // Clear any safety timer that might be running
      if ((this as any).__safetyTimer) {
        clearTimeout((this as any).__safetyTimer);
        (this as any).__safetyTimer = null;
      }
    }

    // Reset any in-progress swipe animation
    if (this.isSwiping.value) {
      this.isSwiping.value = false;
      this.swipeProgress.value = 0;
      this._resetSwipeAnimation();
    }

    // Clear any notifications
    this.popNotificationsService.clear();
  }

  // Touch event handlers for swipe-down gesture
  protected onTouchStart(event: TouchEvent): void {
    if (this.fullscreen) {
      return;
    }

    this.swipeDownService.handleTouchStart(
      event,
      this.touchStartY,
      this.touchCurrentY,
      this.touchPreviousY,
      this.swipeDirectionDown
    );
  }

  protected onTouchMove(event: TouchEvent): void {
    if (this.fullscreen) {
      return;
    }

    this.swipeDownService.handleTouchMove(
      event,
      this.touchStartY,
      this.touchCurrentY,
      this.touchPreviousY,
      this.swipeDirectionDown,
      this.isSwiping,
      this.swipeProgress,
      this.swipeThreshold,
      this.elementRef,
      this.renderer
    );
  }

  protected onTouchEnd(event: TouchEvent): void {
    if (this.fullscreen) {
      return;
    }

    // Only process if we're swiping
    if (!this.isSwiping.value) {
      return;
    }

    // Add class for background animation - the service will handle cancel detection
    if (typeof document !== "undefined") {
      document.body.classList.add("image-viewer-closing");
    }

    this.swipeDownService.handleTouchEnd(
      this.isSwiping,
      this.touchStartY,
      this.touchCurrentY,
      this.touchPreviousY,
      this.swipeDirectionDown,
      this.swipeThreshold,
      this.swipeProgress,
      this.elementRef,
      this.renderer,
      () => {
        if (typeof document !== "undefined") {
          document.body.classList.remove("image-viewer-closing");
        }

        this.closeSlideshow.emit(true);
      }
    );
  }

  private _resetSwipeAnimation(): void {
    if (!this.elementRef || !this.elementRef.nativeElement) {
      return;
    }

    // Use CSS animation classes instead of manual style manipulation
    // This delegates animation to the GPU and composite layers

    // Mark as animating for pointer-events optimizations
    this.renderer.addClass(this.elementRef.nativeElement, "swipe-to-close-animating");

    // Add the return-to-normal animation class
    this.renderer.addClass(this.elementRef.nativeElement, "swipe-to-close-return-to-normal");

    // Listen for animation end to clean up classes
    const onAnimationEnd = (event: AnimationEvent) => {
      if (event.animationName === "return-to-normal") {
        // Remove animation classes
        this.renderer.removeClass(this.elementRef.nativeElement, "swipe-to-close-return-to-normal");
        this.renderer.removeClass(this.elementRef.nativeElement, "swipe-to-close-animating");

        // Remove the event listener to avoid memory leaks
        this.elementRef.nativeElement.removeEventListener("animationend", onAnimationEnd);
      }
    };

    // Add the event listener
    this.elementRef.nativeElement.addEventListener("animationend", onAnimationEnd);
  }

  setCallerComponentId(callerComponentId: string) {
    this.callerComponentId = callerComponentId;
  }

  setNavigationContext(newContext: ImageViewerNavigationContext) {
    if (this.navigationContext) {
      this.navigationContext = newContext.map((item, index) => {
        const existingItem = this.navigationContext.find(i => i.imageId === item.imageId);
        if (existingItem) {
          return existingItem;
        }

        return item;
      });
    } else {
      this.navigationContext = newContext;
    }

    this._updateVisibleContext(this.activeId);
  }

  setImage(
    imageId: ImageInterface["pk"] | ImageInterface["hash"],
    revisionLabel: ImageRevisionInterface["label"],
    emitChange = true
  ): Observable<ImageInterface> {
    this.loadingImage = true;

    const escapeListener = this.renderer.listen("document", "keydown", (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        this.closeSlideshow.emit(false);
      }
    });

    return new Observable(subscriber => {
      this._loadImage(imageId).subscribe({
        next: image => {
          this.activeImage = image;
          this.activeImageRevisionLabel = revisionLabel || FINAL_REVISION_LABEL;
          this.imageService.setMetaTags(image);
          this._updateVisibleContext(imageId);
          this._loadAdjacentImages(imageId);
          this._dropImagesTooFarFromIndex(imageId);

          this.utilsService.delay(1).subscribe(() => {
            if (this.carousel) {
              this._skipSlideEvent = true;
              this.carousel.select(imageId.toString());
              this._skipSlideEvent = false;
              this.carousel.focus();
              this.activeId = imageId;
            }

            this.loadingImage = false;

            if (this.context) {
              this.context.removeLoadingStatus(imageId);
            }

            if (emitChange) {
              this.imageChange.emit(image);
            }

            subscriber.next(image);
            subscriber.complete();

            this.utilsService.delay(250).subscribe(() => {
              this.store$.dispatch(new ForceCheckTogglePropertyAutoLoad());
            });
          });
        },
        error: error => {
          this.loadingImage = false;
          this.popNotificationsService.error(
            this.translateService.instant(
              "An error occurred while loading the image. Probably the photographer deleted it."
            )
          );
          subscriber.error(error);
          subscriber.complete();
        },
        complete: () => {
          if (!!escapeListener) {
            escapeListener();
          }
        }
      });
    });
  }

  protected onEnterFullscreen() {
    this.fullscreen = true;
    this.changeDetectorRef.detectChanges();
  }

  protected onExitFullscreen() {
    if (this._isBrowser) {
      const location_ = this.windowRefService.nativeWindow.location;
      this.windowRefService.replaceState({}, `${location_.pathname}${location_.search}`);
    }

    this.utilsService.delay(50).subscribe(() => {
      this.fullscreen = false;
      this.changeDetectorRef.detectChanges();
      this.store$.dispatch(new ForceCheckTogglePropertyAutoLoad());
    });
  }

  protected onNextClick() {
    if (this.loadingImage || this._navigationInProgress) {
      return;
    }

    this._navigationInProgress = true;
    this.carousel.next();

    this.utilsService.delay(250).subscribe(() => {
      this._navigationInProgress = false;
    });
  }

  protected onPreviousClick() {
    if (this.loadingImage || this._navigationInProgress) {
      return;
    }

    this._navigationInProgress = true;
    this.carousel.prev();

    this.utilsService.delay(250).subscribe(() => {
      this._navigationInProgress = false;
    });
  }

  protected onSlide(event: NgbSlideEvent) {
    if (this._skipSlideEvent) {
      this._navigationInProgress = false;
      return;
    }

    if (!event.current || this.activeId === event.current) {
      this._navigationInProgress = false;
      return;
    }

    this.setImage(event.current, FINAL_REVISION_LABEL).subscribe({
      next: () => {},
      error: () => {
        this.closeSlideshow.emit(false);
      },
      complete: () => {
        this._navigationInProgress = false;
        this.popNotificationsService.clear();
      }
    });
  }

  protected onRevisionSelected(revisionLabel: ImageRevisionInterface["label"]) {
    this.activeImageRevisionLabel = revisionLabel;
    this.changeDetectorRef.detectChanges();
  }

  protected onNavigationContextItemSelected(imageId: ImageInterface["pk"] | ImageInterface["hash"]) {
    this.setImage(imageId, FINAL_REVISION_LABEL).subscribe({
      next: () => {},
      error: () => {
        this.closeSlideshow.emit(false);
      }
    });
  }

  protected contextTrackByFn(index: number, item: ImageViewerNavigationContextItem) {
    return item.imageId;
  }

  private _onKeyDown = (event: KeyboardEvent) => {
    if (
      (event.key === "ArrowLeft" || event.key === "ArrowRight") &&
      (event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLDivElement && event.target.hasAttribute("contenteditable")))
    ) {
      event.stopPropagation();
    }
  };

  private _updateVisibleContext(activeId: ImageInterface["pk"] | ImageInterface["hash"]) {
    if (!activeId) {
      return;
    }

    const currentIndex = this._getImageIndexInContext(activeId);
    if (currentIndex === -1) {
      this.visibleContext = [...this.navigationContext];
      return;
    }

    if (this.navigationContext.length === 1) {
      this.visibleContext = [this.navigationContext[0]];
      return;
    }

    if (currentIndex === 0) {
      this.visibleContext = this.navigationContext.slice(0, 2);
      return;
    }

    if (currentIndex === this.navigationContext.length - 1) {
      this.visibleContext = this.navigationContext.slice(-2);
      return;
    }

    this.visibleContext = this.navigationContext.slice(currentIndex - 1, currentIndex + 2);
  }

  private _loadAdjacentImages(activeId: ImageInterface["pk"] | ImageInterface["hash"]) {
    const index = this._getImageIndexInContext(activeId);
    for (let i = index - SLIDESHOW_BUFFER; i <= index + SLIDESHOW_BUFFER; i++) {
      if (i >= 0 && i < this.navigationContext.length && i !== index) {
        this._loadImage(this.navigationContext[i].imageId, Math.abs(index - i) * 100).subscribe(() => {
          this._updateVisibleContext(activeId);
        });
      }
    }
  }

  private _dropImagesTooFarFromIndex(activeId: ImageInterface["pk"] | ImageInterface["hash"]) {
    const index = this._getImageIndexInContext(activeId);
    this.navigationContext = this.navigationContext.map((item, i) => {
      if (Math.abs(index - i) > SLIDESHOW_WINDOW) {
        return { ...item, image: undefined };
      }
      return item;
    });
  }

  private _loadImage(imageId: ImageInterface["pk"] | ImageInterface["hash"], delay = 0): Observable<ImageInterface> {
    return new Observable(subscriber => {
      const index = this._getImageIndexInContext(imageId);

      if (this.navigationContext && this.navigationContext[index]?.image) {
        subscriber.next(this.navigationContext[index].image);
        subscriber.complete();
        return;
      }

      this._delayedLoadSubscription.add(
        this.utilsService
          .delay(delay)
          .pipe(switchMap(() => this.imageService.loadImage(imageId)))
          .subscribe({
            next: image => {
              if (!this.navigationContext || !this.navigationContext.length) {
                this.navigationContext = [
                  {
                    imageId,
                    thumbnailUrl: image.thumbnails.find(thumbnail => thumbnail.alias === ImageAlias.GALLERY).url,
                    image
                  }
                ];
              } else {
                this.navigationContext = this.navigationContext.map(item => {
                  if (item.imageId === imageId) {
                    return {
                      ...item,
                      image
                    };
                  }

                  return item;
                });
              }

              subscriber.next(image);
              subscriber.complete();
            },
            error: error => {
              subscriber.error(error);
              subscriber.complete();
            }
          })
      );
    });
  }

  private _getImageIndexInContext(imageId: ImageInterface["pk"] | ImageInterface["hash"]): number {
    return this.navigationContext.findIndex(item => item.imageId === imageId.toString());
  }
}
