import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceListingComponent } from "./marketplace-listing.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("MarketplaceListingComponent", () => {
  let component: MarketplaceListingComponent;
  let fixture: ComponentFixture<MarketplaceListingComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceListingComponent, AppModule).provide(provideMockStore({ initialState }));

    fixture = TestBed.createComponent(MarketplaceListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
