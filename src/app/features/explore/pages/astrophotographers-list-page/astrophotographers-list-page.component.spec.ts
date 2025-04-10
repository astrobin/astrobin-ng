import { NO_ERRORS_SCHEMA, PLATFORM_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import type { ComponentFixture } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import type { UserSearchInterface } from "@core/interfaces/user-search.interface";
import { UserSearchApiService } from "@core/services/api/classic/users/user-search-api.service";
import type { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import { LoadingService } from "@core/services/loading.service";
import { SearchService } from "@core/services/search.service";
import { TitleService } from "@core/services/title/title.service";
import { UserService } from "@core/services/user.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { selectCurrentUserProfile } from "@features/account/store/auth.selectors";
import { NgbNavModule } from "@ng-bootstrap/ng-bootstrap";
import { provideMockStore } from "@ngrx/store/testing";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { Constants } from "@shared/constants";
import { PipesModule } from "@shared/pipes/pipes.module";
import { CookieService } from "ngx-cookie";
import { BehaviorSubject, of } from "rxjs";

import { AstrophotographersListPageComponent } from "./astrophotographers-list-page.component";

describe("AstrophotographersListPageComponent", () => {
  let component: AstrophotographersListPageComponent;
  let fixture: ComponentFixture<AstrophotographersListPageComponent>;
  let mockUserSearchApiService: any;
  let mockTitleService: any;
  let mockTranslateService: any;
  let mockLoadingService: any;
  let mockUserService: any;
  let mockRouter: any;
  let mockActivatedRoute: any;
  let mockWindowRefService: any;
  let mockCookieService: any;
  let mockUtilsService: any;

  // Mock navigation events observable
  const navigationEvents$ = new BehaviorSubject<any>(
    new NavigationEnd(1, "/explore/astrophotographers-list", "/explore/astrophotographers-list")
  );

  // Mock search results
  const mockResults: UserSearchInterface[] = [
    {
      username: "testuser1",
      displayName: "Test User 1",
      avatarUrl: Constants.DEFAULT_AVATAR,
      images: 10,
      totalLikesReceived: 20,
      followers: 5,
      normalizedLikes: 2.0,
      contributionIndex: 1.5,
      topPicks: 2,
      iotds: 1,
      topPickNominations: 3,
      integration: 100,
      commentsWritten: 15,
      commentsReceived: 25,
      commentLikesReceived: 10,
      forumPosts: 5,
      forumPostLikesReceived: 8
    },
    {
      username: "testuser2",
      displayName: "Test User 2",
      avatarUrl: Constants.DEFAULT_AVATAR,
      images: 15,
      totalLikesReceived: 30,
      followers: 10,
      normalizedLikes: 3.0,
      contributionIndex: 2.5,
      topPicks: 1,
      iotds: 0,
      topPickNominations: 2,
      integration: 200,
      commentsWritten: 20,
      commentsReceived: 15,
      commentLikesReceived: 5,
      forumPosts: 10,
      forumPostLikesReceived: 12
    }
  ];

  // Mock API response
  const mockApiResponse: PaginatedApiResultInterface<UserSearchInterface> = {
    count: 2,
    results: mockResults,
    next: null,
    prev: null
  };

  beforeEach(async () => {
    // Setup mocks
    mockUserSearchApiService = {
      search: jest.fn().mockReturnValue(of(mockApiResponse))
    };

    mockTranslateService = {
      instant: jest.fn().mockImplementation(key => key),
      get: jest.fn().mockImplementation(key => of(key)),
      stream: jest.fn().mockImplementation(key => of(key)),
      use: jest.fn(),
      onLangChange: { subscribe: jest.fn() },
      onTranslationChange: { subscribe: jest.fn() },
      onDefaultLangChange: { subscribe: jest.fn() },
      getBrowserLang: jest.fn().mockReturnValue("en"),
      setDefaultLang: jest.fn()
    };

    mockTitleService = {
      setTitle: jest.fn()
    };

    mockLoadingService = {};

    mockUserService = {
      getGalleryUrl: jest.fn().mockImplementation(username => `/user/${username}/`),
      openGallery: jest.fn()
    };

    mockWindowRefService = {
      locationAssign: jest.fn(),
      nativeWindow: {
        scrollTo: jest.fn(),
        innerWidth: 1024,
        innerHeight: 768,
        location: {
          href: "https://example.com",
          pathname: "/test"
        }
      }
    };

    mockCookieService = {
      get: jest.fn().mockReturnValue(""),
      set: jest.fn(),
      check: jest.fn().mockReturnValue(true),
      delete: jest.fn(),
      getAll: jest.fn().mockReturnValue({})
    };

    mockUtilsService = {
      camelCaseToSnakeCase: jest.fn().mockImplementation(s => s.replace(/[A-Z]/g, c => "_" + c.toLowerCase())),
      toQueryString: jest.fn().mockReturnValue("test=value"),
      compressQueryString: jest.fn().mockReturnValue("test=value")
    };

    mockRouter = {
      events: navigationEvents$.asObservable(),
      navigate: jest.fn(),
      url: "/explore/astrophotographers-list"
    };

    mockActivatedRoute = {
      queryParams: of({}),
      snapshot: {
        queryParams: {},
        fragment: null
      }
    };

    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        NgbNavModule,
        TranslateModule.forRoot(),
        RouterTestingModule,
        NoopAnimationsModule,
        PipesModule
      ],
      declarations: [AstrophotographersListPageComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideMockStore({
          selectors: [{ selector: selectCurrentUserProfile, value: null }]
        }),
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute
        },
        {
          provide: Router,
          useValue: mockRouter
        },
        {
          provide: UserSearchApiService,
          useValue: mockUserSearchApiService
        },
        {
          provide: SearchService,
          useValue: {}
        },
        {
          provide: TitleService,
          useValue: mockTitleService
        },
        {
          provide: TranslateService,
          useValue: mockTranslateService
        },
        {
          provide: LoadingService,
          useValue: mockLoadingService
        },
        {
          provide: UserService,
          useValue: mockUserService
        },
        {
          provide: PLATFORM_ID,
          useValue: "browser"
        },
        {
          provide: WindowRefService,
          useValue: mockWindowRefService
        },
        {
          provide: CookieService,
          useValue: mockCookieService
        },
        {
          provide: UtilsService,
          useValue: mockUtilsService
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AstrophotographersListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should load users on init", () => {
    expect(mockUserSearchApiService.search).toHaveBeenCalled();
    expect(component.results.length).toBe(2);
    expect(component.hasMore).toBe(false);
  });

  it("should set title", () => {
    // Call the method that sets the title to ensure it's called
    component._initTitleAndBreadcrumb();
    expect(mockTitleService.setTitle).toHaveBeenCalled();
  });

  it("should change tabs correctly", () => {
    // Setup spy on resetList
    const resetListSpy = jest.spyOn(component, "resetList");

    // Mock navChange event
    const navChangeEvent = {
      nextId: "contribution-data",
      previousId: "image-data"
    };

    // Call method
    component.onTabChange(navChangeEvent as any);

    // Verify navigation occurred with correct fragment
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        fragment: "contribution-data",
        queryParamsHandling: "preserve"
      })
    );

    // Verify tab was updated and list was reset
    expect(component.activeTab).toBe("contribution-data");
    expect(resetListSpy).toHaveBeenCalled();
  });

  it("should handle sorting correctly", () => {
    // Setup spy on resetList
    const resetListSpy = jest.spyOn(component, "resetList");

    // Call sort method
    component.onSort("followers");

    // Verify sort values were updated
    expect(component.sortColumn).toBe("followers");
    expect(component.sortDirection).toBe("desc"); // First click on numeric should be desc

    // Verify navigation occurred with correct query params
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: { sort: "followers", direction: "desc" },
        queryParamsHandling: "merge",
        preserveFragment: true
      })
    );

    // Verify list was reset
    expect(resetListSpy).toHaveBeenCalled();
  });

  it("should handle search correctly", () => {
    // Set search query
    component.searchQuery = "test";

    // Call search method
    component.onSearch();

    // Verify navigation occurred with correct search parameter
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: { q: "test" },
        queryParamsHandling: "merge",
        preserveFragment: true
      })
    );
  });

  it("should clear search", () => {
    // Set search query
    component.searchQuery = "test";

    // Mock navigate to update URL
    mockRouter.navigate.mockClear();

    // Call clear search method
    component.onClearSearch();

    // Verify search was cleared
    expect(component.searchQuery).toBe("");

    // Verify navigation occurred with removed search parameter
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: { q: null },
        queryParamsHandling: "merge",
        preserveFragment: true
      })
    );
  });

  it("should open user gallery on click", () => {
    // Setup fake timers
    jest.useFakeTimers();

    // Call user click method
    const mockEvent = { preventDefault: jest.fn() } as any;
    component.onUserClick(mockEvent, "testuser1");

    // Verify prevent default was called
    expect(mockEvent.preventDefault).toHaveBeenCalled();

    // Verify username was added to loading state
    expect(component.loadingUsernames).toContain("testuser1");

    // Fast-forward timers
    jest.runAllTimers();

    // Verify user service open gallery was called
    expect(mockUserService.openGallery).toHaveBeenCalledWith("testuser1", true);

    // Restore real timers
    jest.useRealTimers();
  });

  it("should get correct sort icon", () => {
    // Setup component sort state
    component.sortColumn = "followers";
    component.sortDirection = "desc";

    // Check active column with desc direction
    expect(component.getSortIcon("followers")).toBe("sort-down");

    // Check active column with asc direction
    component.sortDirection = "asc";
    expect(component.getSortIcon("followers")).toBe("sort-up");

    // Check inactive column
    expect(component.getSortIcon("iotds")).toBe("sort");
  });

  it("should get avatar URL correctly", () => {
    // Test regular avatar URL (not containing default-avatar)
    const regularAvatarUrl = "https://example.com/images/user-avatar.png";
    expect(component.getAvatarUrl(regularAvatarUrl)).toBe(regularAvatarUrl);

    // Test with default avatar in URL
    const withDefaultAvatarInUrl = "https://example.com/images/default-avatar/123.png";
    expect(component.getAvatarUrl(withDefaultAvatarInUrl)).toBe(Constants.DEFAULT_AVATAR);
  });

  it("should load more data when requested", () => {
    // Clear previous calls
    mockUserSearchApiService.search.mockClear();

    // Set hasMore to true and simulate load more
    component.hasMore = true;
    component.loadMore();

    // Verify page increased and data load triggered
    expect(component.page).toBe(2);
    expect(mockUserSearchApiService.search).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2
      })
    );
  });
});
