import { isPlatformBrowser } from "@angular/common";
import { ChangeDetectionStrategy, Component, HostListener, Inject, PLATFORM_ID } from "@angular/core";
import type { ChangeDetectorRef, OnInit } from "@angular/core";
import type { ActivatedRoute, Router } from "@angular/router";
import { NavigationEnd } from "@angular/router";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import type { MainState } from "@app/store/state";
import type { UserSearchInterface } from "@core/interfaces/user-search.interface";
import type { UserSearchApiService } from "@core/services/api/classic/users/user-search-api.service";
import type { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import type { LoadingService } from "@core/services/loading.service";
import { RouterService } from "@core/services/router.service";
import type { SearchService } from "@core/services/search.service";
import type { TitleService } from "@core/services/title/title.service";
import type { UserService } from "@core/services/user.service";
import type { UtilsService } from "@core/services/utils/utils.service";
import { MatchType } from "@features/search/enums/match-type.enum";
import { SearchType } from "@features/search/interfaces/search-model.interface";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import type { NgbNavChangeEvent } from "@ng-bootstrap/ng-bootstrap";
import type { Store } from "@ngrx/store";
import type { TranslateService } from "@ngx-translate/core";
import { fadeInOut } from "@shared/animations";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Constants } from "@shared/constants";
import { debounceTime, distinctUntilChanged, filter, finalize, map, skip, take, takeUntil } from "rxjs/operators";

enum StatType {
  IMAGE_DATA = "image-data",
  CONTRIBUTION_DATA = "contribution-data"
}

