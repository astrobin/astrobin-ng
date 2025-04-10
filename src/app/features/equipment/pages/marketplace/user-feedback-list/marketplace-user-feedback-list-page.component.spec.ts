import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { MarketplaceUserFeedbackListPageComponent } from "./marketplace-user-feedback-list-page.component";

describe("MarketplaceUserFeedbackListPageComponent", () => {
  let component: MarketplaceUserFeedbackListPageComponent;
  let fixture: ComponentFixture<MarketplaceUserFeedbackListPageComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceUserFeedbackListPageComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            paramMap: {
              has: jest.fn(),
              get: jest.fn(),
              getAll: jest.fn(),
              keys: []
            }
          }
        }
      }
    ]);

    fixture = TestBed.createComponent(MarketplaceUserFeedbackListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
