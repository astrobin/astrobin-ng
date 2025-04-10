import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { MarketplaceFeedbackComponent } from "@features/equipment/components/marketplace-feedback/marketplace-feedback.component";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { of } from "rxjs";

import { MarketplaceUserFeedbackPageComponent } from "./marketplace-user-feedback-page.component";

describe("MarketplaceUserFeedbackPageComponent", () => {
  let component: MarketplaceUserFeedbackPageComponent;
  let fixture: ComponentFixture<MarketplaceUserFeedbackPageComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceUserFeedbackPageComponent, AppModule)
      .mock(MarketplaceFeedbackComponent, { export: true })
      .provide([
        provideMockStore({ initialState: initialMainState }),
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

    jest.spyOn(component.equipmentApiService, "getMarketplaceFeedbackById").mockReturnValue(of(null));
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
