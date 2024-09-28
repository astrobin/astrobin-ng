import { Component, EventEmitter, HostListener, Input, OnDestroy, Output, ViewChild } from "@angular/core";
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

const SLIDESHOW_BUFFER = 1;
const SLIDESHOW_WINDOW = 3;

/*
    TODO:
    - Hammerjs panning.
 */
@Component({
  selector: "astrobin-image-viewer-slideshow",
  template: `
    <div class="carousel-container">
      <div class="carousel-area">
        <ngb-carousel
          #carousel
          *ngIf="navigationContext.length > 0; else loadingTemplate"
          (slide)="onSlide($event)"
          [animation]="false"
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
            *ngFor="let item of navigationContext; trackBy: contextTrackByFn"
            id="{{ item.imageId }}"
          >
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

  private _delayedLoadSubscription: Subscription = new Subscription();
  private _skipSlideEvent = false;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly imageService: ImageService,
    public readonly utilsService: UtilsService,
    public readonly router: Router
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
}
