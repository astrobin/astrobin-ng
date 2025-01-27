import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceLineItemConditionComponent } from "./marketplace-line-item-condition.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";
import { MarketplaceGenerator } from "@features/equipment/generators/marketplace.generator";
import { MarketplaceListingLineItemPriceComponent } from "@features/equipment/components/marketplace-listing-line-item-price/marketplace-listing-line-item-price.component";

describe("MarketplaceListingLineItemConditionComponent", () => {
  let component: MarketplaceLineItemConditionComponent;
  let fixture: ComponentFixture<MarketplaceLineItemConditionComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceLineItemConditionComponent, AppModule)
      .mock(MarketplaceListingLineItemPriceComponent, { export: true })
      .provide(provideMockStore({ initialState: initialMainState }));

    fixture = TestBed.createComponent(MarketplaceLineItemConditionComponent);
    component = fixture.componentInstance;
    component.lineItem = MarketplaceGenerator.lineItem();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
