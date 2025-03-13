import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AstrophotographersListPageComponent } from "./astrophotographers-list-page.component";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { ActivatedRoute, convertToParamMap, Router } from "@angular/router";
import { of } from "rxjs";
import { SharedModule } from "@shared/shared.module";
import { TranslateModule } from "@ngx-translate/core";
import { RouterTestingModule } from "@angular/router/testing";
import { UserSearchApiService } from "@core/services/api/classic/users/user-search-api.service";
import { SearchService } from "@core/services/search.service";
import { TitleService } from "@core/services/title/title.service";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

describe("AstrographersListPageComponent", () => {
  let component: AstrophotographersListPageComponent;
  let fixture: ComponentFixture<AstrophotographersListPageComponent>;
  let mockStore: MockStore;
  let mockUserSearchApiService: jasmine.SpyObj<UserSearchApiService>;
  let mockTitleService: jasmine.SpyObj<TitleService>;

  beforeEach(async () => {
    mockUserSearchApiService = jasmine.createSpyObj("UserSearchApiService", ["search"]);
    mockUserSearchApiService.search.and.returnValue(of({
      count: 1,
      results: [{
        username: "testuser",
        displayName: "Test User",
        avatarUrl: "/assets/images/default-avatar.jpeg",
        images: 10,
        totalLikesReceived: 20,
        followers: 5,
        normalizedLikes: 2.0,
        contributionIndex: 1.5,
        imageIndex: 1.8
      }],
      next: null,
      previous: null
    }));

    mockTitleService = jasmine.createSpyObj("TitleService", ["setTitle"]);

    await TestBed.configureTestingModule({
      imports: [
        SharedModule,
        TranslateModule.forRoot(),
        RouterTestingModule,
        BrowserAnimationsModule
      ],
      declarations: [
        AstrophotographersListPageComponent
      ],
      providers: [
        provideMockStore(),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({
              page: 1,
              sort: "username",
              direction: "asc"
            }),
            snapshot: {
              fragment: null
            }
          }
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
        }
      ]
    }).compileComponents();

    mockStore = TestBed.inject(MockStore);
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
    expect(component.users.length).toBe(1);
  });

  it("should set title", () => {
    expect(mockTitleService.setTitle).toHaveBeenCalled();
  });
});
