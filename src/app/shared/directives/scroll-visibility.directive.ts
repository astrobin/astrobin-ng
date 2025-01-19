import { Directive, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { WindowRefService } from "@shared/services/window-ref.service";
import { UtilsService, ViewportCheckOptions } from "@shared/services/utils/utils.service";
import { fromEvent, merge, Subject, Subscription } from "rxjs";
import { auditTime, takeUntil } from "rxjs/operators";

@Directive({
  selector: "[astrobinScrollVisibility]"
})
export class ScrollVisibilityDirective implements OnInit, OnDestroy {
  @Input() viewportOptions: ViewportCheckOptions = {};
  @Input() disconnectOnVisible = true;

  @Output() visibilityChange = new EventEmitter<boolean>();

  private readonly _isBrowser: boolean;
  private readonly maxAttempts = 5;
  private readonly delays = [0, 100, 300, 1000, 2000];

  private _isVisible = false;
  private _destroyed$ = new Subject<void>();
  private _checkAttempts = 0;
  private _scrollSubscription: Subscription;

  constructor(
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    private windowRefService: WindowRefService,
    private utilsService: UtilsService
  ) {
    this._isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this._isBrowser) {
      this._setupScrollListener();
      this._checkWithBackoff();
    }
  }

  ngOnDestroy() {
    this._cleanup();

    this._destroyed$.next();
    this._destroyed$.complete();
  }

  private _cleanup() {
    if (this._scrollSubscription) {
      this._scrollSubscription.unsubscribe();
      this._scrollSubscription = null;
    }
  }

  private _checkWithBackoff() {
    if (this._checkAttempts >= this.maxAttempts) {
      return;
    }

    const delay = this.delays[this._checkAttempts];
    this.utilsService.delay(delay).pipe(
      takeUntil(this._destroyed$)
    ).subscribe(() => {
      this._checkVisibility();

      // If still not visible and not reached max attempts, try again
      if (!this._isVisible) {
        this._checkAttempts++;
        this._checkWithBackoff();
      }
    });
  }

  private _setupScrollListener() {
    const scrollElement = UtilsService.getScrollableParent(
      this.elementRef.nativeElement,
      this.windowRefService
    );

    const scroll$ = fromEvent(scrollElement, "scroll");
    const resize$ = fromEvent(this.windowRefService.nativeWindow, "resize");

    this._scrollSubscription = merge(scroll$, resize$).pipe(
      auditTime(100),
      takeUntil(this._destroyed$)
    ).subscribe(() => {
      this._checkVisibility();
    });
  }

  private _checkVisibility() {
    const wasVisible = this._isVisible;
    this._isVisible = this.utilsService.isNearOrInViewport(
      this.elementRef.nativeElement,
      this.viewportOptions
    );

    if (wasVisible !== this._isVisible) {
      this.visibilityChange.emit(this._isVisible);

      if (this._isVisible && this.disconnectOnVisible) {
        this._cleanup();
      }
    }
  }
}
