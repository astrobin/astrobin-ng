import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceLineItemComponent } from "./marketplace-line-item.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";
import { MarketplaceGenerator } from "@features/equipment/generators/marketplace.generator";
import { MarketplaceLineItemConditionComponent } from "@features/equipment/components/marketplace-listing-line-item-condition/marketplace-line-item-condition.component";
import { MarketplaceListingLineItemPriceComponent } from "@features/equipment/components/marketplace-listing-line-item-price/marketplace-listing-line-item-price.component";

describe("MarketplaceListingLineItemComponent", () => {
  let component: MarketplaceLineItemComponent;
  let fixture: ComponentFixture<MarketplaceLineItemComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceLineItemComponent, AppModule)
      .mock(MarketplaceLineItemConditionComponent, { export: true })
      .mock(MarketplaceListingLineItemPriceComponent, { export: true })
      .provide(provideMockStore({ initialState: initialMainState }));

    fixture = TestBed.createComponent(MarketplaceLineItemComponent);
    component = fixture.componentInstance;
    component.lineItem = MarketplaceGenerator.lineItem();
    component.listing = MarketplaceGenerator.listing({ lineItems: [component.lineItem] });
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
