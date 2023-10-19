import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceListingLineItemImagesComponent } from "./marketplace-listing-line-item-images.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("MarketplaceListingLineItemImagesComponent", () => {
  let component: MarketplaceListingLineItemImagesComponent;
  let fixture: ComponentFixture<MarketplaceListingLineItemImagesComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceListingLineItemImagesComponent, AppModule).provide(provideMockStore({ initialState }));

    fixture = TestBed.createComponent(MarketplaceListingLineItemImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
