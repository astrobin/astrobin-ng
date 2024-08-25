import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Component, ElementRef, Inject, Input, OnChanges, OnInit, PLATFORM_ID, SimpleChanges } from "@angular/core";
import { fromEvent, Observable, Subject, throttleTime } from "rxjs";
import { isPlatformBrowser, isPlatformServer } from "@angular/common";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { WindowRefService } from "@shared/services/window-ref.service";
import { SearchModelInterface } from "@features/search/interfaces/search-model.interface";
import { SearchPaginatedApiResultInterface } from "@shared/services/api/interfaces/search-paginated-api-result.interface";

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

  @Input() model: SearchModelInterface;
  @Input() loadMoreOnScroll = true;

  protected dataFetched = new Subject<{ data: T[], cumulative: boolean }>();
  protected scheduledLoadingTimeout: number = null;

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
        .pipe(takeUntil(this.destroyed$), throttleTime(200))
        .subscribe(() => this._onScroll());
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.model && changes.model.currentValue) {
      if (clearInterval === undefined || setTimeout === undefined) {
        // Server side.
        this.loadData();
      } else {
        this.cancelScheduledLoading();
        this.scheduleLoading();
      }
    }
  }

  cancelScheduledLoading() {
    if (this.scheduledLoadingTimeout) {
      clearTimeout(this.scheduledLoadingTimeout);
      this.scheduledLoadingTimeout = null;
    }
  }

  scheduleLoading() {
    this.scheduledLoadingTimeout = setTimeout(() => {
      this.loadData();
    }, 50);
  }

  loadData(): void {
    if (
      isPlatformBrowser(this.platformId) &&
      this._isNearTop()
    ) {
      this.loading = false;
      this.initialLoading = true;

      this.fetchData().subscribe(response => {
        this.results = response.results;
        this.next = response.next;
        this.initialLoading = false;
        this.cancelScheduledLoading();
        this.dataFetched.next({ data: this.results, cumulative: false });
      });
    }
  }

  loadMore(): Observable<T[]> {
    return new Observable<T[]>(observer => {
      if (this.next && !this.loading) {
        this.loading = true;
        this.model = { ...this.model, page: (this.model.page || 1) + 1 };

        this.fetchData().subscribe(response => {
          this.results = this.results.concat(response.results);
          this.next = response.next;
          this.loading = false;
          this.cancelScheduledLoading();
          this.dataFetched.next({ data: this.results, cumulative: true });

          observer.next(response.results);
          observer.complete();
        });
      } else {
        observer.next([]);
        observer.complete();
      }
    });
  }

  abstract fetchData(): Observable<SearchPaginatedApiResultInterface<T>>;

  private _onScroll() {
    if (
      isPlatformBrowser(this.platformId) &&
      this._isNearBottom() &&
      !this.initialLoading &&
      !this.loading
    ) {
      if (this.results !== null) {
        if (this.loadMoreOnScroll) {
          this.loadMore().subscribe();
        }
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
