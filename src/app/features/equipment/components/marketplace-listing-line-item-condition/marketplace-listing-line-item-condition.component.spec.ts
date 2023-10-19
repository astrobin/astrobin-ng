import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceListingLineItemConditionComponent } from "./marketplace-listing-line-item-condition.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("MarketplaceListingLineItemConditionComponent", () => {
  let component: MarketplaceListingLineItemConditionComponent;
  let fixture: ComponentFixture<MarketplaceListingLineItemConditionComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceListingLineItemConditionComponent, AppModule).provide(provideMockStore({ initialState }));


    fixture = TestBed.createComponent(MarketplaceListingLineItemConditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
