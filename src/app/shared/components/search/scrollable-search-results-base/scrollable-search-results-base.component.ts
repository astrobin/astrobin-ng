import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Component, ElementRef, Inject, Input, OnChanges, OnInit, PLATFORM_ID, SimpleChanges } from "@angular/core";
import { fromEvent, Observable } from "rxjs";
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
  results: T[] = [];
  pageSize = 5;

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
      fromEvent(this.windowRefService.nativeWindow, "scroll")
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
    this.loading = false;
    this.initialLoading = true;

    this.fetchData().subscribe(response => {
      this.results = response.results;
      this.next = response.next;
      this.initialLoading = false;
    });
  }

  loadMore(): void {
    if (this.next) {
      this.loading = true;
      this.model = { ...this.model, page: (this.model.page || 1) + 1 };

      this.fetchData().subscribe(response => {
        this.results = this.results.concat(response.results);
        this.next = response.next;
        this.loading = false;
      });
    }
  }

  abstract fetchData(): Observable<PaginatedApiResultInterface<T>>;

  private _onScroll() {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    if (!this.loadMoreOnScroll) {
      return;
    }

    const window = this.windowRefService.nativeWindow;
    const rect = this.elementRef.nativeElement.getBoundingClientRect();

    if (!this.loading && rect.bottom < window.innerHeight + 2000) {
      this.loadMore();
    }
  }
}
