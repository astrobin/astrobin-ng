import {
  AfterViewChecked,
  AfterViewInit,
  ElementRef,
  OnChanges,
  OnDestroy,
  Renderer2,
  SimpleChanges,
  Directive,
  EventEmitter,
  Input,
  Output
} from "@angular/core";
import { WindowRefService } from "@core/services/window-ref.service";
import { Subscription, fromEvent } from "rxjs";
import { throttleTime } from "rxjs/operators";

@Directive({
  selector: "[astrobinScrollToggle]"
})
export class ScrollToggleDirective implements AfterViewInit, AfterViewChecked, OnDestroy, OnChanges {
  @Input() enabled = true; // Whether the directive is enabled
  @Input() topElement!: HTMLElement; // Optional: Top element to show/hide
  @Input() bottomElement!: HTMLElement; // Optional: Bottom element to show/hide
  @Input() throttle = 30; // Throttle time (default is 30ms)
  @Input() hideThreshold = 10; // Scroll distance threshold (default is 10px)
  @Input() globalScroll = false; // Whether to listen on window (global) scroll

  @Output() showTopElement = new EventEmitter<void>();
  @Output() hideTopElement = new EventEmitter<void>();
  @Output() showBottomElement = new EventEmitter<void>();
  @Output() hideBottomElement = new EventEmitter<void>();

  private lastScrollTop = 0;
  private scrollSubscription!: Subscription;
  private topElementVisible = true;
  private bottomElementVisible = true;
  private initialized = false; // To prevent repetitive checks

  constructor(
    private readonly el: ElementRef,
    private readonly renderer: Renderer2,
    private readonly windowRefService: WindowRefService
  ) {}

  ngAfterViewInit(): void {
    this._init();
  }

  ngAfterViewChecked(): void {
    if (!this.enabled || this.initialized || !this.bottomElement || !this.topElement) {
      return;
    }

    // Check if the scrollable space is taller than the viewport
    const contentHeight =
      this.el.nativeElement.scrollHeight || this.windowRefService.nativeWindow.document.body.scrollHeight;
    const viewportHeight = this.windowRefService.nativeWindow.innerHeight || this.el.nativeElement.clientHeight;

    // If content is taller than the viewport, start by hiding the bottom element
    if (contentHeight > viewportHeight) {
      this.renderer.setStyle(this.bottomElement, "transform", `translateY(100%)`);
      this.bottomElementVisible = false; // Set the initial state to hidden
      this.hideBottomElement.emit();
    }

    // Enable smooth transitions for further show/hide events
    this.renderer.setStyle(this.bottomElement, "transition", "transform 0.3s ease");

    // Mark the initialization as complete to avoid repetitive checks
    this.initialized = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.enabled && !changes.enabled.firstChange) {
      if (this.enabled) {
        this._init();
      } else {
        this._reset();
      }
    }
  }

  ngOnDestroy(): void {
    // Clean up the subscription when the directive is destroyed
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
  }

  private _init() {
    if (!this.enabled) {
      return; // Exit if the directive is disabled
    }

    // Determine the scroll source (element or window)
    const scrollTarget = this.globalScroll ? this.windowRefService.nativeWindow : this.el.nativeElement;

    // Listen for scroll events on the scrollable element or globally
    this.scrollSubscription = fromEvent(scrollTarget, "scroll")
      .pipe(throttleTime(this.throttle))
      .subscribe(() => {
        const currentScrollTop = this.globalScroll ? window.scrollY : this.el.nativeElement.scrollTop;

        // Handle the top element (e.g., search bar with offset)
        if (this.topElement) {
          this._handleTopElementScroll(currentScrollTop);
        }

        // Handle the bottom element (e.g., footer)
        if (this.bottomElement) {
          this._handleBottomElementScroll(currentScrollTop);
        }

        this.lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop; // Avoid negative scroll values
      });
  }

  private _reset() {
    if (this.topElement) {
      this.renderer.setStyle(this.topElement, "transform", "translateY(0)");
    }

    if (this.bottomElement) {
      this.renderer.setStyle(this.bottomElement, "transform", "translateY(0)");
    }

    this.topElementVisible = true;
    this.bottomElementVisible = true;
    this.initialized = false;
  }

  private _handleBottomElementScroll(currentScrollTop: number): void {
    const bottomElementHeight = this.bottomElement.offsetHeight;
    const scrollHeight = this._getScrollHeight();
    const clientHeight = this._getClientHeight();
    const scrollPosition = currentScrollTop + clientHeight;

    // Force show the bottom element if we're near the bottom of the scrollable content
    const nearBottomThreshold = 100;
    if (scrollPosition >= scrollHeight - nearBottomThreshold) {
      this._showBottomElement();
      return; // Exit to avoid hiding it again in the same cycle
    }

    // Normal scroll handling: show or hide based on scroll direction
    if (currentScrollTop > this.lastScrollTop) {
      this._showBottomElement();
    } else if (currentScrollTop < this.lastScrollTop - this.hideThreshold) {
      this._hideBottomElement(bottomElementHeight);
    }
  }

  private _getScrollHeight(): number {
    return this.globalScroll
      ? this.windowRefService.nativeWindow.document.documentElement.scrollHeight
      : this.el.nativeElement.scrollHeight;
  }

  private _getClientHeight(): number {
    return this.globalScroll ? this.windowRefService.nativeWindow.innerHeight : this.el.nativeElement.clientHeight;
  }

  private _showBottomElement(): void {
    if (!this.bottomElementVisible) {
      this.renderer.setStyle(this.bottomElement, "transform", "translateY(0)");
      this.bottomElementVisible = true;
      this.showBottomElement.emit();
    }
  }

  private _hideBottomElement(bottomElementHeight: number): void {
    if (this.bottomElementVisible) {
      this.renderer.setStyle(this.bottomElement, `transform`, `translateY(${bottomElementHeight}px)`);
      this.bottomElementVisible = false;
      this.hideBottomElement.emit();
    }
  }

  private _handleTopElementScroll(currentScrollTop: number): void {
    const topElementHeight = this.topElement.offsetHeight;
    const topElementOffsetTop = parseInt(window.getComputedStyle(this.topElement).top || "0", 10); // Get the CSS 'top' value
    const totalOffset = topElementHeight + topElementOffsetTop; // Calculate the total amount to move the element out of view

    if (currentScrollTop > this.lastScrollTop) {
      // Scrolling down, hide the top element (move it up by its total offset)
      this._hideTopElement(totalOffset);
    } else if (currentScrollTop < this.lastScrollTop - this.hideThreshold) {
      // Scrolling up, show the top element (reset transform)
      this._showTopElement();
    }
  }

  private _showTopElement(): void {
    if (!this.topElementVisible) {
      this.renderer.setStyle(this.topElement, "transform", "translateY(0)");
      this.topElementVisible = true;
      this.showTopElement.emit();
    }
  }

  private _hideTopElement(totalOffset: number): void {
    if (this.topElementVisible) {
      this.renderer.setStyle(this.topElement, `transform`, `translateY(-${totalOffset}px)`);
      this.topElementVisible = false;
      this.hideTopElement.emit();
    }
  }
}
