import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceUserListingsPageComponent } from "./marketplace-user-listings-page.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { mainStateEffects, mainStateReducers, initialMainState } from "@app/store/state";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { of } from "rxjs";
import { MarketplaceSidebarComponent } from "@features/equipment/components/marketplace-sidebar/marketplace-sidebar.component";
import { MarketplaceSearchBarComponent } from "@features/equipment/components/marketplace-search-bar/marketplace-search-bar.component";
import { MarketplaceListingCardsComponent } from "@shared/components/equipment/marketplace-listing-cards/marketplace-listing-cards.component";
import { WindowRefService } from "@core/services/window-ref.service";

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
              paramMap: { get: key => "test-username" }
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
