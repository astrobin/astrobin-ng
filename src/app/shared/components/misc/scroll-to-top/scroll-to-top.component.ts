import { Component, Inject, Input, OnChanges, OnDestroy, OnInit, PLATFORM_ID, SimpleChanges } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { WindowRefService } from "@shared/services/window-ref.service";
import { auditTime, fromEvent, Subscription } from "rxjs";
import { isPlatformBrowser } from "@angular/common";
import { fadeInOut } from "@shared/animations";

@Component({
  selector: "astrobin-scroll-to-top",
  template: `
    <button
      *ngIf="show"
      @fadeInOut
      (click)="scrollToTop()"
      class="btn btn-link text-secondary position-{{ position }}"
    >
      <fa-icon icon="chevron-circle-up"></fa-icon>
    </button>
  `,
  styleUrls: ["./scroll-to-top.component.scss"],
  animations: [fadeInOut]
})
export class ScrollToTopComponent extends BaseComponentDirective implements OnChanges, OnInit, OnDestroy {
  @Input() position: "left" | "right" = "right";
  @Input() element: HTMLElement;

  private _offset = 0;
  private readonly _isBrowser: boolean;
  private _scrollSubscription: Subscription;

  constructor(
    public readonly store$: Store<MainState>,
    public windowRefService: WindowRefService,
    @Inject(PLATFORM_ID) public readonly platformId: Object
  ) {
    super(store$);
    this._isBrowser = isPlatformBrowser(this.platformId); // Set _isBrowser as readonly
  }

  get show(): boolean {
    if (!this._isBrowser) {
      return false; // Return false on the server as there is no scrolling
    }

    const element = this._getElement();
    if (!element) {
      return false;
    }

    return this._offset > this._getClientHeight(element) / 2;
  }

  ngOnInit(): void {
    if (this._isBrowser) {
      // Initialize scroll listener on component initialization
      this._initializeScrollListener();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this._isBrowser && changes["element"]) {
      // Reinitialize the scroll listener when the element input changes
      this._initializeScrollListener();
    }
  }

  scrollToTop() {
    if (!this._isBrowser) {
      return; // Prevent running in SSR
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
    // Unsubscribe when the component is destroyed to avoid memory leaks
    if (this._scrollSubscription) {
      this._scrollSubscription.unsubscribe();
    }
    super.ngOnDestroy();
  }

  private _initializeScrollListener(): void {
    // Unsubscribe from any previous scroll subscription to avoid memory leaks
    if (this._scrollSubscription) {
      this._scrollSubscription.unsubscribe();
    }

    const element = this._getElement();
    if (!element) {
      return;
    }

    // Subscribe to the scroll event of the current element or window
    this._scrollSubscription = fromEvent(element, "scroll")
      .pipe(auditTime(250))
      .subscribe(() => {
        this._offset = this._getScrollTop(element);
      });
  }

  private _getElement(): HTMLElement | Window {
    if (!this._isBrowser) {
      return null; // Skip on server
    }

    // Default to the window if no element is passed
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
