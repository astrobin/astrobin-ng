import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceLineItemCardComponent } from "./marketplace-line-item-card.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("MarketplaceListingCardComponent", () => {
  let component: MarketplaceLineItemCardComponent;
  let fixture: ComponentFixture<MarketplaceLineItemCardComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceLineItemCardComponent, AppModule).provide(provideMockStore({ initialState }));


    fixture = TestBed.createComponent(MarketplaceLineItemCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
