import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceUserPurchasesPageComponent } from "./marketplace-user-purchases-page.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { appStateEffects, appStateReducers, initialState } from "@app/store/state";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("MarketplaceUserPurchasesPageComponent", () => {
  let component: MarketplaceUserPurchasesPageComponent;
  let fixture: ComponentFixture<MarketplaceUserPurchasesPageComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceUserPurchasesPageComponent, AppModule)
      .provide([provideMockStore({ initialState })])
      .keep(StoreModule.forRoot(appStateReducers))
      .keep(EffectsModule.forRoot(appStateEffects))
      .replace(HttpClientModule, HttpClientTestingModule);

    fixture = TestBed.createComponent(MarketplaceUserPurchasesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});