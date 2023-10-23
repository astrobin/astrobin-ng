import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceLineItemComponent } from "./marketplace-line-item.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("MarketplaceListingLineItemComponent", () => {
  let component: MarketplaceLineItemComponent;
  let fixture: ComponentFixture<MarketplaceLineItemComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceLineItemComponent, AppModule).provide(provideMockStore({ initialState }));


    fixture = TestBed.createComponent(MarketplaceLineItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
