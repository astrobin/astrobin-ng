import { Component, EventEmitter, HostListener, Input, OnDestroy, Output, ViewChild } from "@angular/core";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { ImageViewerNavigationContext, ImageViewerNavigationContextItem } from "@shared/services/image-viewer.service";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { ImageService } from "@shared/services/image/image.service";
import { NgbCarousel, NgbSlideEvent } from "@ng-bootstrap/ng-bootstrap";
import { UtilsService } from "@shared/services/utils/utils.service";
import { switchMap } from "rxjs/operators";
import { Observable, Subscription } from "rxjs";
import { ForceCheckImageAutoLoad } from "@app/store/actions/image.actions";

const SLIDESHOW_BUFFER = 1;
const SLIDESHOW_WINDOW = 3;

/*
    TODO:
    - Auto-open.
    - Esc key management when there are other things open like fullscreen, modals, offcanvas, etc.
    - Hammerjs panning.
 */
@Component({
  selector: "astrobin-image-viewer-slideshow",
  template: `
    <div class="carousel-container">
      <div class="carousel-area">
        <ngb-carousel
          #carousel
          *ngIf="navigationContext.length > 0"
          (slide)="onSlide($event)"
          [animation]="false"
          [activeId]="this.activeId"
          [interval]="0"
          [showNavigationArrows]="false"
          [showNavigationIndicators]="false"
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
              [image]="item.image"
              [showCloseButton]="true"
              [showPreviousButton]="activeId !== navigationContext[0].imageId"
              [showNextButton]="activeId !== navigationContext[navigationContext.length - 1].imageId"
              (closeClick)="closeSlideshow.emit()"
              (nextClick)="carousel.next()"
              (previousClick)="carousel.prev()"
            ></astrobin-image-viewer>
          </ng-template>
        </ngb-carousel>
      </div>

      <div class="context-area">
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
  closeSlideshow = new EventEmitter<void>();

  @Output()
  nearEndOfContext = new EventEmitter<ImageViewerNavigationContextItem["imageId"]>();

  @ViewChild("carousel", { static: false, read: NgbCarousel })
  protected carousel: NgbCarousel;

  protected activeId: ImageInterface["pk"] | ImageInterface["hash"];

  private _delayedLoadSubscription: Subscription = new Subscription();

  constructor(
    public readonly store$: Store<MainState>,
    public readonly imageService: ImageService,
    public readonly utilsService: UtilsService
  ) {
    super(store$);
  }

  @HostListener("document:keydown.escape", ["$event"])
  handleEscapeKey(event: KeyboardEvent) {
    this.closeSlideshow.emit();
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

  setImage(imageId: ImageInterface["pk"] | ImageInterface["hash"]) {
    this._loadImage(imageId).subscribe(image => {
      this.activeId = imageId;
      this._loadImagesAround();
      this._dropImagesTooFarFromIndex();
      this.carousel.select(imageId.toString());

      this.utilsService.delay(100).subscribe(() => {
        this.store$.dispatch(new ForceCheckImageAutoLoad({ imageId: image.pk }))
      });
    });
  }

  protected onSlide(event: NgbSlideEvent) {
    if (!event.current) {
      return;
    }

    if (this.activeId === event.current) {
      return;
    }

    this.setImage(event.current);
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
        // this.navigationContext[i].image = null;
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

      if (index === -1) {
        subscriber.error("Image not found in context");
        subscriber.complete();
        return;
      }

      if (this.navigationContext[index].image) {
        subscriber.next(this.navigationContext[index].image);
        subscriber.complete();
        return;
      }

      this._delayedLoadSubscription.add(this.utilsService.delay(delay).pipe(
        switchMap(() => this.imageService.loadImage(imageId))
      ).subscribe(image => {
        this.navigationContext = this.navigationContext.map(item => {
          if (item.imageId === imageId) {
            return {
              ...item,
              image
            };
          }

          return item;
        });

        subscriber.next(image);
        subscriber.complete();
      }));
    });
  }

  private _getImageIndexInContext(imageId: ImageInterface["pk"] | ImageInterface["hash"]): number {
    return this.navigationContext.findIndex(item => item.imageId === imageId);
  }
}
