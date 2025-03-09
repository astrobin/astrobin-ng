import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, fromEvent } from 'rxjs';
import { takeUntil, throttleTime, distinctUntilChanged } from 'rxjs/operators';

/**
 * Service for handling show/hide behavior based on scroll direction.
 * Can be used for headers, footers, and other elements that should
 * hide when scrolling down and reappear when scrolling up.
 */
@Injectable({
  providedIn: 'root'
})
export class ScrollHideService implements OnDestroy {
  private lastScrollPosition = 0;
  private scrollThreshold = 50; // Minimum scroll distance before triggering hide/show
  private scrollSubscription: any;
  private destroyed$ = new Subject<void>();
  
  // Separate subjects for header and footer visibility
  private headerHidden$ = new BehaviorSubject<boolean>(false);
  private footerHidden$ = new BehaviorSubject<boolean>(false);
  
  constructor() {
    this.initScrollListener();
  }
  
  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
    
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
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
   * Initialize the scroll event listener
   */
  private initScrollListener(): void {
    if (typeof window !== 'undefined') {
      this.scrollSubscription = fromEvent(window, 'scroll')
        .pipe(
          throttleTime(100), // Limit scroll event frequency
          distinctUntilChanged(),
          takeUntil(this.destroyed$)
        )
        .subscribe(() => this.handleScroll());
    }
  }
  
  /**
   * Handle scroll events and update visibility states
   */
  private handleScroll(): void {
    const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    
    // Handle elastic scroll scenarios - prevent negative scroll positions
    if (currentScrollPosition < 0) {
      this.headerHidden$.next(false);
      this.footerHidden$.next(false);
      this.lastScrollPosition = 0;
      return;
    }
    
    // Only hide elements when scrolled past threshold
    if (currentScrollPosition <= 10) {
      // At the top of the page - always show both header and footer
      this.headerHidden$.next(false);
      this.footerHidden$.next(false);
    } else {
      // Scrolling down - hide both header and footer
      if (currentScrollPosition > this.lastScrollPosition && 
          currentScrollPosition - this.lastScrollPosition > this.scrollThreshold) {
        this.headerHidden$.next(true);
        this.footerHidden$.next(true);
      } 
      // Scrolling up - show both header and footer
      else if (currentScrollPosition < this.lastScrollPosition && 
               this.lastScrollPosition - currentScrollPosition > this.scrollThreshold) {
        this.headerHidden$.next(false);
        this.footerHidden$.next(false);
      }
    }
    
    this.lastScrollPosition = currentScrollPosition;
  }
}