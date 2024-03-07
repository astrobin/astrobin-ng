import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceUserListingsPageComponent } from "./marketplace-user-listings-page.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { appStateEffects, appStateReducers, initialState } from "@app/store/state";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("MarketplaceMyListingsPageComponent", () => {
  let component: MarketplaceUserListingsPageComponent;
  let fixture: ComponentFixture<MarketplaceUserListingsPageComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceUserListingsPageComponent, AppModule)
      .provide([provideMockStore({ initialState })])
      .keep(StoreModule.forRoot(appStateReducers))
      .keep(EffectsModule.forRoot(appStateEffects))
      .replace(HttpClientModule, HttpClientTestingModule);

    fixture = TestBed.createComponent(MarketplaceUserListingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
