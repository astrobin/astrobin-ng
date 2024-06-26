import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceUserFeedbackListComponent } from "./marketplace-user-feedback-list.component";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { AppModule } from "@app/app.module";
import { ActivatedRoute } from "@angular/router";

describe("MarketplaceUserFeedbackListComponent", () => {
  let component: MarketplaceUserFeedbackListComponent;
  let fixture: ComponentFixture<MarketplaceUserFeedbackListComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceUserFeedbackListComponent, AppModule).provide([
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

    fixture = TestBed.createComponent(MarketplaceUserFeedbackListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
