import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { AppModule } from "@app/app.module";
import { mainStateEffects, mainStateReducers, initialMainState } from "@app/store/state";
import { WindowRefService } from "@core/services/window-ref.service";
import { MarketplaceSearchBarComponent } from "@features/equipment/components/marketplace-search-bar/marketplace-search-bar.component";
import { MarketplaceSidebarComponent } from "@features/equipment/components/marketplace-sidebar/marketplace-sidebar.component";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { provideMockStore } from "@ngrx/store/testing";
import { MarketplaceListingCardsComponent } from "@shared/components/equipment/marketplace-listing-cards/marketplace-listing-cards.component";
import { MockBuilder } from "ng-mocks";
import { of } from "rxjs";

import { MarketplaceUserListingsPageComponent } from "./marketplace-user-listings-page.component";

describe("MarketplaceMyListingsPageComponent", () => {
  let component: MarketplaceUserListingsPageComponent;
  let fixture: ComponentFixture<MarketplaceUserListingsPageComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceUserListingsPageComponent, AppModule)
      .provide([
        WindowRefService,
        provideMockStore({ initialState: initialMainState }),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ region: "us" }),
            snapshot: {
              paramMap: { get: () => "test-username" }
            }
          }
        },
        {
          provide: Router,
          useValue: {
            events: of()
          }
        }
      ])
      .keep(StoreModule.forRoot(mainStateReducers))
      .keep(EffectsModule.forRoot(mainStateEffects))
      .replace(HttpClientModule, HttpClientTestingModule)
      .mock(MarketplaceSidebarComponent, { export: true })
      .mock(MarketplaceSearchBarComponent, { export: true })
      .mock(MarketplaceListingCardsComponent, { export: true });

    fixture = TestBed.createComponent(MarketplaceUserListingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