@Component({
  selector: "astrobin-astrophotographers-list-page",
  templateUrl: "./astrophotographers-list-page.component.html",
  styleUrls: ["./astrophotographers-list-page.component.scss"],
  animations: [fadeInOut],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AstrophotographersListPageComponent extends BaseComponentDirective implements OnInit {
  readonly title = this.translateService.instant("Astrophotographers List");
  readonly StatType = StatType;

  activeTab: StatType = StatType.IMAGE_DATA;
  sortColumn = "normalizedLikes"; // Default sort by image index
  sortDirection: "asc" | "desc" = "desc"; // Default to descending order
  pageSize = 100;

  // State for infinite scrolling
  loading = false;
  initialLoading = true;
  results: UserSearchInterface[] = [];
  page = 1;
  hasMore = true;

  // Search functionality
  searchQuery = "";

  // User loading state
  loadingUsernames: string[] = [];

  // SSR detection
  protected readonly isBrowser: boolean;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly route: ActivatedRoute,
    public readonly router: Router,
    public readonly translateService: TranslateService,
    public readonly loadingService: LoadingService,
    public readonly searchService: SearchService,
    public readonly userSearchApiService: UserSearchApiService,
    public readonly titleService: TitleService,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object,
    public readonly utilsService: UtilsService
  ) {
    super(store$);
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.router.events
      .pipe(
        filter(
          event => event instanceof NavigationEnd && router.url.startsWith("/" + RouterService.getCurrentPath(route))
        ),
        takeUntil(this.destroyed$)
      )
      .subscribe(() => {
        this._initTitleAndBreadcrumb();
        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnInit() {
    super.ngOnInit();
    this._initTab();

    // Check if there are URL parameters to initialize sorting and search
    const queryParams = this.route.snapshot.queryParams;

    // Initialize sort parameters
    if (queryParams["sort"]) {
      this.sortColumn = queryParams["sort"];
      this.sortDirection = (queryParams["direction"] || "asc") as "asc" | "desc";
    } else {
      // No sort parameters in URL, set default based on active tab
      const fragment = this.route.snapshot.fragment;
      if (fragment === StatType.CONTRIBUTION_DATA) {
        this.sortColumn = "contributionIndex";
      } else {
        // Default for IMAGE_DATA or no fragment
        this.sortColumn = "normalizedLikes";
      }
      this.sortDirection = "desc"; // Default to descending order for indices
    }

    // Initialize search query if present
    if (queryParams["q"]) {
      this.searchQuery = queryParams["q"];
    }

    // Observe future query param changes
    this.route.queryParams
      .pipe(
        takeUntil(this.destroyed$),
        // Skip the first emission since we handle it above
        // to avoid double-loading on initialization
        skip(1),
        map(params => {
          // When sort param is not present, use the default based on active tab
          let defaultSort: string;
          const defaultDirection = "desc";

          if (this.activeTab === StatType.CONTRIBUTION_DATA) {
            defaultSort = "contributionIndex";
          } else {
            defaultSort = "normalizedLikes";
          }

          return {
            sort: params["sort"] || defaultSort,
            direction: params["direction"] || defaultDirection,
            q: params["q"] || ""
          };
        }),
        // Only trigger when sort parameters or search query actually change
        distinctUntilChanged(
          (prev, curr) => prev.sort === curr.sort && prev.direction === curr.direction && prev.q === curr.q
        ),
        // Add debounce to handle rapid changes
        debounceTime(10)
      )
      .subscribe(({ sort, direction, q }) => {
        let shouldReset = false;

        // Check if sort options changed
        if (this.sortColumn !== sort || this.sortDirection !== direction) {
          this.sortColumn = sort;
          this.sortDirection = direction as "asc" | "desc";
          shouldReset = true;
        }

        // Always handle search param changes
        // We need to use the original query params to check if "q" exists
        const rawParams = this.route.snapshot.queryParams;

        // Update local query and reset if a search param exists or changed
        const hasSearchParam = rawParams.hasOwnProperty("q");
        const searchChanged = this.searchQuery !== q;

        if (hasSearchParam || searchChanged) {
          // Update the local value to match URL param
          this.searchQuery = q;
          shouldReset = true;

          // Force immediate visual feedback for search changes
          this.results = [];
          this.loading = true;
          this.initialLoading = true;
          this.changeDetectorRef.markForCheck();
        }

        // Reset the list when parameters change from navigation
        if (shouldReset) {
          this.resetList();
          this.changeDetectorRef.markForCheck();
        }
      });

    // Initial data load
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.initialLoading = this.page === 1;
    this.changeDetectorRef.markForCheck();

    const ordering = this.sortDirection === "desc" ? `-${this.sortColumn}` : this.sortColumn;

    // Create the search options object with base properties
    const searchOptions: any = {
      page: this.page,
      pageSize: this.pageSize,
      ordering: ordering, // The API expects this format with minus for desc
      searchType: SearchType.USERS, // Ensure we're using the right search type
      activeTab: this.activeTab
    };

    // Add text search if there's a search query
    if (this.searchQuery) {
      searchOptions.text = {
        value: this.searchQuery,
        matchType: MatchType.ANY
      };
    }

    this.userSearchApiService
      .search(searchOptions)
      .pipe(
        take(1),
        // Force Angular to run change detection in the next cycle
        // to ensure loading states update properly
        finalize(() => {
          this.utilsService.delay(0).subscribe(() => {
            this.changeDetectorRef.markForCheck();
          });
        })
      )
      .subscribe({
        next: (result: PaginatedApiResultInterface<UserSearchInterface>) => {
          if (this.page === 1) {
            this.results = result.results;
          } else {
            this.results = [...this.results, ...result.results];
          }

          this.hasMore = result.results.length === this.pageSize;
          this.loading = false;
          this.initialLoading = false;

          // Force change detection to update the view
          this.changeDetectorRef.detectChanges();
        },
        error: err => {
          console.error("Error loading search results:", err);
          this.loading = false;
          this.initialLoading = false;
          // Force change detection to update the view
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  resetList(): void {
    this.page = 1;
    this.results = [];
    this.hasMore = true;
    this.loadData();
  }

  loadMoreIfNeeded(): void {
    if (!this.loading && this.hasMore) {
      this.page++;
      this.loadData();
    }
  }

  // Explicit method for Load more button
  loadMore(): void {
    this.loadMoreIfNeeded();
  }

  onTabChange(event: NgbNavChangeEvent): void {
    if (this.activeTab === event.nextId) {
      return;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      fragment: event.nextId.toString(),
      queryParamsHandling: "preserve" // Preserve existing query params when changing tabs
    });

    this.activeTab = event.nextId as StatType;

    // Update the sort column based on the active tab if no explicit sort is set
    // Only change if URL doesn't already have a sort parameter set
    if (!this.route.snapshot.queryParams["sort"]) {
      if (this.activeTab === StatType.IMAGE_DATA) {
        this.sortColumn = "normalizedLikes";
      } else if (this.activeTab === StatType.CONTRIBUTION_DATA) {
        this.sortColumn = "contributionIndex";
      }
      this.sortDirection = "desc"; // Always default to descending for indices
    }

    this.resetList();
    this.changeDetectorRef.markForCheck();
  }

  onSort(column: string): void {
    // All sortable columns are now numeric, so we'll default to descending (highest first)
    let direction: "asc" | "desc";

    if (this.sortColumn === column) {
      // If clicking the same column again, toggle direction
      direction = this.sortDirection === "asc" ? "desc" : "asc";
    } else {
      // First click on a column - all numeric columns default to descending (highest first)
      direction = "desc";
    }

    // Check if we're sorting by the default column for the current tab
    const isDefaultSort =
      (this.activeTab === StatType.IMAGE_DATA && column === "normalizedLikes" && direction === "desc") ||
      (this.activeTab === StatType.CONTRIBUTION_DATA && column === "contributionIndex" && direction === "desc");

    // If it's the default sort, remove the sort parameters from the URL
    // This allows the defaults to take over when tabs are switched
    const queryParams = isDefaultSort
      ? { sort: null, direction: null } // Remove sort params for default sort
      : { sort: column, direction }; // Set explicit sort params otherwise

    // Even if this is the default sort, we still need to set the sort values locally
    // to ensure correct sorting when query params are removed
    this.sortColumn = column;
    this.sortDirection = direction;

    // Force reload of data immediately with the new sort order
    this.resetList();

    // Update the URL - the parameters will be reflected in the URL but won't trigger another reload
    // since we're already loading the data
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: "merge", // Merge with other query params
      preserveFragment: true, // Keep the active tab fragment
      replaceUrl: true // Replace current URL instead of creating a new history entry
    });
  }

  getSortIcon(column: string): IconProp {
    if (this.sortColumn !== column) {
      return "sort";
    }

    return this.sortDirection === "asc" ? "sort-up" : "sort-down";
  }

  // Add a scroll listener to detect when we're near the bottom of the page (browser-only)
  @HostListener("window:scroll", ["$event"])
  onScroll(): void {
    // Since the hostlistener will only be attached in the browser,
    // this is just a safeguard
    if (!this.isBrowser) {
      return;
    }

    // Don't try to load more if we're already loading or there's no more data
    if (this.loading || !this.hasMore) {
      return;
    }

    // Calculate how far the user has scrolled down the page
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const clientHeight = document.documentElement.clientHeight;

    // If we're within 3000px of the bottom, load more content
    if (scrollTop + clientHeight >= scrollHeight - 3000) {
      this.loadMoreIfNeeded();
    }
  }

  // Search-related methods
  onSearch(): void {
    // Clear existing results immediately
    this.results = [];
    this.page = 1;
    this.hasMore = true;
    this.initialLoading = true;
    this.loading = true;
    this.changeDetectorRef.markForCheck();

    // Update URL and trigger a reload
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.searchQuery || null // Use null to remove param when empty
      },
      queryParamsHandling: "merge", // Preserve other query params
      preserveFragment: true // Keep the active tab
    });
  }

  onClearSearch(): void {
    // Clear the search query
    this.searchQuery = "";

    // Clear existing results immediately
    this.results = [];
    this.page = 1;
    this.hasMore = true;
    this.initialLoading = true;
    this.loading = true;
    this.changeDetectorRef.markForCheck();

    // Update URL to remove the search parameter
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: null // Explicitly set to null to remove from URL
      },
      queryParamsHandling: "merge", // Preserve other query params
      preserveFragment: true // Keep the active tab
    });

    // Force a direct load without waiting for the URL change
    this.resetList();
  }

  // Since we need to use the href attribute in the template, we can't use Observables directly
  // For simplicity, we'll use a default value of true for enableNewGalleryExperience
  // The click handler will use the correct value from the store
  getUserGalleryUrl(username: string): string {
    return this.userService.getGalleryUrl(username, true);
  }

  onUserClick(event: Event, username: string): void {
    event.preventDefault();

    // Add username to loading state
    this.loadingUsernames.push(username);
    this.changeDetectorRef.markForCheck();

    // Get the current user's profile to determine gallery experience preference
    this.currentUserProfile$.pipe(take(1)).subscribe(profile => {
      const enableNewGalleryExperience = !profile || profile.enableNewGalleryExperience;

      // Navigate to the user's gallery
      this.userService.openGallery(username, enableNewGalleryExperience);
    });
  }

  getAvatarUrl(originalUrl: string): string {
    if (originalUrl && originalUrl.includes("default-avatar")) {
      return Constants.DEFAULT_AVATAR;
    }
    return originalUrl;
  }

  private _initTitleAndBreadcrumb() {
    this.titleService.setTitle(this.title);
    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [
          {
            label: this.translateService.instant("Explore")
          },
          {
            label: this.title
          }
        ]
      })
    );
  }

  private _initTab() {
    const doInit = () => {
      const fragment = this.route.snapshot.fragment;

      if (fragment) {
        this.activeTab = fragment as StatType;
      } else {
        this.activeTab = StatType.IMAGE_DATA;
        this.router.navigate([], {
          relativeTo: this.route,
          fragment: this.activeTab,
          queryParamsHandling: "preserve" // Preserve existing query params when setting default fragment
        });
      }
    };

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroyed$)
      )
      .subscribe(() => {
        doInit();
        this.changeDetectorRef.markForCheck();
      });

    doInit();
  }
}
