import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Component, ElementRef, Inject, Input, OnChanges, OnInit, PLATFORM_ID, SimpleChanges } from "@angular/core";
import { auditTime, fromEvent, Observable } from "rxjs";
import { isPlatformBrowser } from "@angular/common";
import { takeUntil } from "rxjs/operators";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { WindowRefService } from "@shared/services/window-ref.service";
import { SearchModelInterface } from "@features/search/interfaces/search-model.interface";
import { SearchPaginatedApiResultInterface } from "@shared/services/api/interfaces/search-paginated-api-result.interface";
import { TranslateService } from "@ngx-translate/core";
import { UtilsService } from "@shared/services/utils/utils.service";
import { SearchService } from "@features/search/services/search.service";

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
  lastResultsCount = 0;
  pageSize = SearchService.DEFAULT_PAGE_SIZE;

  @Input() model: SearchModelInterface;
  @Input() loadMoreOnScroll = true;
  @Input() showResultsCount = false;

  protected isInViewport = false;

  protected readonly SearchService = SearchService;

  protected constructor(
    public readonly store$: Store<MainState>,
    public readonly windowRefService: WindowRefService,
    public readonly elementRef: ElementRef,
    @Inject(PLATFORM_ID) public readonly platformId: Record<string, unknown>,
    public readonly translateService: TranslateService,
    public readonly utilsService: UtilsService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    if (isPlatformBrowser(this.platformId)) {
      const scrollElement = UtilsService.getScrollableParent(this.elementRef.nativeElement, this.windowRefService);

      fromEvent(scrollElement, "scroll")
        .pipe(auditTime(100), takeUntil(this.destroyed$))
        .subscribe(() => this._onScroll());
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.model && changes.model.currentValue && this.isInViewport) {
      this.loadData();
    }
  }

  onVisibilityChange(isIntersecting: boolean): void {
    if (isIntersecting && !this.isInViewport && this.model) {
      this.isInViewport = true;
      this.loadData();
    }
  }

  modelIsPristine(): boolean {
    const ignoreModelKeys = ["page", "pageSize", "searchType", "ordering"];
    const modelKeys = Object.keys(this.model).filter(key => !ignoreModelKeys.includes(key));

    return modelKeys.filter(key => !ignoreModelKeys.includes(key)).every(key => {
      const value = this.model[key];

      return (
        value === "" ||
        value === null ||
        value === undefined ||
        (
          UtilsService.isObject(value) && (
            value.value === "" ||
            value.value === null ||
            value.value === undefined ||
            (UtilsService.isArray(value.value) && value.value.length === 0)
          )
        )
      );
    });
  }

  updateLastResultsCount(count: number): void {
    if (this.modelIsPristine()) {
      this.lastResultsCount = null;
      return;
    }

    if (count === 0) {
      this.lastResultsCount = this.translateService.instant("No results");
    } else if (count === 1) {
      this.lastResultsCount = this.translateService.instant("1 result");
    } else if (count >= 10000 && count < 100000) {
      this.lastResultsCount = this.translateService.instant("{{ count }} results", { count: Math.round(count / 10000) * 10000 });
    } else if (count >= 100000 && count < 1000000) {
      this.lastResultsCount = this.translateService.instant("{{ count }} results", { count: Math.round(count / 100000) * 100000 });
    } else if (count >= 1000000 && count < 10000000) {
      this.lastResultsCount = this.translateService.instant("{{ count }} results", { count: Math.round(count / 1000000) * 1000000 });
    } else {
      this.lastResultsCount = this.translateService.instant("{{ count }} results", { count });
    }
  }

  loadData(): void {
    this.loading = false;
    this.initialLoading = true;

    this.fetchData().subscribe(response => {
      this.results = response.results;
      this.next = response.next;
      this.initialLoading = false;
      this.updateLastResultsCount(response.count);
    });
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

          observer.next(response.results);
          observer.complete();
        });
      }
    });
  }

  abstract fetchData(): Observable<SearchPaginatedApiResultInterface<T>>;

  private _onScroll() {
    if (
      this.loading ||
      this.next === null ||
      !this.utilsService.isNearBottom(this.windowRefService, this.elementRef)
    ) {
      return;
    }

    if (this.results !== null) {
      if (this.loadMoreOnScroll) {
        this.loadMore().subscribe();
      }
    } else {
      this.loadData();
    }
  }
}
