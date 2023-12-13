import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceListingLineItemPriceComponent } from "./marketplace-listing-line-item-price.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { MarketplaceGenerator } from "@features/equipment/generators/marketplace.generator";

describe("MarketplaceListingLineItemPriceComponent", () => {
  let component: MarketplaceListingLineItemPriceComponent;
  let fixture: ComponentFixture<MarketplaceListingLineItemPriceComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceListingLineItemPriceComponent, AppModule).provide(provideMockStore({ initialState }));

    fixture = TestBed.createComponent(MarketplaceListingLineItemPriceComponent);
    component = fixture.componentInstance;
    component.lineItem = MarketplaceGenerator.lineItem();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
