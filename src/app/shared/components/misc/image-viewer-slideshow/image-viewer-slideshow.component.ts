import { Component, ElementRef, EventEmitter, HostListener, Inject, Input, OnDestroy, Output, PLATFORM_ID, Renderer2, ViewChild } from "@angular/core";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { ImageViewerNavigationContext, ImageViewerNavigationContextItem } from "@shared/services/image-viewer.service";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { ImageService } from "@shared/services/image/image.service";
import { NgbCarousel, NgbSlideEvent } from "@ng-bootstrap/ng-bootstrap";
import { UtilsService } from "@shared/services/utils/utils.service";
import { distinctUntilChanged, filter, map, switchMap, takeUntil } from "rxjs/operators";
import { Observable, Subscription } from "rxjs";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { NavigationEnd, Router } from "@angular/router";
import { ForceCheckTogglePropertyAutoLoad } from "@app/store/actions/image.actions";
import { WindowRefService } from "@shared/services/window-ref.service";
import { isPlatformBrowser } from "@angular/common";
import { DeviceService } from "@shared/services/device.service";

const SLIDESHOW_BUFFER = 1;
const SLIDESHOW_WINDOW = 3;

@Component({
  selector: "astrobin-image-viewer-slideshow",
  template: `
    <div #carouselContainer class="carousel-container">
      <div class="carousel-area">
        <ngb-carousel
          #carousel
          *ngIf="navigationContext.length > 0; else loadingTemplate"
          (slide)="onSlide($event)"
          [animation]="animateCarousel"
          [activeId]="this.activeId"
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
            *ngFor="let item of navigationContext; let i = index; trackBy: contextTrackByFn"
            id="{{ item.imageId }}"
          >
            <div class="pan-container">
              <astrobin-image-viewer
                *ngIf="item.image; else loadingTemplate"
                [active]="item.imageId === activeId"
                [image]="item.image"
                [showCloseButton]="true"
                [showPreviousButton]="activeId !== navigationContext[0].imageId"
                [showNextButton]="activeId !== navigationContext[navigationContext.length - 1].imageId"
                [standalone]="false"
                (closeClick)="closeSlideshow.emit(true)"
                (nextClick)="onNextClick()"
                (previousClick)="onPreviousClick()"
              ></astrobin-image-viewer>
            </div>
          </ng-template>
        </ngb-carousel>
      </div>

      <div *ngIf="navigationContext?.length > 1" class="context-area">
        <astrobin-image-viewer-slideshow-context
          [navigationContext]="navigationContext"
          [activeId]="activeId"
          (itemSelected)="carousel.select($event.toString())"
          (nearEndOfContext)="nearEndOfContext.emit($event)"
        ></astrobin-image-viewer-slideshow-context>
      </div>
    </div>

    <ng-template #loadingTemplate>
      <astrobin-loading-indicator></astrobin-loading-indicator>
    </ng-template>
  `,
  styleUrls: ["./image-viewer-slideshow.component.scss"]
})
export class ImageViewerSlideshowComponent extends BaseComponentDirective implements OnDestroy {
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

  activeId: ImageInterface["pk"] | ImageInterface["hash"];

  @ViewChild("carousel", { static: false, read: NgbCarousel })
  protected carousel: NgbCarousel;

  @ViewChild("carouselContainer")
  protected carouselContainer: ElementRef;

  protected animateCarousel = false;

