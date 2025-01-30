import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceUserFollowedListingsPageComponent } from "./marketplace-user-followed-listings-page.component";
import { MockBuilder, MockProvider } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { mainStateEffects, mainStateReducers, initialMainState } from "@app/store/state";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { of } from "rxjs";
import { WindowRefService } from "@core/services/window-ref.service";
import { MarketplaceSearchBarComponent } from "@features/equipment/components/marketplace-search-bar/marketplace-search-bar.component";

describe("MarketplaceUserFollowedListingsPageComponent", () => {
  let component: MarketplaceUserFollowedListingsPageComponent;
  let fixture: ComponentFixture<MarketplaceUserFollowedListingsPageComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceUserFollowedListingsPageComponent, AppModule)
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

    fixture = TestBed.createComponent(MarketplaceUserFollowedListingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
