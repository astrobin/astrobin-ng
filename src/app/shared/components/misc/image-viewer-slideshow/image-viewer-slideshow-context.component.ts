import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from "@angular/core";
import { ImageViewerNavigationContext, ImageViewerNavigationContextItem } from "@shared/services/image-viewer.service";
import { fromEvent, Subscription, throttleTime } from "rxjs";


@Component({
  selector: "astrobin-image-viewer-slideshow-context",
  template: `
    <div class="navigation-context-wrapper">
      <button
        (click)="scrollNavigationContextLeft()"
        astrobinEventPreventDefault
        astrobinEventStopPropagation
        class="scroll-left"
      >
        <fa-icon icon="chevron-circle-left"></fa-icon>
      </button>

      <div #navigationContextElement class="navigation-context">
        <div
          *ngFor="let item of navigationContext; trackBy: trackByFn"
          (click)="itemSelected.emit(item.imageId)"
          class="navigation-context-item"
          [class.active]="item.imageId === activeId"
        >
          <img
            [id]="'image-viewer-context-' + item.imageId"
            [src]="item.thumbnailUrl"
            alt=""
          />
        </div>
      </div>

      <button
        (click)="scrollNavigationContextRight()"
        astrobinEventPreventDefault
        astrobinEventStopPropagation
        class="scroll-right"
      >
        <fa-icon icon="chevron-circle-right"></fa-icon>
      </button>
    </div>
  `,
  styleUrls: ["./image-viewer-slideshow-context.component.scss"]
})
export class ImageViewerSlideshowContextComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input()
  navigationContext: ImageViewerNavigationContext;

  @Input()
  activeId: ImageViewerNavigationContextItem["imageId"];

  @Input()
  callerComponentId: string;

  @Output()
  itemSelected = new EventEmitter<ImageViewerNavigationContextItem["imageId"]>();

  @Output()
  nearEndOfContext = new EventEmitter<string>();

  @ViewChild("navigationContextElement", { static: true })
  navigationContextElement: ElementRef;

  private _scrollEventSubscription: Subscription;
  private _wheelEventSubscription: Subscription;

  ngAfterViewInit() {
    if (!this.navigationContextElement) {
      return;
    }

    const el = this.navigationContextElement.nativeElement;

    this._scrollEventSubscription = fromEvent<Event>(el, "scroll")
      .pipe(throttleTime(200))
      .subscribe(() => {
        const maxScrollLeft = el.scrollWidth;
        const currentScrollLeft = el.scrollLeft + el.clientWidth;

        if (currentScrollLeft >= maxScrollLeft - el.clientWidth * 2) {
          this.nearEndOfContext.emit(this.callerComponentId);
        }
      });

    this._wheelEventSubscription = fromEvent<WheelEvent>(el, "wheel")
      .subscribe((event: WheelEvent) => {
        event.preventDefault();
        const scrollAmount = event.deltaY;

        if (scrollAmount) {
          el.scrollLeft += scrollAmount;
        }
      });
  }

  ngOnDestroy() {
    if (this._scrollEventSubscription) {
      this._scrollEventSubscription.unsubscribe();
    }

    if (this._wheelEventSubscription) {
      this._wheelEventSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.activeId) {
      this.scrollToActiveId();
    }
  }

  protected trackByFn(index: number, item: ImageViewerNavigationContextItem) {
    return item.imageId;
  }

  protected scrollNavigationContextLeft(): void {
    const el = this.navigationContextElement.nativeElement;
    el.scrollBy({
      left: -el.clientWidth,
      behavior: "smooth"
    });
  }

  protected scrollNavigationContextRight(): void {
    const el = this.navigationContextElement.nativeElement;
    el.scrollBy({
      left: el.clientWidth,
      behavior: "smooth"
    });
  }

  protected scrollToActiveId(): void {
    const el = this.navigationContextElement.nativeElement;
    const activeElement = el.querySelector(`#image-viewer-context-${this.activeId}`);

    if (activeElement) {
      const targetScrollPosition = activeElement.offsetLeft - el.clientWidth / 2 + activeElement.clientWidth / 2;

      // Use the smooth scrolling behavior
      el.scrollTo({
        left: targetScrollPosition,
        behavior: 'smooth'
      });
    }
  }

}
