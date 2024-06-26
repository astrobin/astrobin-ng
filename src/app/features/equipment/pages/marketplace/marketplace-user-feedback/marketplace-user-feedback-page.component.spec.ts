import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceUserFeedbackPageComponent } from "./marketplace-user-feedback-page.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";

describe("MarketplaceUserFeedbackPageComponent", () => {
  let component: MarketplaceUserFeedbackPageComponent;
  let fixture: ComponentFixture<MarketplaceUserFeedbackPageComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceUserFeedbackPageComponent, AppModule).provide([
      provideMockStore({ initialState }),
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            params: {
              id: 1
            }
          }
        }
      }
    ]);

    fixture = TestBed.createComponent(MarketplaceUserFeedbackPageComponent);
    component = fixture.componentInstance;

    jest.spyOn(component.equipmentApiService, "getMarketplaceFeedbackById").mockReturnValue(
      of(null)
    )
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
