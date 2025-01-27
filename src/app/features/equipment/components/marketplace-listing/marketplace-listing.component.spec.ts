import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceListingComponent } from "./marketplace-listing.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";
import { MarketplaceGenerator } from "@features/equipment/generators/marketplace.generator";
import { MarketplaceLineItemComponent } from "@features/equipment/components/marketplace-listing-line-item/marketplace-line-item.component";

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
