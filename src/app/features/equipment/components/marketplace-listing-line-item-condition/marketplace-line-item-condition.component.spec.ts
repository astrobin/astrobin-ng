import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceLineItemConditionComponent } from "./marketplace-line-item-condition.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("MarketplaceListingLineItemConditionComponent", () => {
  let component: MarketplaceLineItemConditionComponent;
  let fixture: ComponentFixture<MarketplaceLineItemConditionComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceLineItemConditionComponent, AppModule).provide(provideMockStore({ initialState }));


    fixture = TestBed.createComponent(MarketplaceLineItemConditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
