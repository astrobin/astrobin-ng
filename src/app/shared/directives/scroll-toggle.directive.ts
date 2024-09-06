import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, Renderer2 } from "@angular/core";
import { fromEvent, Subscription } from "rxjs";
import { throttleTime } from "rxjs/operators";
import { WindowRefService } from "@shared/services/window-ref.service";

@Directive({
  selector: "[astrobinScrollToggle]"
})
export class ScrollToggleDirective implements AfterViewInit, OnDestroy {
  @Input() topElement!: HTMLElement;   // Optional: Top element to show/hide
  @Input() bottomElement!: HTMLElement; // Optional: Bottom element to show/hide
  @Input() throttle = 30;  // Throttle time (default is 100ms)
  @Input() hideThreshold = 10;  // Scroll distance threshold (default is 50px)
  @Input() globalScroll = false;  // Whether to listen on window (global) scroll

  private lastScrollTop = 0;
  private scrollSubscription!: Subscription;
  private topElementVisible = true;
  private bottomElementVisible = true;

  constructor(
    private readonly el: ElementRef,
    private readonly renderer: Renderer2,
    private readonly windowRefService: WindowRefService
  ) {
  }

  ngAfterViewInit(): void {
    // Determine the scroll source (element or window)
    const scrollTarget = this.globalScroll ? this.windowRefService.nativeWindow : this.el.nativeElement;

    // Listen for scroll events on the scrollable element or globally
    this.scrollSubscription = fromEvent(scrollTarget, "scroll").pipe(
      throttleTime(this.throttle)
    ).subscribe(() => {
      const currentScrollTop = this.globalScroll ? window.scrollY : this.el.nativeElement.scrollTop;

      // Handle the top element (e.g., search bar with offset)
      if (this.topElement) {
        this.handleTopElementScroll(currentScrollTop);
      }

      // Handle the bottom element (e.g., footer)
      if (this.bottomElement) {
        this.handleBottomElementScroll(currentScrollTop);
      }

      this.lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;  // Avoid negative scroll values
    });
  }

  ngOnDestroy(): void {
    // Clean up the subscription when the directive is destroyed
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
  }

  private handleBottomElementScroll(currentScrollTop: number): void {
    const bottomElementHeight = this.bottomElement.offsetHeight;

    if (currentScrollTop > this.lastScrollTop) {
      // Scrolling down, show the bottom element
      if (!this.bottomElementVisible) {
        this.renderer.setStyle(this.bottomElement, "transform", "translateY(0)");
        this.bottomElementVisible = true;
      }
    } else if (currentScrollTop < this.lastScrollTop - this.hideThreshold) {
      // Scrolling up, hide the bottom element
      if (this.bottomElementVisible) {
        this.renderer.setStyle(this.bottomElement, `transform`, `translateY(${bottomElementHeight}px)`);
        this.bottomElementVisible = false;
      }
    }
  }

  private handleTopElementScroll(currentScrollTop: number): void {
    const topElementHeight = this.topElement.offsetHeight;
    const topElementOffsetTop = parseInt(window.getComputedStyle(this.topElement).top || "0", 10); // Get the CSS 'top' value

    // Calculate the total amount to move the element out of view
    const totalOffset = topElementHeight + topElementOffsetTop;

    if (currentScrollTop > this.lastScrollTop) {
      // Scrolling down, hide the top element (move it up by its total offset)
      if (this.topElementVisible) {
        this.renderer.setStyle(this.topElement, `transform`, `translateY(-${totalOffset}px)`);
        this.topElementVisible = false;
      }
    } else if (currentScrollTop < this.lastScrollTop - this.hideThreshold) {
      // Scrolling up, show the top element (reset transform)
      if (!this.topElementVisible) {
        this.renderer.setStyle(this.topElement, "transform", "translateY(0)");
        this.topElementVisible = true;
      }
    }
  }
}
