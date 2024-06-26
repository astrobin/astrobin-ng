import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceUserFeedbackListPageComponent } from "./marketplace-user-feedback-list-page.component";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { AppModule } from "@app/app.module";
import { ActivatedRoute } from "@angular/router";

describe("MarketplaceUserFeedbackListPageComponent", () => {
  let component: MarketplaceUserFeedbackListPageComponent;
  let fixture: ComponentFixture<MarketplaceUserFeedbackListPageComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceUserFeedbackListPageComponent, AppModule).provide([
      provideMockStore({ initialState }),
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
