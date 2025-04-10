import { isPlatformBrowser } from "@angular/common";
import { Renderer2, RendererFactory2, Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { SwipeDownService } from "@core/services/swipe-down.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";

@Injectable({
  providedIn: "root"
})
export class SwipeDownToCloseService {
  private renderer: Renderer2;
  private mutationObserver: MutationObserver;
  private isBrowser: boolean;

  // Constants
  private SWIPE_THRESHOLD = 80; // Lower threshold for easier swipe gesture

  private touchStartY: { value: number } = { value: 0 };
  private touchCurrentY: { value: number } = { value: 0 };
  private touchPreviousY: { value: number } = { value: 0 };
  private isSwiping: { value: boolean } = { value: false };
  private swipeProgress: { value: number } = { value: 0 };
  private swipeDirectionDown: { value: boolean } = { value: true };

  constructor(
    private rendererFactory: RendererFactory2,
    private offcanvasService: NgbOffcanvas,
    private swipeDownService: SwipeDownService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.setupMutationObserver();
    }
  }

  /**
   * Method to clean up observers when needed
   */
  public destroy(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }

  private setupMutationObserver(): void {
    // Only run in browser
    if (!this.isBrowser || typeof document === "undefined") {
      return;
    }

    // Create a MutationObserver to watch for new offcanvas panels
    this.mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach(node => {
            if (node.nodeName && node.nodeName.toLowerCase() === "ngb-offcanvas-panel") {
              this.attachSwipeListeners(node as HTMLElement);
            }
          });
        }
      });
    });

    // Start observing the body for new offcanvas panels
    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: false // Just direct children of body
    });
  }

  private attachSwipeListeners(offcanvasElement: HTMLElement): void {
    // Reset swipe state for this new offcanvas
    this.touchStartY.value = 0;
    this.touchCurrentY.value = 0;
    this.touchPreviousY.value = 0;
    this.isSwiping.value = false;
    this.swipeProgress.value = 0;
    this.swipeDirectionDown.value = true;

    // Handlers for touch events
    const handleTouchStart = (event: TouchEvent) => {
      // Use SwipeDownService to handle the touch start
      this.swipeDownService.handleTouchStart(
        event,
        this.touchStartY,
        this.touchCurrentY,
        this.touchPreviousY,
        this.swipeDirectionDown
      );
    };

    const handleTouchMove = (event: TouchEvent) => {
      // Let the SwipeDownService handle the touch move and animation
      // For offcanvas we use 'translate-only' animation (no opacity/scaling)
      this.swipeDownService.handleTouchMove(
        event,
        this.touchStartY,
        this.touchCurrentY,
        this.touchPreviousY,
        this.swipeDirectionDown,
        this.isSwiping,
        this.swipeProgress,
        this.SWIPE_THRESHOLD,
        { nativeElement: offcanvasElement },
        this.renderer,
        undefined, // No checkZoomFunction needed
        "translate-only" // Use translation-only animation for offcanvas
      );

      // If we're swiping, prevent scrolling
      if (this.isSwiping.value) {
        event.preventDefault();
      }
    };

    const handleTouchEnd = (event: TouchEvent) => {
      // Let SwipeDownService handle everything, including the callback
      // For offcanvas we use 'translate-only' animation
      this.swipeDownService.handleTouchEnd(
        this.isSwiping,
        this.touchStartY,
        this.touchCurrentY,
        this.touchPreviousY,
        this.swipeDirectionDown,
        this.SWIPE_THRESHOLD,
        this.swipeProgress,
        { nativeElement: offcanvasElement },
        this.renderer,
        () => {
          // Handle the close action when threshold is met
          this.handleOffcanvasClose(offcanvasElement);
        },
        "translate-only" // Use translation-only animation for offcanvas
      );
    };

    // Check for nested elements that might intercept touches
    const header = offcanvasElement.querySelector(".offcanvas-header");
    const body = offcanvasElement.querySelector(".offcanvas-body");

    // We need to differentiate clicks from swipes, but keep it simple
    const wrappedTouchStart = (event: TouchEvent) => {
      handleTouchStart(event);
    };

    const wrappedTouchMove = (event: TouchEvent) => {
      handleTouchMove(event);
    };

    const wrappedTouchEnd = (event: TouchEvent) => {
      // Only process if we're swiping
      if (!this.isSwiping.value) {
        return;
      }

      // We don't need to check for swipe direction or cancellation here
      // as the swipeDownService.handleTouchEnd will do that for us

      // Handle as normal swipe
      handleTouchEnd(event);
    };

    // Attach event listeners to the offcanvas panel
    // Don't use capture for regular click handling to work
    offcanvasElement.addEventListener("touchstart", wrappedTouchStart, { passive: false });
    offcanvasElement.addEventListener("touchmove", wrappedTouchMove, { passive: false });
    offcanvasElement.addEventListener("touchend", wrappedTouchEnd);

    // Keep reference to listeners for potential cleanup
    (offcanvasElement as any).__swipeListeners = {
      start: wrappedTouchStart,
      move: wrappedTouchMove,
      end: wrappedTouchEnd,
      elements: [offcanvasElement]
    };
  }

  /**
   * Handles the closing of an offcanvas element after animation
   */
  private handleOffcanvasClose(offcanvasElement: HTMLElement): void {
    // Immediately dismiss the offcanvas
    this.offcanvasService.dismiss();

    // But also animate the panel off-screen for a nicer visual effect
    const viewportHeight = window.innerHeight;
    this.renderer.setStyle(offcanvasElement, "transform", `translateY(${viewportHeight}px)`);

    // Make sure the transition is shorter for a more responsive feel
    this.renderer.setStyle(offcanvasElement, "transition", "transform 0.2s ease-out");
  }
}
