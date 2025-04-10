import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { ImageViewerService } from "@core/services/image-viewer.service";
import { SearchBarComponent } from "@features/search/components/search-bar/search-bar.component";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { BehaviorSubject, EMPTY, of } from "rxjs";

import { SearchPageComponent } from "./search.page.component";

describe("SearchPageComponent", () => {
  let component: SearchPageComponent;
  let fixture: ComponentFixture<SearchPageComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchPageComponent, AppModule)
      .provide([
        provideMockStore({ initialState: initialMainState }),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: {},
              data: {
                image: null
              }
            },
            queryParams: EMPTY
          }
        },
        {
          provide: Router,
          useValue: {
            events: EMPTY
          }
        },
        {
          provide: ImageViewerService,
          useValue: {
            slideshowState$: new BehaviorSubject<boolean>(false),
            autoOpenSlideshow: jest.fn()
          }
        }
      ])
      .mock(SearchBarComponent, { export: true });

    fixture = TestBed.createComponent(SearchPageComponent);
    component = fixture.componentInstance;

    jest.spyOn(component.userSubscriptionService, "displayAds$").mockReturnValue(of(false));

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
