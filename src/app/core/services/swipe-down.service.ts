import type { ElementRef, Renderer2 } from "@angular/core";
import { Injectable } from "@angular/core";

import { DeviceService } from "./device.service";
import { PopNotificationsService } from "./pop-notifications.service";
import { UtilsService } from "./utils/utils.service";

@Injectable({
  providedIn: "root"
})
export class SwipeDownService {
  // the gesture when they release their finger
  private _swipeCancellationIntended = false;

  // Flag to track if the user has moved upward during a swipe, which should cancel

  constructor(
    private readonly deviceService: DeviceService,
    private readonly utilsService: UtilsService,
    private readonly popNotificationsService: PopNotificationsService
  ) {}

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

    // Reset the cancellation flag when starting a new touch
    this._swipeCancellationIntended = false;

    // Check if we're touching an element that should be ignored for swipe-down
    const target = event.target as HTMLElement;
    if (
      target &&
      (target.hasAttribute("data-ignore-swipe-down") || target.closest('[data-ignore-swipe-down="true"]'))
    ) {
      // This element or its parent has the ignore attribute - don't initiate swipe
      touchStartY.value = 0;
      return false;
    }

    // Check if we're in a scrollable element that has been scrolled
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
    checkZoomFunction?: () => boolean,
    animationType: "full" | "translate-only" = "full"
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

    // Check if we're touching an element that should be ignored for swipe-down
    if (
      target &&
      (target.hasAttribute("data-ignore-swipe-down") || target.closest('[data-ignore-swipe-down="true"]'))
    ) {
      // This element or its parent has the ignore attribute - cancel any active swipe
      if (isSwiping.value) {
        isSwiping.value = false;
        swipeProgress.value = 0;
        this._resetSwipeAnimation(elementRef, renderer, animationType);
      }
      touchStartY.value = 0;
      return false;
    }

