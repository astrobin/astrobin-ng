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
  
  // Flag to track if the user has moved upward during a swipe, which should cancel
  // the gesture when they release their finger
  private _swipeCancellationIntended = false;

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
    checkZoomFunction?: () => boolean,
    animationType: 'full' | 'translate-only' = 'full'
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
          // Mark that the user intends to cancel, but don't stop tracking
          this._swipeCancellationIntended = true;
          
          // Update the animation to reflect the current progress
          // but we won't reset completely to allow the user to recover
          this._applySwipeAnimation(elementRef, renderer, swipeProgress.value, animationType);
        }
      } else if (this._swipeCancellationIntended) {
        // If moving down again after previously moving up
        const downwardMovement = touchCurrentY.value - touchPreviousY.value;
        if (downwardMovement > 20) {  // Require slightly more movement to un-cancel
          this._swipeCancellationIntended = false;
        }
      }
    }

    // Only handle swipe down (positive deltaY)
    if (deltaY > 0) {
      // Prevent default to disable scrolling while swiping
      event.preventDefault();
      isSwiping.value = true;

      // Calculate swipe progress
      swipeProgress.value = deltaY / swipeThreshold;

      // Apply transform to the component
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
    animationType: 'full' | 'translate-only' = 'full'
  ): void {
    // If we're not swiping, don't proceed with any end logic
    if (!isSwiping.value || touchStartY.value === 0) {
      return;
    }

    const deltaY = touchCurrentY.value - touchStartY.value;
    
    // Reset the swiping state
    isSwiping.value = false;
    
    // Check if the user intended to cancel (had significant upward movement)
    if (this._swipeCancellationIntended || deltaY <= 0) {
      swipeProgress.value = 0;
      this._resetSwipeAnimation(elementRef, renderer, animationType);
      
      // For image viewer, make sure the image-viewer-open class is restored if we're cancelling
      if (animationType !== 'translate-only' && typeof document !== "undefined") {
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
    
    // Trigger if the swipe distance is sufficient
    if (deltaY >= swipeThreshold) {
      // Determine the animation based on type
      if (animationType === 'translate-only') {
        // For offcanvas - translate all the way off screen
        const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1000;
        
        if (elementRef && elementRef.nativeElement) {
          renderer.setStyle(
            elementRef.nativeElement,
            "transform",
            `translateY(${viewportHeight}px)`
          );
          
          renderer.setStyle(
            elementRef.nativeElement,
            "transition",
            "transform 0.3s ease-out"
          );
        }
      } else {
        // For image viewer - apply scale and opacity
        const finalTranslateY = deltaY + 100; 
        const finalScale = 0.7;
        const finalOpacity = 0.2;
        
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
      if (animationType !== 'translate-only' && typeof document !== "undefined") {
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
    animationType: 'full' | 'translate-only' = 'full'
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
    renderer.setStyle(
      elementRef.nativeElement,
      "transition",
      "none"
    );
    
    // Force browser to acknowledge the transition removal before setting new styles
    // This fixes issues where animations might get "stuck"
    if (typeof window !== 'undefined') {
      // Force a layout reflow
      void elementRef.nativeElement.offsetHeight;
    }
    
    if (animationType === 'translate-only') {
      // For offcanvas and similar elements - only translate, no scaling or opacity
      renderer.setStyle(
        elementRef.nativeElement,
        "transform",
        `translateY(${translateY}px)`
      );
    } else {
      // Full animation with scale and opacity effects (for image viewer)
      // Scale effect is limited to not go below 0.7
      const scale = Math.max(0.7, 1 - (limitedProgress * 0.1));
      
      // Opacity is limited to not go below 0.3
      const opacity = Math.max(0.3, 1 - (limitedProgress * 0.3));
      
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
    animationType: 'full' | 'translate-only' = 'full'
  ): void {
    if (!elementRef || !elementRef.nativeElement) {
      return;
    }
    
    // We want to smoothly animate back to the original position,
    // so we don't clear the transition here anymore

    // First set the transition to enable smooth animation back
    if (animationType === 'translate-only') {
      renderer.setStyle(
        elementRef.nativeElement,
        "transition",
        "transform 0.3s ease-out"
      );
      
      // Force a reflow to ensure the browser registers the transition
      if (typeof window !== 'undefined') {
        void elementRef.nativeElement.offsetHeight;
      }
      
      // Now apply the transform to animate smoothly back to original position
      renderer.setStyle(
        elementRef.nativeElement,
        "transform",
        "translateY(0)"
      );
    } else {
      // For image viewer - set both transitions at once
      renderer.setStyle(
        elementRef.nativeElement,
        "transition",
        "transform 0.3s ease-out, opacity 0.3s ease-out"
      );
      
      // Force a reflow to ensure the browser registers the transition
      if (typeof window !== 'undefined') {
        void elementRef.nativeElement.offsetHeight;
      }
      
      // Now apply both transform and opacity to animate back
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
    }
    
    // Add a final safety - after transition completes, make sure styles are reset
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        if (elementRef && elementRef.nativeElement) {
          if (animationType === 'translate-only') {
            renderer.setStyle(elementRef.nativeElement, "transform", "translateY(0)");
          } else {
            renderer.setStyle(elementRef.nativeElement, "transform", "translateY(0) scale(1)");
            renderer.setStyle(elementRef.nativeElement, "opacity", "1");
          }
        }
      }, 350); // Just after transition should be complete
    }
  }
}
