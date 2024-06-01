import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceOfferSummaryComponent } from "./marketplace-offer-summary.component";
import { MockBuilder } from "ng-mocks";
import { initialState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { AppModule } from "@app/app.module";
import { MarketplaceGenerator } from "@features/equipment/generators/marketplace.generator";

describe("MarketplaceOfferSummaryComponent", () => {
  let component: MarketplaceOfferSummaryComponent;
  let fixture: ComponentFixture<MarketplaceOfferSummaryComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceOfferSummaryComponent, AppModule).provide([
      provideMockStore({ initialState })
    ]);

    fixture = TestBed.createComponent(MarketplaceOfferSummaryComponent);
    component = fixture.componentInstance;
    component.listing = MarketplaceGenerator.listing();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
