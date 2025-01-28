import { ElementRef, Inject, Injectable, OnDestroy, PLATFORM_ID } from "@angular/core";
import { WindowRefService } from "@core/services/window-ref.service";
import { fromEvent, Subject, Subscription } from "rxjs";
import { auditTime, takeUntil } from "rxjs/operators";
import { isPlatformBrowser } from "@angular/common";
import { UtilsService } from "@core/services/utils/utils.service";

interface RegisteredComponent {
  element: HTMLElement;
  onInit: () => void;
  scrollParentId: string;
}

interface ScrollParent {
  element: HTMLElement | Window;
  subscription: Subscription;
  componentCount: number;
}

@Injectable({
  providedIn: "root"
})
export class ViewportInitService implements OnDestroy {
  private _components = new Map<string, RegisteredComponent>();
  private _destroyed$ = new Subject<void>();
  private _checkingViewport = false;
  private _scrollParents = new Map<string, ScrollParent>();
  private _nextScrollParentId = 1;

  constructor(
    private windowRefService: WindowRefService,
    private utilsService: UtilsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
  }

  register(id: string, elementRef: ElementRef, onInit: () => void): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // If already registered, clean up first
    if (this._components.has(id)) {
      this.unregister(id);
    }

    const element = elementRef.nativeElement;
    const scrollParentElement = UtilsService.getScrollableParent(element, this.windowRefService);
    const scrollParentId = this._getOrCreateScrollParentId(scrollParentElement);

    this._components.set(id, { element, onInit, scrollParentId });

    // Initialize scroll listener for this parent if needed
    this._initScrollListenerForParent(scrollParentId, scrollParentElement);

    // Use IntersectionObserver for initial check
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        observer.disconnect();
        this._initializeComponent(id);
      }
    }, {
      root: scrollParentElement instanceof Window ? null : scrollParentElement as HTMLElement,
      rootMargin: "500px" // Match verticalTolerance
    });

    observer.observe(element);
  }

  unregister(id: string): void {
    const component = this._components.get(id);
    if (component) {
      const { scrollParentId } = component;
      this._components.delete(id);

      // Clean up scroll listener if no more components use this parent
      const scrollParent = this._scrollParents.get(scrollParentId);
      if (scrollParent) {
        scrollParent.componentCount--;
        if (scrollParent.componentCount === 0) {
          scrollParent.subscription.unsubscribe();
          this._scrollParents.delete(scrollParentId);
        }
      }
    }
  }

  ngOnDestroy(): void {
    // Clean up all subscriptions
    for (const parent of this._scrollParents.values()) {
      parent.subscription.unsubscribe();
    }
    this._scrollParents.clear();
    this._components.clear();
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  private _getOrCreateScrollParentId(element: HTMLElement | Window): string {
    // For window, always use a fixed ID
    if (element === this.windowRefService.nativeWindow) {
      return "window";
    }

    // Check if we already have this element
    for (const [id, parent] of this._scrollParents.entries()) {
      if (parent.element === element) {
        return id;
      }
    }

    // Create new ID
    return `scroll-parent-${this._nextScrollParentId++}`;
  }

  private _initScrollListenerForParent(scrollParentId: string, element: HTMLElement | Window): void {
    if (this._scrollParents.has(scrollParentId)) {
      // Increment counter if we already have a subscription
      this._scrollParents.get(scrollParentId).componentCount++;
      return;
    }

    const subscription = fromEvent(element, "scroll")
      .pipe(
        auditTime(250),
        takeUntil(this._destroyed$)
      )
      .subscribe(() => {
        if (!this._checkingViewport) {
          this._checkingViewport = true;
          requestAnimationFrame(() => this._checkViewportForParent(scrollParentId));
        }
      });

    this._scrollParents.set(scrollParentId, {
      element,
      subscription,
      componentCount: 1
    });
  }

  private _checkViewportForParent(scrollParentId: string): void {
    // Only check components that belong to this scroll parent
    for (const [id, component] of this._components.entries()) {
      if (component.scrollParentId === scrollParentId &&
        this.utilsService.isNearOrInViewport(component.element, { verticalTolerance: 500 })) {
        this._initializeComponent(id);
      }
    }
    this._checkingViewport = false;
  }

  private _initializeComponent(id: string): void {
    const component = this._components.get(id);
    if (component) {
      component.onInit();
      this.unregister(id);
    }
  }
}
