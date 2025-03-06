import { ElementRef, Injectable, Renderer2 } from "@angular/core";
import { DeviceService } from "./device.service";
import { UtilsService } from "./utils/utils.service";
import { PopNotificationsService } from "./pop-notifications.service";

@Injectable({
  providedIn: "root"
})
export class SwipeDownService {
  constructor(
    private readonly deviceService: DeviceService,
    private readonly utilsService: UtilsService,
    private readonly popNotificationsService: PopNotificationsService
  ) {
  }

  /**
   * Initializes swipe-down tracking on an element
   * @param event The touch event to process
   * @param touchStartY Reference to store the start Y position
   * @param touchCurrentY Reference to store the current Y position
   * @param touchPreviousY Reference to store the previous Y position
   * @param swipeDirectionDown Reference to track if swipe is going down
   * @returns Boolean indicating if the swipe should be allowed (false if in scrollable area)
   */
  handleTouchStart(
    event: TouchEvent,
    touchStartY: { value: number },
    touchCurrentY: { value: number },
    touchPreviousY: { value: number },
    swipeDirectionDown: { value: boolean }
  ): boolean {
    if (!this.deviceService.isTouchEnabled()) {
      return false;
    }

    // Check if we're in a scrollable element that has been scrolled
    const target = event.target as HTMLElement;
    let element = target;

    while (element && element !== document.body) {
      // Check if this element is scrollable and has been scrolled
      if (element.scrollHeight > element.clientHeight && element.scrollTop > 0) {
        // Element is scrolled - don't initiate swipe
        touchStartY.value = 0;
        return false;
      }
      element = element.parentElement;
    }

    // We're not in a scrolled element, track the touch
    touchStartY.value = event.touches[0].clientY;
    touchCurrentY.value = touchStartY.value;
    touchPreviousY.value = touchStartY.value;
    swipeDirectionDown.value = true;

    return true;
  }

  /**
   * Handles touch move events for swipe-down gesture
   * @param event The touch event
   * @param touchStartY The starting Y position
   * @param touchCurrentY The current Y position
   * @param touchPreviousY The previous Y position
   * @param swipeDirectionDown Tracks whether the swipe is going down
   * @param isSwiping Whether a swipe is in progress
   * @param swipeProgress The progress of the swipe (0-1+)
   * @param swipeThreshold The minimum distance to consider a valid swipe
   * @param elementRef The element reference to apply animation to
   * @param renderer The renderer service
   * @returns Boolean indicating if swipe is active
   */
  handleTouchMove(
    event: TouchEvent,
    touchStartY: { value: number },
    touchCurrentY: { value: number },
    touchPreviousY: { value: number },
    swipeDirectionDown: { value: boolean },
    isSwiping: { value: boolean },
    swipeProgress: { value: number },
    swipeThreshold: number,
    elementRef: ElementRef,
    renderer: Renderer2,
    checkZoomFunction?: () => boolean
  ): boolean {
    if (!this.deviceService.isTouchEnabled() || touchStartY.value === 0) {
      return false;
    }

    // If we need to check zoom level and the function says we can't swipe
    if (checkZoomFunction && !checkZoomFunction()) {
      return false;
    }

    // Get the target element where the touch is now
    const target = event.target as HTMLElement;

    // Check all parent elements for scrolling
    let element = target;
    while (element && element !== document.body) {
      // If any parent element is scrolled, cancel swipe
      if (element.scrollHeight > element.clientHeight && element.scrollTop > 0) {
        // Element is scrolled - cancel any active swipe
        if (isSwiping.value) {
          isSwiping.value = false;
          swipeProgress.value = 0;
          this._resetSwipeAnimation(elementRef, renderer);
        }
        touchStartY.value = 0;
        return false;
      }
      element = element.parentElement;
    }

    // Save previous position to detect direction changes
    touchPreviousY.value = touchCurrentY.value;

    // Update current position
    touchCurrentY.value = event.touches[0].clientY;

    // Determine swipe direction
    swipeDirectionDown.value = touchCurrentY.value > touchPreviousY.value;

    const deltaY = touchCurrentY.value - touchStartY.value;

    // Only handle swipe down (positive deltaY)
    if (deltaY > 0) {
      // Prevent default to disable scrolling while swiping
      event.preventDefault();
      isSwiping.value = true;

      // Calculate swipe progress
      swipeProgress.value = deltaY / swipeThreshold;

      // Apply transform to the component
      this._applySwipeAnimation(elementRef, renderer, swipeProgress.value);

      return true;
    }

    return false;
  }

