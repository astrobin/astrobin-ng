import { Inject, Injectable, OnDestroy, PLATFORM_ID } from "@angular/core";
import { auditTime, BehaviorSubject, fromEvent, Observable, Subject } from "rxjs";
import { distinctUntilChanged, takeUntil } from "rxjs/operators";
import { isPlatformBrowser } from "@angular/common";

/**
 * Service for handling show/hide behavior based on scroll direction.
 * Can be used for headers, footers, and other elements that should
 * hide when scrolling down and reappear when scrolling up.
 */
@Injectable({
  providedIn: "root"
})
export class ScrollHideService implements OnDestroy {
  private lastScrollPosition = 0;
  private scrollThreshold = 100; // Minimum scroll distance before triggering hide/show
  private scrollSubscription: any;
  private touchStartSubscription: any;
  private touchEndSubscription: any;
  private scrollInactivityTimeout: any;
  private bounceBackTimeout: any;
  private scrollInactivityDuration = 3000; // Time in ms after which to show UI if no scroll activity
  private isElasticScrollDetected = false;
  private destroyed$ = new Subject<void>();
  private readonly isBrowser: boolean;

  // Separate subjects for header and footer visibility
  private headerHidden$ = new BehaviorSubject<boolean>(false);
  private footerHidden$ = new BehaviorSubject<boolean>(false);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.initScrollListener();
    }
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();

    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }

    if (this.touchStartSubscription) {
      this.touchStartSubscription.unsubscribe();
    }

    if (this.touchEndSubscription) {
      this.touchEndSubscription.unsubscribe();
    }

    if (this.scrollInactivityTimeout) {
      clearTimeout(this.scrollInactivityTimeout);
    }

    if (this.bounceBackTimeout) {
      clearTimeout(this.bounceBackTimeout);
    }
  }

  /**
   * Get an observable that emits when the header visibility changes
   */
  getHeaderVisibility(): Observable<boolean> {
    return this.headerHidden$.asObservable();
  }

  /**
   * Get an observable that emits when the footer visibility changes
   */
  getFooterVisibility(): Observable<boolean> {
    return this.footerHidden$.asObservable();
  }

  /**
   * Set the scroll threshold (minimum distance scrolled to trigger the visibility change)
   */
  setScrollThreshold(threshold: number): void {
    this.scrollThreshold = threshold;
  }

  /**
   * Set the timeout duration after which UI elements will be shown when
   * there's no scrolling activity
   */
  setInactivityDuration(duration: number): void {
    this.scrollInactivityDuration = duration;
  }

  /**
   * Initialize the scroll event listener and touch events for elastic scroll detection
   */
  private initScrollListener(): void {
    // Extra safety check, though we should only call this if isBrowser is true
    if (this.isBrowser) {
      // Main scroll handler
      this.scrollSubscription = fromEvent(window, "scroll")
        .pipe(
          auditTime(200), // Limit scroll event frequency
          distinctUntilChanged(),
          takeUntil(this.destroyed$)
        )
        .subscribe(() => this.handleScroll());

      // Touch events to detect elastic scrolling on touch devices
      this.touchStartSubscription = fromEvent(document, "touchstart")
        .pipe(takeUntil(this.destroyed$))
        .subscribe(() => {
          // On touch start, note that we're in a potential elastic scroll situation
          this.isElasticScrollDetected = false;

          // Clear any bounce back timeout that might be ongoing
          if (this.bounceBackTimeout) {
            clearTimeout(this.bounceBackTimeout);
            this.bounceBackTimeout = null;
          }
        });

      this.touchEndSubscription = fromEvent(document, "touchend")
        .pipe(takeUntil(this.destroyed$))
        .subscribe(() => {
          // When touch ends, schedule a check to see if elements should be shown
          // after any elastic bounce completes (typically ~300ms)
          this.bounceBackTimeout = setTimeout(() => {
            // If we detected elastic scrolling, force show the UI
            if (this.isElasticScrollDetected) {
              this.headerHidden$.next(false);
              this.footerHidden$.next(false);
              this.isElasticScrollDetected = false;
            }

            // Also check if we're at the top or bottom of the page
            const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
            const maxScrollPosition = document.documentElement.scrollHeight - window.innerHeight;

            if (currentScrollPosition <= 10 ||
              currentScrollPosition >= maxScrollPosition - 10) {
              this.headerHidden$.next(false);
              this.footerHidden$.next(false);
            }
          }, 300);
        });
    }
  }

  /**
   * Handle scroll events and update visibility states
   */
  private handleScroll(): void {
    if (!this.isBrowser) {
      return;
    }

    const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    const maxScrollPosition = document.documentElement.scrollHeight - window.innerHeight;

    // Force show elements in these special cases:
    // 1. At or beyond top of page (including elastic bounce)
    // 2. At or beyond bottom of page (including elastic bounce)
    // 3. Only a small amount of content (not enough to scroll)
    if (currentScrollPosition <= 10 ||
      currentScrollPosition >= maxScrollPosition - 10 ||
      maxScrollPosition <= this.scrollThreshold) {
      this.headerHidden$.next(false);
      this.footerHidden$.next(false);
      this.lastScrollPosition = currentScrollPosition;
      return;
    }

    // Detect elastic scrolling - this catches both top and bottom bounces
    // Safari and some mobile browsers can have out-of-bounds scroll positions during elastic scrolling
    if (currentScrollPosition < 0 || currentScrollPosition > maxScrollPosition + 10) {
      // Mark that we detected elastic scrolling - this will be used on touchend
      this.isElasticScrollDetected = true;
      this.headerHidden$.next(false);
      this.footerHidden$.next(false);
      // Don't update lastScrollPosition here to avoid jumps when returning to normal scroll area
      return;
    }

    // Normal scrolling behavior

    // Calculate the scroll distance and direction
    const scrollDistance = Math.abs(currentScrollPosition - this.lastScrollPosition);
    const isScrollingDown = currentScrollPosition > this.lastScrollPosition;

    // Only trigger changes when scroll distance exceeds threshold
    if (scrollDistance > this.scrollThreshold) {
      if (isScrollingDown) {
        // Scrolling down - hide both header and footer
        this.headerHidden$.next(true);
        this.footerHidden$.next(true);
      } else {
        // Scrolling up - show both header and footer
        this.headerHidden$.next(false);
        this.footerHidden$.next(false);
      }

      // Reset and start inactivity timeout
      this.resetInactivityTimeout();
    }

    this.lastScrollPosition = currentScrollPosition;
  }

  /**
   * Reset and start the inactivity timeout.
   * After the specified duration of no scroll events, UI elements will be shown again.
   */
  private resetInactivityTimeout(): void {
    if (!this.isBrowser) {
      return;
    }

    // Clear any existing timeout
    if (this.scrollInactivityTimeout) {
      clearTimeout(this.scrollInactivityTimeout);
    }

    // Set a new timeout to show UI after inactivity
    this.scrollInactivityTimeout = setTimeout(() => {
      if (this.headerHidden$.getValue() || this.footerHidden$.getValue()) {
        this.headerHidden$.next(false);
        this.footerHidden$.next(false);
      }
    }, this.scrollInactivityDuration);
  }
}