    // Check all parent elements for scrolling
    let element = target;
    while (element && element !== document.body) {
      // If any parent element is scrolled, cancel swipe
      if (element.scrollHeight > element.clientHeight && element.scrollTop > 0) {
        // Element is scrolled - cancel any active swipe
        if (isSwiping.value) {
          isSwiping.value = false;
          swipeProgress.value = 0;
          this._resetSwipeAnimation(elementRef, renderer, animationType);
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

    // If the user is moving up or down, update our intention flag
    if (isSwiping.value) {
      if (!swipeDirectionDown.value) {
        // Check if the upward movement is significant (more than 10px)
        const upwardMovement = touchPreviousY.value - touchCurrentY.value;
        if (upwardMovement > 10) {
          // Mark that the user intends to cancel, but don't stop tracking or animate
          // We'll only use this flag when they release their finger
          this._swipeCancellationIntended = true;
        }
      } else if (this._swipeCancellationIntended) {
        // If moving down again after previously moving up
        const downwardMovement = touchCurrentY.value - touchPreviousY.value;
        if (downwardMovement > 20) {
          // Require slightly more movement to un-cancel
          this._swipeCancellationIntended = false;
        }
      }
    }

    // Handle both downward and upward movement - always update the animation
    if (isSwiping.value) {
      // Prevent default to disable scrolling while swiping
      event.preventDefault();

      // Always update the animation to follow the finger, even if cancellation will happen on touchend
      // If the finger moves above the start position, treat delta as 0
      // This prevents the element from moving upward from its original position
      const limitedDeltaY = Math.max(0, deltaY);

      // Calculate swipe progress based on limited delta
      swipeProgress.value = limitedDeltaY / swipeThreshold;

      // Apply transform to the component - always apply the current animation
      // state to keep the element following the finger
      this._applySwipeAnimation(elementRef, renderer, swipeProgress.value, animationType);

      return true;
    } else if (deltaY > 0) {
      // If we're just starting to swipe down, initialize
      event.preventDefault();
      isSwiping.value = true;
      swipeProgress.value = deltaY / swipeThreshold;
      this._applySwipeAnimation(elementRef, renderer, swipeProgress.value, animationType);
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
   * @param swipeDirectionDown Whether the last movement was downward (used for animation, not for threshold detection)
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
    closeCallback: () => void,
    animationType: "full" | "translate-only" = "full"
  ): void {
    // If we're not swiping or have no valid touch, just reset state and return
    if (!isSwiping.value || touchStartY.value === 0) {
      // Clean up any lingering styles or transformations
      if (elementRef && elementRef.nativeElement) {
        // Reset transform properties immediately
        this._resetSwipeAnimation(elementRef, renderer, animationType);
      }

      // Reset all state variables
      isSwiping.value = false;
      touchStartY.value = 0;
      touchCurrentY.value = 0;
      touchPreviousY.value = 0;
      swipeProgress.value = 0;
      this._swipeCancellationIntended = false;
      return;
    }

    const deltaY = touchCurrentY.value - touchStartY.value;

    // Reset the swiping state
    isSwiping.value = false;

    // CRITICAL: Check if the last direction was upward - if so, ABORT the swipe
    // This is the key feature: if user swiped down then up without lifting finger, abort
    if (!swipeDirectionDown.value || this._swipeCancellationIntended || deltaY <= 0 || deltaY < swipeThreshold) {
      swipeProgress.value = 0;

      // Use CSS animation for smoother return for both offcanvas and image viewer
      if (elementRef && elementRef.nativeElement) {
        // Clear any existing animation classes first
        renderer.removeClass(elementRef.nativeElement, "swipe-to-close-animate");
        renderer.removeClass(elementRef.nativeElement, "swipe-to-close-offcanvas-animate");

        // Mark as animating
        renderer.addClass(elementRef.nativeElement, "swipe-to-close-animating");

        // Add appropriate animation class
        renderer.addClass(elementRef.nativeElement, "swipe-to-close-return-to-normal");

        // Listen for animation end
        const onAnimationEnd = (event: any) => {
          if (event.animationName === "return-to-normal") {
            // Remove all animation-related classes
            renderer.removeClass(elementRef.nativeElement, "swipe-to-close-return-to-normal");
            renderer.removeClass(elementRef.nativeElement, "swipe-to-close-animating");

            // Also remove any transform styling that might be leftover
            renderer.removeStyle(elementRef.nativeElement, "transform");
            renderer.removeStyle(elementRef.nativeElement, "opacity");

            elementRef.nativeElement.removeEventListener("animationend", onAnimationEnd);
          }
        };

        elementRef.nativeElement.addEventListener("animationend", onAnimationEnd);
      }

      // For image viewer, make sure the image-viewer-open class is restored if we're cancelling
      if (animationType !== "translate-only" && typeof document !== "undefined") {
        document.body.classList.remove("image-viewer-closing");
        document.body.classList.add("image-viewer-open");
      }

      // Reset state
      touchStartY.value = 0;
      touchCurrentY.value = 0;
      touchPreviousY.value = 0;
      this._swipeCancellationIntended = false;
      return;
    }

    // Only get here if swipe was downward and exceeded threshold
    if (deltaY >= swipeThreshold) {
      // Determine the animation based on type
      // Use CSS animation class for better performance for both offcanvas and image viewer
      if (elementRef && elementRef.nativeElement) {
        // Mark as animating
        renderer.addClass(elementRef.nativeElement, "swipe-to-close-animating");

        // Add animation class based on type
        if (animationType === "translate-only") {
          // For offcanvas, add a different animation class
          renderer.addClass(elementRef.nativeElement, "swipe-to-close-offcanvas-animate");
        } else {
          // For image viewer
          renderer.addClass(elementRef.nativeElement, "swipe-to-close-animate");
        }

        // Listen for animation end
        const onAnimationEnd = (event: any) => {
          const expectedAnimation = animationType === "translate-only" ? "offcanvas-swipe-to-close" : "swipe-to-close";

          if (event.animationName === expectedAnimation) {
            // Animation complete - clean up event listener and classes
            renderer.removeClass(elementRef.nativeElement, "swipe-to-close-animating");
            if (animationType === "translate-only") {
              renderer.removeClass(elementRef.nativeElement, "swipe-to-close-offcanvas-animate");
            } else {
              renderer.removeClass(elementRef.nativeElement, "swipe-to-close-animate");
            }
            elementRef.nativeElement.removeEventListener("animationend", onAnimationEnd);
          }
        };

        elementRef.nativeElement.addEventListener("animationend", onAnimationEnd);
      }

      // Close the element after a short delay
      this.utilsService.delay(100).subscribe(() => {
        // Clear notifications
        this.popNotificationsService.clear();

        // Execute close callback
        closeCallback();
      });
    } else {
      // Threshold not met - reset animation
      swipeProgress.value = 0;
      this._resetSwipeAnimation(elementRef, renderer, animationType);

      // For image viewer, make sure the image-viewer-open class is restored
      if (animationType !== "translate-only" && typeof document !== "undefined") {
        document.body.classList.remove("image-viewer-closing");
        document.body.classList.add("image-viewer-open");
      }
    }

    // Reset touch tracking
    touchStartY.value = 0;
    touchCurrentY.value = 0;
    touchPreviousY.value = 0;
  }

  /**
   * Applies visual animation during swipe gesture
   * @param elementRef The element to animate
   * @param renderer The Angular renderer
   * @param progress The swipe progress (0-1+)
   * @param animationType Optional animation type ('full' = scale+opacity, 'translate-only' = just position)
   */
  private _applySwipeAnimation(
    elementRef: ElementRef,
    renderer: Renderer2,
    progress: number,
    animationType: "full" | "translate-only" = "full"
  ): void {
    if (!elementRef || !elementRef.nativeElement) {
      return;
    }

    // Set a limit on progress to avoid extreme values that might cause issues
    const limitedProgress = Math.min(progress, 10); // Cap at 10x threshold

    // Translation has no maximum - let it follow finger as far as needed
    const translateY = limitedProgress * 100;

    // When applying swipe animation, always ensure we have no transition
    // so the element follows the finger directly without any smoothing
    renderer.setStyle(elementRef.nativeElement, "transition", "none");

    // Set will-change to let the browser know we'll be animating these properties
    // This enables hardware acceleration for smoother animations
    if (animationType === "translate-only") {
      renderer.setStyle(elementRef.nativeElement, "will-change", "transform");
    } else {
      renderer.setStyle(elementRef.nativeElement, "will-change", "transform, opacity");
    }

    // Force browser to acknowledge the transition removal before setting new styles
    // This fixes issues where animations might get "stuck"
    if (typeof window !== "undefined") {
      // Force a layout reflow
      void elementRef.nativeElement.offsetHeight;
    }

    if (animationType === "translate-only") {
      // For offcanvas and similar elements - only translate, no scaling or opacity
      renderer.setStyle(elementRef.nativeElement, "transform", `translateY(${translateY}px)`);
    } else {
      // Full animation with scale and opacity effects (for image viewer)
      // Scale effect is limited to not go below 0.7
      const scale = Math.max(0.7, 1 - limitedProgress * 0.1);

      // Opacity is limited to not go below 0.3
      const opacity = Math.max(0.3, 1 - limitedProgress * 0.3);

      renderer.setStyle(elementRef.nativeElement, "transform", `translateY(${translateY}px) scale(${scale})`);

      renderer.setStyle(elementRef.nativeElement, "opacity", `${opacity}`);
    }
  }

  /**
   * Resets the animation when swipe is cancelled
   * @param elementRef The element to animate
   * @param renderer The Angular renderer
   * @param animationType Optional animation type ('full' = scale+opacity, 'translate-only' = just position)
   */
  private _resetSwipeAnimation(
    elementRef: ElementRef,
    renderer: Renderer2,
    animationType: "full" | "translate-only" = "full"
  ): void {
    if (!elementRef || !elementRef.nativeElement) {
      return;
    }

    // Clean up any existing animation classes
    renderer.removeClass(elementRef.nativeElement, "swipe-to-close-animate");
    renderer.removeClass(elementRef.nativeElement, "swipe-to-close-offcanvas-animate");
    renderer.removeClass(elementRef.nativeElement, "swipe-to-close-return-to-normal");
    renderer.removeClass(elementRef.nativeElement, "swipe-to-close-animating");

    // Also remove any inline transform that might be in place
    renderer.removeStyle(elementRef.nativeElement, "transform");
    if (animationType !== "translate-only") {
      renderer.removeStyle(elementRef.nativeElement, "opacity");
    }

    // Force a reflow to ensure the style removal takes effect
    if (typeof window !== "undefined") {
      void elementRef.nativeElement.offsetHeight;
    }

    // Now set the transition to enable smooth animation back
    if (animationType === "translate-only") {
      renderer.setStyle(elementRef.nativeElement, "transition", "transform 0.3s cubic-bezier(0.215, 0.61, 0.355, 1)");

      // Use hardware acceleration to improve performance
      renderer.setStyle(elementRef.nativeElement, "will-change", "transform");

      // Force a reflow to ensure the browser registers the transition
      if (typeof window !== "undefined") {
        void elementRef.nativeElement.offsetHeight;
      }

      // Now apply the transform to animate smoothly back to original position
      renderer.setStyle(elementRef.nativeElement, "transform", "translateY(0)");
    } else {
      // For image viewer - set both transitions at once
      renderer.setStyle(
        elementRef.nativeElement,
        "transition",
        "transform 0.3s cubic-bezier(0.215, 0.61, 0.355, 1), opacity 0.3s cubic-bezier(0.215, 0.61, 0.355, 1)"
      );

      // Use hardware acceleration to improve performance
      renderer.setStyle(elementRef.nativeElement, "will-change", "transform, opacity");

      // Force a reflow to ensure the browser registers the transition
      if (typeof window !== "undefined") {
        void elementRef.nativeElement.offsetHeight;
      }

      // Now apply both transform and opacity to animate back
      renderer.setStyle(elementRef.nativeElement, "transform", "translateY(0) scale(1)");

      renderer.setStyle(elementRef.nativeElement, "opacity", "1");
    }

    // Add a final safety - after transition completes, make sure styles are reset
    if (typeof window !== "undefined") {
      setTimeout(() => {
        if (elementRef && elementRef.nativeElement) {
          if (animationType === "translate-only") {
            renderer.setStyle(elementRef.nativeElement, "transform", "translateY(0)");
            // Clean up will-change to free resources when not animating
            renderer.setStyle(elementRef.nativeElement, "will-change", "auto");
          } else {
            renderer.setStyle(elementRef.nativeElement, "transform", "translateY(0) scale(1)");
            renderer.setStyle(elementRef.nativeElement, "opacity", "1");
            // Clean up will-change to free resources when not animating
            renderer.setStyle(elementRef.nativeElement, "will-change", "auto");
          }
        }
      }, 350); // Just after transition should be complete
    }
  }
}
