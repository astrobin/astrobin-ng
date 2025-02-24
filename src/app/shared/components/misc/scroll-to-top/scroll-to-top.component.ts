import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnChanges, OnDestroy, OnInit, PLATFORM_ID, SimpleChanges } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { WindowRefService } from "@core/services/window-ref.service";
import { auditTime, fromEvent, Subscription } from "rxjs";
import { isPlatformBrowser } from "@angular/common";
import { fadeInOut } from "@shared/animations";

@Component({
  selector: "astrobin-scroll-to-top",
  template: `
    <button
      *ngIf="shouldShow"
      @fadeInOut
      (click)="scrollToTop()"
      class="btn btn-link text-secondary position-{{ position }}"
    >
      <fa-icon icon="chevron-circle-up"></fa-icon>
    </button>
  `,
  styleUrls: ["./scroll-to-top.component.scss"],
  animations: [fadeInOut],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ScrollToTopComponent extends BaseComponentDirective implements OnChanges, OnInit, OnDestroy {
  @Input() position: "left" | "right" = "right";
  @Input() element: HTMLElement;

  shouldShow = false;
  private _offset = 0;
  private readonly _isBrowser: boolean;
  private _scrollSubscription: Subscription;

  constructor(
    public readonly store$: Store<MainState>,
    public windowRefService: WindowRefService,
    private readonly cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) public readonly platformId: Object
  ) {
    super(store$);
    this._isBrowser = isPlatformBrowser(this.platformId);
  }

  private _updateShowState(): void {
    if (!this._isBrowser) {
      this.shouldShow = false;
      return;
    }

    const element = this._getElement();
    if (!element) {
      this.shouldShow = false;
      return;
    }

    const newShouldShow = this._offset > this._getClientHeight(element) / 2;

    if (this.shouldShow !== newShouldShow) {
      this.shouldShow = newShouldShow;
      this.cdr.markForCheck();
    }
  }

  ngOnInit(): void {
    if (this._isBrowser) {
      this._initializeScrollListener();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this._isBrowser && changes["element"]) {
      this._initializeScrollListener();
    }
  }

  scrollToTop(): void {
    if (!this._isBrowser) {
      return;
    }

    const element = this._getElement();
    if (!element) {
      return;
    }

    element.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth"
    });
  }

  ngOnDestroy(): void {
    if (this._scrollSubscription) {
      this._scrollSubscription.unsubscribe();
    }
    super.ngOnDestroy();
  }

  private _initializeScrollListener(): void {
    if (this._scrollSubscription) {
      this._scrollSubscription.unsubscribe();
    }

    const element = this._getElement();
    if (!element) {
      return;
    }

    this._scrollSubscription = fromEvent(element, "scroll")
      .pipe(auditTime(250))
      .subscribe(() => {
        this._offset = this._getScrollTop(element);
        this._updateShowState();
      });
  }

  private _getElement(): HTMLElement | Window {
    if (!this._isBrowser) {
      return null;
    }

    return this.element || this.windowRefService.nativeWindow;
  }

  private _getScrollTop(element: HTMLElement | Window): number {
    if (element instanceof Window) {
      return this.windowRefService.nativeWindow.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
    } else {
      return element.scrollTop;
    }
  }

  private _getClientHeight(element: HTMLElement | Window): number {
    if (element instanceof Window) {
      return document.documentElement.clientHeight || document.body.clientHeight;
    } else {
      return element.clientHeight;
    }
  }
}
