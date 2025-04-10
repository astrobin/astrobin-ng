import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { MarketplaceGenerator } from "@features/equipment/generators/marketplace.generator";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { MarketplaceListingLineItemPriceComponent } from "./marketplace-listing-line-item-price.component";

describe("MarketplaceListingLineItemPriceComponent", () => {
  let component: MarketplaceListingLineItemPriceComponent;
  let fixture: ComponentFixture<MarketplaceListingLineItemPriceComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceListingLineItemPriceComponent, AppModule).provide(
      provideMockStore({ initialState: initialMainState })
    );

    fixture = TestBed.createComponent(MarketplaceListingLineItemPriceComponent);
    component = fixture.componentInstance;
    component.listing = MarketplaceGenerator.listing();
    component.lineItem = component.listing.lineItems[0];
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
