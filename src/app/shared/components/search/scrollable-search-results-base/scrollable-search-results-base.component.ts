import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Component, ElementRef, Inject, Input, OnChanges, OnInit, PLATFORM_ID, SimpleChanges } from "@angular/core";
import { fromEvent, Observable, Subject } from "rxjs";
import { isPlatformBrowser, isPlatformServer } from "@angular/common";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { WindowRefService } from "@shared/services/window-ref.service";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { SearchModelInterface } from "@features/search/interfaces/search-model.interface";

@Component({
  selector: "astrobin-scrollable-search-results-base",
  template: ""
})
export abstract class ScrollableSearchResultsBaseComponent<T> extends BaseComponentDirective implements OnInit, OnChanges {
  initialLoading = false;
  loading = false;
  page = 1;
  next: string | null = null;
  results: T[] = null;
  pageSize = 100;

  protected dataFetched = new Subject<T[]>();

  @Input()
  model: SearchModelInterface;

  @Input()
  loadMoreOnScroll = true;

  protected constructor(
    public readonly store$: Store<MainState>,
    public readonly windowRefService: WindowRefService,
    public readonly elementRef: ElementRef,
    @Inject(PLATFORM_ID) public readonly platformId: Record<string, unknown>
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    if (isPlatformBrowser(this.platformId)) {
      const scrollElement = this._getScrollableParent(this.elementRef.nativeElement) || this.windowRefService.nativeWindow;

      fromEvent(scrollElement, "scroll")
        .pipe(takeUntil(this.destroyed$), debounceTime(200), distinctUntilChanged())
        .subscribe(() => this._onScroll());
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.model) {
      this.loadData();
    }
  }

  loadData(): void {
    if (
      isPlatformBrowser(this.platformId) &&
      this._isNearTop() &&
      !this.initialLoading &&
      !this.loading
    ) {
      this.loading = false;
      this.initialLoading = true;

      this.fetchData().subscribe(response => {
        this.results = response.results;
        this.next = response.next;
        this.initialLoading = false;
        this.dataFetched.next(this.results);
      });
    }
  }

  loadMore(): Observable<T[]> {
    return new Observable<T[]>(observer => {
      if (this.next) {
        this.loading = true;
        this.model = { ...this.model, page: (this.model.page || 1) + 1 };

        this.fetchData().subscribe(response => {
          this.results = this.results.concat(response.results);
          this.next = response.next;
          this.loading = false;
          this.dataFetched.next(this.results);

          observer.next(response.results);
          observer.complete();
        });
      } else {
        observer.next([]);
        observer.complete();
      }
    });
  }

  abstract fetchData(): Observable<PaginatedApiResultInterface<T>>;

  private _onScroll() {
    if (
      isPlatformBrowser(this.platformId) &&
      this._isNearBottom() &&
      !this.initialLoading &&
      !this.loading
    ) {
      if (this.results !== null) {
        this.loadMore().subscribe();
      } else {
        this.loadData();
      }
    }
  }

  private _getScrollableParent(element: HTMLElement): HTMLElement | null {
    let parent = element.parentElement;

    while (parent) {
      const overflowY = window.getComputedStyle(parent).overflowY;
      if (overflowY === "auto" || overflowY === "scroll") {
        return parent;
      }
      parent = parent.parentElement;
    }

    return null;
  }

  private _isNearTop(): boolean {
    if (isPlatformServer(this.platformId)) {
      return false;
    }

    const window = this.windowRefService.nativeWindow;
    const rect = this.elementRef.nativeElement.getBoundingClientRect();

    return rect.top < window.innerHeight + 2000;
  }

  private _isNearBottom(): boolean {
    if (isPlatformServer(this.platformId)) {
      return false;
    }

    const window = this.windowRefService.nativeWindow;
    const rect = this.elementRef.nativeElement.getBoundingClientRect();

    return rect.bottom < window.innerHeight + 2000;
  }
}
