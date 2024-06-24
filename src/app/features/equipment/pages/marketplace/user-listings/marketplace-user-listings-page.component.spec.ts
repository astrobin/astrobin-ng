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
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { MarketplaceSidebarComponent } from "@features/equipment/components/marketplace-sidebar/marketplace-sidebar.component";
import { MarketplaceSearchBarComponent } from "@features/equipment/components/marketplace-search-bar/marketplace-search-bar.component";
import { MarketplaceListingCardsComponent } from "@features/equipment/components/marketplace-listing-cards/marketplace-listing-cards.component";

describe("MarketplaceMyListingsPageComponent", () => {
  let component: MarketplaceUserListingsPageComponent;
  let fixture: ComponentFixture<MarketplaceUserListingsPageComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceUserListingsPageComponent, AppModule)
      .provide([
        provideMockStore({ initialState }),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ region: "us" }),
            snapshot: {
              paramMap: { get: key => "test-username" }
            }
          }
        }
      ])
      .keep(StoreModule.forRoot(appStateReducers))
      .keep(EffectsModule.forRoot(appStateEffects))
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
