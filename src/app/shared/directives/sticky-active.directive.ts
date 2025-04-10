import { isPlatformBrowser } from "@angular/common";
import type { ElementRef, OnDestroy, OnInit, Renderer2 } from "@angular/core";
import { Directive, Inject, Input, PLATFORM_ID } from "@angular/core";
import type { WindowRefService } from "@core/services/window-ref.service";
import type { Subscription } from "rxjs";
import { auditTime, fromEvent, merge } from "rxjs";

@Directive({
  selector: "[astrobinSticky]"
})
export class StickyDirective implements OnInit, OnDestroy {
  @Input() stickyClass = "sticky-active"; // Default class to add when sticky
  @Input() throttleTime = 500; // Default throttle time

  private readonly _isBrowser: boolean;
  private _scrollSubscription: Subscription | undefined;
  private _topOffset = 0; // Store top offset value

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private windowRefService: WindowRefService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this._isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this._isBrowser) {
      const _win = this.windowRefService.nativeWindow;
      // Retrieve the top offset value from the element's computed style
      const computedStyle = _win.getComputedStyle(this.el.nativeElement);
      const topValue = computedStyle.top;

      // Parse the top value to a number, defaulting to 0 if it's not set
      this._topOffset = parseInt(topValue, 10) || 0;

      // Set up scroll listener with throttling
      this._scrollSubscription = merge(fromEvent(_win, "scroll"), fromEvent(_win, "resize"))
        .pipe(auditTime(this.throttleTime))
        .subscribe(() => {
          this._checkStickyPosition();
        });
    }
  }

  ngOnDestroy() {
    if (this._scrollSubscription) {
      this._scrollSubscription.unsubscribe();
    }
  }

  private _checkStickyPosition() {
    const rect = this.el.nativeElement.getBoundingClientRect();

    if (rect.top <= this._topOffset) {
      // Element is in sticky phase
      this.renderer.addClass(this.el.nativeElement, this.stickyClass);
    } else {
      // Element is not sticky anymore
      this.renderer.removeClass(this.el.nativeElement, this.stickyClass);
    }
  }
}
