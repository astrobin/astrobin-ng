import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { MarketplaceListingCardsComponent } from "./marketplace-listing-cards.component";

describe("MarketplaceListingCardsComponent", () => {
  let component: MarketplaceListingCardsComponent;
  let fixture: ComponentFixture<MarketplaceListingCardsComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceListingCardsComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
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
