import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceListingLineItemComponent } from "./marketplace-listing-line-item.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("MarketplaceListingLineItemComponent", () => {
  let component: MarketplaceListingLineItemComponent;
  let fixture: ComponentFixture<MarketplaceListingLineItemComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceListingLineItemComponent, AppModule).provide(provideMockStore({ initialState }));


    fixture = TestBed.createComponent(MarketplaceListingLineItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