  private _delayedLoadSubscription: Subscription = new Subscription();
  private _skipSlideEvent = false;
  private _hammer: HammerManager;
  private _panningAllowed = false;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly imageService: ImageService,
    public readonly utilsService: UtilsService,
    public readonly router: Router,
    public readonly windowRefService: WindowRefService,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly elementRef: ElementRef,
    public readonly deviceService: DeviceService,
    public readonly renderer: Renderer2
  ) {
    super(store$);

    router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.urlAfterRedirects),
      distinctUntilChanged(),
      takeUntil(this.destroyed$)
    ).subscribe(url => {
      const imageId = this.router.parseUrl(url).queryParams["i"];
      if (imageId) {
        this.setImage(imageId, false);
      }
    });

    const viewPortAspectRatio = this.windowRefService.getViewPortAspectRatio();
    const sideToSideLayout = this.deviceService.lgMin() || viewPortAspectRatio > 1;
    this.animateCarousel = this.deviceService.isTouchEnabled() && !sideToSideLayout;
  }

  @HostListener("window:popstate", ["$event"])
  onPopState(event: PopStateEvent) {
    if (event.state?.imageId && this.activeId !== event.state.imageId && !event.state?.fullscreen) {
      this.setImage(event.state.imageId, false);
    } else {
      this.closeSlideshow.emit(false);
    }
  }

  ngOnDestroy() {
    this._delayedLoadSubscription.unsubscribe();
  }

  activeImage(): ImageInterface {
    return this.navigationContext.find(item => item.imageId === this.activeId).image;
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
  }

  setImage(imageId: ImageInterface["pk"] | ImageInterface["hash"], emitChange: boolean = true) {
    this._loadImage(imageId).subscribe(image => {
      if (this.carousel) {
        this._skipSlideEvent = true;
        this.carousel.select(imageId.toString());
        this._skipSlideEvent = false;

        this.carousel.focus();
      }

      this.activeId = imageId;
      this._loadImagesAround();
      this._dropImagesTooFarFromIndex();

      if (this.navigationContext.length > 1 && isPlatformBrowser(this.platformId)) {
        this._setupPan();
      }

      if (emitChange) {
        this.imageChange.emit(image);
      }

      this.utilsService.delay(10).subscribe(() => {
        this.store$.dispatch(new ForceCheckTogglePropertyAutoLoad());
      });
    });
  }

  protected onSlide(event: NgbSlideEvent) {
    if (this._skipSlideEvent) {
      return;
    }

    if (!event.current) {
      return;
    }

    if (this.activeId === event.current) {
      return;
    }

    if (this._hammer) {
      this._hammer.destroy();
    }

    this.setImage(event.current);
  }

  protected onNextClick() {
    this.utilsService.delay(1).subscribe(() => {
      this.carousel.next();
    });
  }

  protected onPreviousClick() {
    this.utilsService.delay(1).subscribe(() => {
      this.carousel.prev();
    });
  }

  protected contextTrackByFn(index: number, item: ImageViewerNavigationContextItem) {
    return item.imageId;
  }

  private _loadImagesAround() {
    const index = this._getImageIndexInContext(this.activeId);
    for (let i = index - SLIDESHOW_BUFFER; i <= index + SLIDESHOW_BUFFER; i++) {
      if (i >= 0 && i < this.navigationContext.length && i !== index) {
        this._loadImage(this.navigationContext[i].imageId, Math.abs(index - i) * 100).subscribe();
      }
    }
  }

  private _dropImagesTooFarFromIndex() {
    // We do this for memory management reasons.
    const index = this._getImageIndexInContext(this.activeId);
    for (let i = 0; i < this.navigationContext.length; i++) {
      if (Math.abs(index - i) > SLIDESHOW_WINDOW) {
        this.navigationContext = this.navigationContext.map(item => {
          if (item.imageId === this.navigationContext[i].imageId) {
            return {
              ...item,
              image: undefined
            };
          }

          return item;
        });
      }
    }
  }

  private _loadImage(
    imageId: ImageInterface["pk"] | ImageInterface["hash"],
    delay: number = 0
  ): Observable<ImageInterface> {
    return new Observable(subscriber => {
      const index = this._getImageIndexInContext(imageId);

      if (this.navigationContext && this.navigationContext[index]?.image) {
        subscriber.next(this.navigationContext[index].image);
        subscriber.complete();
        return;
      }

      this._delayedLoadSubscription.add(this.utilsService.delay(delay).pipe(
        switchMap(() => this.imageService.loadImage(imageId))
      ).subscribe(image => {
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
      }));
    });
  }

  private _getImageIndexInContext(imageId: ImageInterface["pk"] | ImageInterface["hash"]): number {
    return this.navigationContext.findIndex(item => item.imageId === imageId);
  }

  private _setupPan() {
    const panItem = this._getPanItem();
    const currentIndex = this._getImageIndexInContext(this.activeId);

    this._hammer = new Hammer(panItem);
    this._hammer.get("pan").set({ direction: Hammer.DIRECTION_HORIZONTAL });

    let lastPanTime = 0;

    const throttle = (callback, delay) => {
      return function(...args) {
        const now = Date.now();
        if (now - lastPanTime >= delay) {
          lastPanTime = now;
          callback.apply(this, args);
        }
      };
    };

    this._hammer.on("panstart", ev => {
      if (this._cannotPanDueToBoundary(ev.deltaX)) {
        this._hammer.stop(true);
        this._panningAllowed = false;
        return;
      }

      this._panningAllowed = true;
      this._adjacentSlidePanStart(ev.deltaX);
      this._currentSlidePanStart(ev.deltaX);
    });

    this._hammer.on("pancancel", ev => {
      this._adjacentSlidePanReset();
      this._currentSlidePanReset();
    });

    // Handle pan movement
    this._hammer.on("panmove", ev => {
      let deltaX = ev.deltaX;

      if (this._cannotPanDueToBoundary(deltaX) || !this._panningAllowed) {
        return;
      }

      this._currentSlidePanMove(deltaX);
      this._adjacentSlidePanMove(deltaX);
    });

    // Handle end of pan (swipe release)
    this._hammer.on("panend", ev => {
      if (!this._panningAllowed) {
        return;
      }

      const totalDeltaX = ev.deltaX;
      const threshold = window.innerWidth / 3; // Set swipe threshold
      const direction = Math.sign(totalDeltaX); // Detect swipe direction

      if (Math.abs(totalDeltaX) > threshold) {
        // If swipe is beyond threshold, complete the transition
        const targetX = direction > 0 ? window.innerWidth : -window.innerWidth;
        const isFirstSlide = currentIndex === 0;
        const isLastSlide = currentIndex === this.navigationContext.length - 1;

        this._currentSlidePanMove(targetX);

        if (direction < 0 && !isLastSlide) {
          this.carousel.next(); // Swipe left to go to the next slide
        } else if (direction > 0 && !isFirstSlide) {
          this.carousel.prev(); // Swipe right to go to the previous slide
        }

        this.utilsService.delay(350).subscribe(() => {
          this._adjacentSlidePanReset();
          this._currentSlidePanReset();
        });
      } else {
        // If swipe didn't reach threshold, reset to original position
        this._adjacentSlidePanReset();
        this._currentSlidePanReset();
      }
    });
  }

  private _cannotPanDueToBoundary(deltaX: number): boolean {
    const index = this._getImageIndexInContext(this.activeId);
    const isFirstSlide = index === 0;
    const isLastSlide = index === this.navigationContext.length - 1;

    // Prevent panning to the right on the first slide
    if (isFirstSlide && deltaX > 0) {
      return true;
    }

    // Prevent panning to the left on the last slide
    return isLastSlide && deltaX < 0;
  }

  private _currentSlidePanStart(deltaX: number) {
    const slide = this._getCurrentSlide();
    this.renderer.setStyle(slide, "transition", "transform 0.3s ease");
    this.renderer.setStyle(slide, "transform", `translateX(${deltaX}px)`);
  }

  private _adjacentSlidePanStart(deltaX: number) {
    const slide = this._getAdjacentSlide(deltaX);
    this.renderer.setStyle(slide, "transition", "transform 0.3s ease, opacity 0.3s ease");
    this.renderer.setStyle(slide, "display", "block");
    this.renderer.setStyle(slide, "margin-right", "0");
    this.renderer.setStyle(slide, "transform", "scale(0.75)");
    this.renderer.setStyle(slide, "opacity", "0.1");
    this.renderer.setStyle(slide, "position", "absolute");
  }

  private _adjacentSlidePanReset() {
    const previousSlide = this._getPreviousSlide();
    const nextSlide = this._getNextSlide();

    for (const slide of [previousSlide, nextSlide]) {
      if (slide) {
        this.renderer.setStyle(slide, "transition", "unset");
        this.renderer.setStyle(slide, "display", "none");
        this.renderer.setStyle(slide, "margin-right", "-100%");
        this.renderer.setStyle(slide, "transform", "unset");
        this.renderer.setStyle(slide, "opacity", "unset");
        this.renderer.setStyle(slide, "position", "relative");
      }
    }
  }

  private _currentSlidePanReset() {
    const slide = this._getCurrentSlide();
    this.renderer.setStyle(slide, "transform", "scale(1)");
    this.renderer.setStyle(slide, "opacity", "1");

    this.utilsService.delay(300).subscribe(() => {
      this.renderer.setStyle(slide, "transition", "unset");
      this.renderer.setStyle(slide, "transform", "unset");
      this.renderer.setStyle(slide, "opacity", "unset");
      this.renderer.setStyle(slide, "position", "relative");
    });
  }

  private _currentSlidePanMove(deltaX: number) {
    const slide = this._getCurrentSlide();
    this.renderer.setStyle(slide, "transform", `translateX(${deltaX}px)`);
  }

  private _adjacentSlidePanMove(deltaX: number) {
    const adjacentSlide = this._getAdjacentSlide(deltaX);

    if (adjacentSlide) {
      // Calculate the percentage of movement based on the window width
      const movementPercentage = Math.min(Math.abs(deltaX) / this.windowRefService.nativeWindow.innerWidth, 1) * 100;

      // Calculate opacity: Start at 0.25 and approach 1 as movementPercentage approaches 100
      const opacity = 0.25 + (movementPercentage / 100) * 0.75;

      // Calculate scale: Start at 0.75 and approach 1 as movementPercentage approaches 100
      const scale = 0.75 + (movementPercentage / 100) * 0.25;

      // Apply styles to the adjacent slide
      this.renderer.setStyle(adjacentSlide, "transform", `scale(${scale})`);
      this.renderer.setStyle(adjacentSlide, "opacity", `${opacity}`);
    }
  }


  private _getCurrentSlide(): HTMLElement {
    return this.elementRef.nativeElement.querySelector(`#slide-${this.activeId}`);
  }

  private _getAdjacentSlide(deltaX: number) {
    if (deltaX > 0) {
      return this._getPreviousSlide();
    }
    return this._getNextSlide();
  }

  private _getPreviousSlide(): HTMLElement | null {
    const index = this._getImageIndexInContext(this.activeId);
    if (index > 0) {
      return this.elementRef.nativeElement.querySelector(
        `#slide-${this.navigationContext[index - 1].imageId}`
      );
    }
    return null;
  }

  private _getNextSlide(): HTMLElement | null {
    const index = this._getImageIndexInContext(this.activeId);
    if (index < this.navigationContext.length - 1) {
      return this.elementRef.nativeElement.querySelector(
        `#slide-${this.navigationContext[index + 1].imageId}`
      );
    }
    return null;
  }

  private _getPanItem(): HTMLElement {
    return this.elementRef.nativeElement.querySelector(`#slide-${this.activeId} .pan-container`);
  }

  private _removeWillChange(element: HTMLElement) {
    this.renderer.removeStyle(element, 'will-change');
    if (this._getNextSlide()) {
      this.renderer.removeStyle(this._getNextSlide(), 'will-change');
    }
    if (this._getPreviousSlide()) {
      this.renderer.removeStyle(this._getPreviousSlide(), 'will-change');
    }
  }
}
