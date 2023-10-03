import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceListingsPageComponent } from "./marketplace-listings-page.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("ListingsComponent", () => {
  let component: MarketplaceListingsPageComponent;
  let fixture: ComponentFixture<MarketplaceListingsPageComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceListingsPageComponent, AppModule).provide(provideMockStore({ initialState }));

    fixture = TestBed.createComponent(MarketplaceListingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
