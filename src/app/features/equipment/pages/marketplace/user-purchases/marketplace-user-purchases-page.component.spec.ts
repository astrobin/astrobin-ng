import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed, ComponentFixture } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { AppModule } from "@app/app.module";
import { mainStateEffects, mainStateReducers, initialMainState } from "@app/store/state";
import { WindowRefService } from "@core/services/window-ref.service";
import { MarketplaceSearchBarComponent } from "@features/equipment/components/marketplace-search-bar/marketplace-search-bar.component";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder, MockProvider } from "ng-mocks";
import { of } from "rxjs";

import { MarketplaceUserPurchasesPageComponent } from "./marketplace-user-purchases-page.component";

describe("MarketplaceUserPurchasesPageComponent", () => {
  let component: MarketplaceUserPurchasesPageComponent;
  let fixture: ComponentFixture<MarketplaceUserPurchasesPageComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceUserPurchasesPageComponent, AppModule)
      .mock(MarketplaceSearchBarComponent, { export: true })
      .provide([
        WindowRefService,
        provideMockStore({ initialState: initialMainState }),
        MockProvider(ActivatedRoute, {
          queryParams: of({ region: "us" })
        }),
        {
          provide: Router,
          useValue: {
            events: of()
          }
        }
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
