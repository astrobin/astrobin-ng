import { Inject, Injectable, PLATFORM_ID, Renderer2, RendererFactory2 } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@core/services/device.service";
import { UtilsService } from "@core/services/utils/utils.service";

enum SwipeDirection {
  Down = "down",
  Left = "left",
  Right = "right"
}

interface TouchCoordinates {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  previousX: number;
  previousY: number;
}

interface SwipeState {
  isSwiping: boolean;
  direction: SwipeDirection | null;
  progress: number;
  isDirectionMaintained: boolean;
}

@Injectable({
  providedIn: "root"
})
export class SwipeToCloseService {
  private renderer: Renderer2;
  private mutationObserver: MutationObserver;
  private readonly isBrowser: boolean;

  // Constants
  private SWIPE_THRESHOLD = 80; // Threshold for swipe gesture
  private MIN_HORIZONTAL_SWIPE = 15; // Minimum horizontal movement to detect horizontal swipe
  private MIN_VERTICAL_SWIPE = 15; // Minimum vertical movement to detect vertical swipe
  private SWIPE_ANGLE_TOLERANCE = 20; // Degrees of tolerance for direction detection

  constructor(
    private rendererFactory: RendererFactory2,
    private offcanvasService: NgbOffcanvas,
    private deviceService: DeviceService,
    private utilsService: UtilsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.setupMutationObserver();
      this.setupBackdropCleanupListener();
    }
  }

  /**
   * Method to clean up observers when needed
   */
  public destroy(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }

    // Remove our global click listener if it exists
    if (typeof window !== 'undefined' && this.backdropCleanupListener) {
      window.removeEventListener('click', this.backdropCleanupListener);
    }
  }

  private backdropCleanupListener: ((event: MouseEvent) => void) | null = null;

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
              const offcanvasElement = node as HTMLElement;

              // Determine the offcanvas position (top, bottom, start, end)
              const position = this.getOffcanvasPosition(offcanvasElement);

              // Attach appropriate swipe listeners based on position
              this.attachSwipeListeners(offcanvasElement, position);
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

  /**
   * Determine the position of the offcanvas panel based on its classes
   */
  private getOffcanvasPosition(element: HTMLElement): string {
    if (element.classList.contains("offcanvas-top")) {
      return "top";
    } else if (element.classList.contains("offcanvas-bottom")) {
      return "bottom";
    } else if (element.classList.contains("offcanvas-start")) {
      return "start";
    } else if (element.classList.contains("offcanvas-end")) {
      return "end";
    }

    // Default to bottom if position cannot be determined
    return "bottom";
  }

  /**
   * Attach the appropriate swipe listeners based on offcanvas position
   */
  private attachSwipeListeners(offcanvasElement: HTMLElement, position: string): void {
    const touchCoords: TouchCoordinates = {
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      previousX: 0,
      previousY: 0
    };

    const swipeState: SwipeState = {
      isSwiping: false,
      direction: null,
      progress: 0,
      isDirectionMaintained: true
    };

    // Determine the swipe direction needed to close based on position
    let requiredDirection: SwipeDirection;
    switch (position) {
      case "top":
        requiredDirection = SwipeDirection.Down;
        break;
      case "start": // Left sidebar needs right swipe
        requiredDirection = SwipeDirection.Left;
        break;
      case "end": // Right sidebar needs left swipe
        requiredDirection = SwipeDirection.Right;
        break;
      case "bottom":
      default:
        requiredDirection = SwipeDirection.Down;
        break;
    }

    // Touch start handler
    const handleTouchStart = (event: TouchEvent) => {
      if (!this.deviceService.isTouchEnabled() || !event.touches || event.touches.length === 0) {
        return;
      }

      // Reset swipe state
      swipeState.isSwiping = false;
      swipeState.direction = null;
      swipeState.progress = 0;
      swipeState.isDirectionMaintained = true;

      // Check if we're in a scrollable element that should block the swipe
      if (this.isElementScrollable(event.target as HTMLElement, position)) {
        return;
      }

      // Store touch start coordinates
      touchCoords.startX = event.touches[0].clientX;
      touchCoords.startY = event.touches[0].clientY;
      touchCoords.currentX = touchCoords.startX;
      touchCoords.currentY = touchCoords.startY;
      touchCoords.previousX = touchCoords.startX;
      touchCoords.previousY = touchCoords.startY;
    };

    // Touch move handler
    const handleTouchMove = (event: TouchEvent) => {
      if (!this.deviceService.isTouchEnabled() || !event.touches || event.touches.length === 0 ||
          (touchCoords.startX === 0 && touchCoords.startY === 0)) {
        return;
      }

      // Check for scrollable elements (if not already swiping)
      if (!swipeState.isSwiping && this.isElementScrollable(event.target as HTMLElement, position)) {
        return;
      }

      // Store previous position to track direction changes
      touchCoords.previousX = touchCoords.currentX;
      touchCoords.previousY = touchCoords.currentY;

      // Update current position
      touchCoords.currentX = event.touches[0].clientX;
      touchCoords.currentY = event.touches[0].clientY;

      // Calculate movement deltas
      const deltaX = touchCoords.currentX - touchCoords.startX;
      const deltaY = touchCoords.currentY - touchCoords.startY;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Determine direction if we haven't already, or update the existing one
      if (!swipeState.isSwiping) {
        // We need significant movement to determine swipe direction
        if (absDeltaX < this.MIN_HORIZONTAL_SWIPE && absDeltaY < this.MIN_VERTICAL_SWIPE) {
          return; // Not enough movement yet
        }

        // Determine if this is a horizontal or vertical swipe
        if (absDeltaX > absDeltaY) {
          // Horizontal swipe
          swipeState.direction = deltaX > 0 ? SwipeDirection.Right : SwipeDirection.Left;
        } else {
          // Vertical swipe
          swipeState.direction = deltaY > 0 ? SwipeDirection.Down : null;
        }

        // Check if the detected direction matches what we need for this position
        const isValidDirectionForPosition = (
          (position === "start" && swipeState.direction === SwipeDirection.Left) ||
          (position === "end" && swipeState.direction === SwipeDirection.Right) ||
          ((position === "top" || position === "bottom") && swipeState.direction === SwipeDirection.Down)
        );

        if (isValidDirectionForPosition) {
          swipeState.isSwiping = true;
          // Prevent default to stop scrolling
          event.preventDefault();
        } else {
          // Reset - this isn't the right direction
          swipeState.direction = null;
          return;
        }
      } else {
        // We're already swiping - check if the direction is maintained
        let currentDirection: SwipeDirection | null = null;

        // Detect current movement direction
        const movementX = touchCoords.currentX - touchCoords.previousX;
        const movementY = touchCoords.currentY - touchCoords.previousY;
        const absMovementX = Math.abs(movementX);
        const absMovementY = Math.abs(movementY);

        if (absMovementX > absMovementY) {
          // Horizontal movement
          currentDirection = movementX > 0 ? SwipeDirection.Right : SwipeDirection.Left;
        } else if (absMovementY > 0) {
          // Vertical movement
          currentDirection = movementY > 0 ? SwipeDirection.Down : null;
        }

        // Check if we're still moving in the right direction
        if (currentDirection !== swipeState.direction) {
          // Direction changed - mark as not maintained but keep tracking
          swipeState.isDirectionMaintained = false;
        } else if (currentDirection === swipeState.direction &&
                  Math.abs(movementX) > 10 || Math.abs(movementY) > 10) {
          // Moving in the right direction with significant movement - can restore
          swipeState.isDirectionMaintained = true;
        }

        // Always prevent default while swiping
        event.preventDefault();
      }

      // Calculate progress based on direction
      if (swipeState.isSwiping) {
        let distance = 0;
        switch (swipeState.direction) {
          case SwipeDirection.Left:
            distance = -deltaX; // Convert to positive
            break;
          case SwipeDirection.Right:
            distance = deltaX;
            break;
          case SwipeDirection.Down:
            distance = deltaY;
            break;
          default:
            distance = 0;
        }

        // Cap negative values (if finger moved backward)
        distance = Math.max(0, distance);
        swipeState.progress = distance / this.SWIPE_THRESHOLD;

        // Apply the appropriate animation
        this.applySwipeAnimation(offcanvasElement, position, swipeState.direction, swipeState.progress);
      }
    };

    // Touch end handler
    const handleTouchEnd = (event: TouchEvent) => {
      // If we're not swiping, just clean up
      if (!swipeState.isSwiping) {
        this.resetSwipeState(touchCoords, swipeState);
        return;
      }

      // If the direction wasn't maintained, cancel the swipe
      if (!swipeState.isDirectionMaintained) {
        this.resetSwipeAnimation(offcanvasElement, position);
        this.resetSwipeState(touchCoords, swipeState);
        return;
      }

      // Determine if threshold was reached
      if (swipeState.progress >= 1.0) {
        // Swipe completed - animate closure
        this.animateClose(offcanvasElement, position, swipeState.direction);

        // Dismiss offcanvas after a short delay
        this.utilsService.delay(100).subscribe(() => {
          // First dismiss the offcanvas
          this.offcanvasService.dismiss();

          // Then after a small delay, check and remove backdrop if needed
          setTimeout(() => {
            this.removeBackdropIfNeeded();
          }, 50);
        });
      } else {
        // Threshold not met - reset
        this.resetSwipeAnimation(offcanvasElement, position);
      }

      // Reset state
      this.resetSwipeState(touchCoords, swipeState);
    };

    // Attach the event listeners
    offcanvasElement.addEventListener("touchstart", handleTouchStart, { passive: false });
    offcanvasElement.addEventListener("touchmove", handleTouchMove, { passive: false });
    offcanvasElement.addEventListener("touchend", handleTouchEnd);

    // Store references for potential cleanup
    (offcanvasElement as any).__swipeListeners = {
      start: handleTouchStart,
      move: handleTouchMove,
      end: handleTouchEnd
    };
  }

  /**
   * Check if the element or any of its parents is scrollable in the swipe direction
   */
  private isElementScrollable(target: HTMLElement, position: string): boolean {
    let element = target;

    while (element && element !== document.body) {
      switch (position) {
        case "start":
        case "end":
          // For horizontal offcanvas, check horizontal scroll
          if (element.scrollWidth > element.clientWidth) {
            const isScrolledRight = element.scrollLeft + element.clientWidth >= element.scrollWidth;
            const isScrolledLeft = element.scrollLeft <= 0;

            // If scrolled to the edge in the swipe direction, allow swipe
            if ((position === "start" && !isScrolledLeft) ||
                (position === "end" && !isScrolledRight)) {
              return true;
            }
          }
          break;
        case "top":
        case "bottom":
        default:
          // For vertical offcanvas, check vertical scroll
          if (element.scrollHeight > element.clientHeight && element.scrollTop > 0) {
            return true;
          }
          break;
      }
      element = element.parentElement;
    }

    return false;
  }

  /**
   * Apply appropriate animation based on offcanvas position and swipe direction
   */
  private applySwipeAnimation(
    element: HTMLElement,
    position: string,
    direction: SwipeDirection,
    progress: number
  ): void {
    if (!element) return;

    // Ensure no transition for direct finger following
    this.renderer.setStyle(element, "transition", "none");
    this.renderer.setStyle(element, "will-change", "transform");

    // Force reflow to acknowledge style changes
    void element.offsetHeight;

    // Amount of movement (limited to avoid extreme values)
    const limitedProgress = Math.min(progress, 5); // Cap at 5x threshold
    const distance = limitedProgress * 100; // Scale up for visibility

    let transform = "";

    // Apply appropriate transform based on direction
    switch (position) {
      case "start":
        // Left panel - needs to move left
        transform = `translateX(-${distance}px)`;
        break;
      case "end":
        // Right panel - needs to move right
        transform = `translateX(${distance}px)`;
        break;
      case "top":
        // Top panel - needs to move down
        transform = `translateY(${distance}px)`;
        break;
      case "bottom":
      default:
        // Bottom panel - needs to move down
        transform = `translateY(${distance}px)`;
        break;
    }

    // Apply the transform
    this.renderer.setStyle(element, "transform", transform);
  }

  /**
   * Reset animation to return the offcanvas to its original position
   */
  private resetSwipeAnimation(element: HTMLElement, position: string): void {
    if (!element) return;

    // Set transition for smooth return
    this.renderer.setStyle(
      element,
      "transition",
      "transform 0.3s cubic-bezier(0.215, 0.61, 0.355, 1)"
    );

    // Reset transform based on position
    this.renderer.setStyle(element, "transform", "none");

    // Clean up after transition is done
    setTimeout(() => {
      if (element) {
        this.renderer.removeStyle(element, "transition");
        this.renderer.removeStyle(element, "transform");
        this.renderer.setStyle(element, "will-change", "auto");
      }
    }, 350);
  }

  /**
   * Animate the closing of the offcanvas in the appropriate direction
   */
  private animateClose(element: HTMLElement, position: string, direction: SwipeDirection): void {
    if (!element) return;

    // Set smooth transition
    this.renderer.setStyle(
      element,
      "transition",
      "transform 0.3s cubic-bezier(0.215, 0.61, 0.355, 1)"
    );

    // Force reflow
    void element.offsetHeight;

    // Determine final position for exit animation
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let transform = "";

    switch (position) {
      case "start":
        // Left panel exits to the left
        transform = `translateX(-${viewportWidth}px)`;
        break;
      case "end":
        // Right panel exits to the right
        transform = `translateX(${viewportWidth}px)`;
        break;
      case "top":
        // Top panel exits upward
        transform = `translateY(-${viewportHeight}px)`;
        break;
      case "bottom":
      default:
        // Bottom panel exits downward
        transform = `translateY(${viewportHeight}px)`;
        break;
    }

    // Apply the exit transform
    this.renderer.setStyle(element, "transform", transform);
  }

  /**
   * Reset the swipe tracking state
   */
  private resetSwipeState(coords: TouchCoordinates, state: SwipeState): void {
    coords.startX = 0;
    coords.startY = 0;
    coords.currentX = 0;
    coords.currentY = 0;
    coords.previousX = 0;
    coords.previousY = 0;

    state.isSwiping = false;
    state.direction = null;
    state.progress = 0;
    state.isDirectionMaintained = true;
  }

  /**
   * Force remove any lingering backdrops when the last offcanvas is closed
   * This handles edge cases when swiping to dismiss stacked offcanvases
   */
  private removeBackdropIfNeeded(): void {
    if (typeof document === 'undefined') {
      return;
    }

    // Check if there are any visible offcanvas panels
    const visibleOffcanvas = document.querySelectorAll('.offcanvas.show');

    // Find all backdrops
    const backdrops = document.querySelectorAll('.offcanvas-backdrop');

    if (visibleOffcanvas.length === 0 && backdrops.length > 0) {
      // No visible offcanvases but backdrop exists - clean up

      // Remove body classes first to restore scrolling
      document.body.classList.remove('offcanvas-open');
      document.body.classList.remove('modal-open');

      // Remove each backdrop with animation
      backdrops.forEach(backdrop => {
        // First remove the 'show' class to trigger fade-out animation
        backdrop.classList.remove('show');

        // Then remove the element after animation completes
        setTimeout(() => {
          if (backdrop.parentNode) {
            backdrop.parentNode.removeChild(backdrop);
          }
        }, 300);
      });
    }
  }

  /**
   * Add a global click listener to handle backdrop cleanup
   * This helps with edge cases where backdrop remains after swiping
   */
  private setupBackdropCleanupListener(): void {
    if (!this.isBrowser || typeof window === 'undefined') {
      return;
    }

    // Create a simple function to check for orphaned backdrops
    this.backdropCleanupListener = (event: MouseEvent) => {
      // Wait a moment for any Angular operations to complete
      setTimeout(() => {
        // Only run when clicking directly on the document (not elements in offcanvas)
        if (event.target === document.body || event.target === document) {
          this.removeBackdropIfNeeded();
        }
      }, 100);
    };

    // Add global listener
    window.addEventListener('click', this.backdropCleanupListener);
  }
}
