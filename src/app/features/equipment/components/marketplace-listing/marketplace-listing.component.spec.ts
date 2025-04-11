import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { MarketplaceLineItemComponent } from "@features/equipment/components/marketplace-listing-line-item/marketplace-line-item.component";
import { MarketplaceGenerator } from "@features/equipment/generators/marketplace.generator";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { MarketplaceListingComponent } from "./marketplace-listing.component";

describe("MarketplaceListingComponent", () => {
  let component: MarketplaceListingComponent;
  let fixture: ComponentFixture<MarketplaceListingComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceListingComponent, AppModule)
      .mock(MarketplaceLineItemComponent, { export: true })
      .provide(provideMockStore({ initialState: initialMainState }));

    fixture = TestBed.createComponent(MarketplaceListingComponent);
    component = fixture.componentInstance;
    component.listing = MarketplaceGenerator.listing();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