  /**
   * Handles the touch end event for swipe gestures
   * @param isSwiping Whether a swipe is in progress
   * @param touchStartY The starting Y position
   * @param touchCurrentY The current Y position
   * @param touchPreviousY The previous Y position
   * @param swipeDirectionDown Whether the swipe is going down
   * @param swipeThreshold The threshold to consider a valid swipe
   * @param swipeProgress The current swipe progress
   * @param elementRef The element to animate
   * @param renderer The renderer service
   * @param closeCallback Function to call when swipe is complete
   */
  handleTouchEnd(
    isSwiping: { value: boolean },
    touchStartY: { value: number },
    touchCurrentY: { value: number },
    touchPreviousY: { value: number },
    swipeDirectionDown: { value: boolean },
    swipeThreshold: number,
    swipeProgress: { value: number },
    elementRef: ElementRef,
    renderer: Renderer2,
    closeCallback: () => void
  ): void {
    if (!isSwiping.value) {
      return;
    }

    const deltaY = touchCurrentY.value - touchStartY.value;

    // Only close if both conditions are met:
    // 1. The swipe distance exceeds the threshold
    // 2. The swipe was going downward at the end (not reversed)
    if (deltaY >= swipeThreshold && swipeDirectionDown.value) {
      // Swipe down threshold met and direction was downward at release
      isSwiping.value = false;

      // Set a final animation state (further down and more transparent)
      const finalTranslateY = deltaY + 100; // Add 100px more to current position
      const finalScale = 0.7;
      const finalOpacity = 0.2;

      // Apply the final animation state with transition
      if (elementRef && elementRef.nativeElement) {
        renderer.setStyle(
          elementRef.nativeElement,
          "transform",
          `translateY(${finalTranslateY}px) scale(${finalScale})`
        );

        renderer.setStyle(
          elementRef.nativeElement,
          "opacity",
          `${finalOpacity}`
        );

        renderer.setStyle(
          elementRef.nativeElement,
          "transition",
          "transform 0.2s ease-out, opacity 0.2s ease-out"
        );
      }

      // Add a class to the body to animate the background content in
      if (typeof document !== "undefined") {
        document.body.classList.add("image-viewer-closing");
      }

      // Close the slideshow after both animations complete
      this.utilsService.delay(300).subscribe(() => {
        // Clear notifications
        this.popNotificationsService.clear();

        // Execute close callback
        closeCallback();

        // Remove the class
        if (typeof document !== "undefined") {
          document.body.classList.remove("image-viewer-closing");
        }
      });
    } else {
      // Reset the animation if either:
      // - The threshold was not met, OR
      // - The swipe direction was reversed at the end
      isSwiping.value = false;
      swipeProgress.value = 0;
      this._resetSwipeAnimation(elementRef, renderer);
    }

    // Reset touch tracking
    touchStartY.value = 0;
    touchCurrentY.value = 0;
    touchPreviousY.value = 0;
  }

  /**
   * Applies visual animation during swipe gesture
   */
  private _applySwipeAnimation(elementRef: ElementRef, renderer: Renderer2, progress: number): void {
    if (!elementRef || !elementRef.nativeElement) {
      return;
    }

    // Calculate visual effects with limiters to prevent extreme values
    // Scale effect is limited to not go below 0.7
    const scale = Math.max(0.7, 1 - (progress * 0.1));

    // Translation has no maximum - let it follow finger as far as needed
    const translateY = progress * 100;

    // Opacity is limited to not go below 0.3
    const opacity = Math.max(0.3, 1 - (progress * 0.3));

    // Apply styles to the host element (this affects the entire component)
    renderer.setStyle(
      elementRef.nativeElement,
      "transform",
      `translateY(${translateY}px) scale(${scale})`
    );

    renderer.setStyle(
      elementRef.nativeElement,
      "opacity",
      `${opacity}`
    );

    renderer.setStyle(
      elementRef.nativeElement,
      "transition",
      "none"
    );
  }

  /**
   * Resets the animation when swipe is cancelled
   */
  private _resetSwipeAnimation(elementRef: ElementRef, renderer: Renderer2): void {
    if (!elementRef || !elementRef.nativeElement) {
      return;
    }

    // Reset host element animation
    renderer.setStyle(
      elementRef.nativeElement,
      "transform",
      "translateY(0) scale(1)"
    );

    renderer.setStyle(
      elementRef.nativeElement,
      "opacity",
      "1"
    );

    renderer.setStyle(
      elementRef.nativeElement,
      "transition",
      "transform 0.3s ease, opacity 0.3s ease"
    );
  }
}
