import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceListingCardsComponent } from "./marketplace-listing-cards.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("MarketplaceListingCardsComponent", () => {
  let component: MarketplaceListingCardsComponent;
  let fixture: ComponentFixture<MarketplaceListingCardsComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceListingCardsComponent, AppModule).provide([
      provideMockStore({ initialState })
    ]);

    fixture = TestBed.createComponent(MarketplaceListingCardsComponent);
    component = fixture.componentInstance;
    component.listings = [];
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
