import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceUserPurchasesPageComponent } from "./marketplace-user-purchases-page.component";
import { MockBuilder, MockProvider } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { mainStateEffects, mainStateReducers, initialMainState } from "@app/store/state";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { WindowRefService } from "@shared/services/window-ref.service";

describe("MarketplaceUserPurchasesPageComponent", () => {
  let component: MarketplaceUserPurchasesPageComponent;
  let fixture: ComponentFixture<MarketplaceUserPurchasesPageComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceUserPurchasesPageComponent, AppModule)
      .provide([
        WindowRefService,
        provideMockStore({ initialState: initialMainState }),
        MockProvider(ActivatedRoute, {
          queryParams: of({ region: "us" })
        })
      ])
      .keep(StoreModule.forRoot(mainStateReducers))
      .keep(EffectsModule.forRoot(mainStateEffects))
      .replace(HttpClientModule, HttpClientTestingModule);

    fixture = TestBed.createComponent(MarketplaceUserPurchasesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
