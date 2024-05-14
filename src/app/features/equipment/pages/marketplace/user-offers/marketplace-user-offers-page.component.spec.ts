import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceUserOffersPageComponent } from "./marketplace-user-offers-page.component";
import { MockBuilder, MockProvider } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { appStateEffects, appStateReducers, initialState } from "@app/store/state";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";

describe("MarketplaceUserOffersPageComponent", () => {
  let component: MarketplaceUserOffersPageComponent;
  let fixture: ComponentFixture<MarketplaceUserOffersPageComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceUserOffersPageComponent, AppModule)
      .provide([
        provideMockStore({ initialState }),
        MockProvider(ActivatedRoute, {
          queryParams: of({ region: "us" })
        })
      ])
      .keep(StoreModule.forRoot(appStateReducers))
      .keep(EffectsModule.forRoot(appStateEffects))
      .replace(HttpClientModule, HttpClientTestingModule);

    fixture = TestBed.createComponent(MarketplaceUserOffersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
