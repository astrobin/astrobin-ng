import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceLineItemCardsComponent } from "./marketplace-line-item-cards.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("MarketplaceLineItemCardsComponent", () => {
  let component: MarketplaceLineItemCardsComponent;
  let fixture: ComponentFixture<MarketplaceLineItemCardsComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceLineItemCardsComponent, AppModule).provide([
      provideMockStore({ initialState })
    ]);

    fixture = TestBed.createComponent(MarketplaceLineItemCardsComponent);
    component = fixture.componentInstance;
    component.listings = [];
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
