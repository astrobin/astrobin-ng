import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceListingPageComponent } from "./marketplace-listing.page.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { mainStateEffects, mainStateReducers, initialMainState } from "@app/store/state";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { MarketplaceGenerator } from "@features/equipment/generators/marketplace.generator";
import { ActivatedRoute, Router } from "@angular/router";
import { EMPTY, of } from "rxjs";
import { UserGenerator } from "@shared/generators/user.generator";
import { WindowRefService } from "@shared/services/window-ref.service";

describe("MarketplaceListingPageComponent", () => {
  let component: MarketplaceListingPageComponent;
  let fixture: ComponentFixture<MarketplaceListingPageComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceListingPageComponent, AppModule)
      .provide([
        provideMockStore({ initialState: initialMainState }),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                listing: MarketplaceGenerator.listing()
              }
            }
          }
        },
        {
          provide: Router,
          useValue: {
            events: EMPTY,
            url: "/marketplace/123"
          }
        },
        WindowRefService
      ])
      .keep(StoreModule.forRoot(mainStateReducers))
      .keep(EffectsModule.forRoot(mainStateEffects))
      .replace(HttpClientModule, HttpClientTestingModule);

    fixture = TestBed.createComponent(MarketplaceListingPageComponent);
    component = fixture.componentInstance;
    component.listing = MarketplaceGenerator.listing();

    jest.spyOn(
      component.equipmentMarketplaceService, "getListingUser$"
    ).mockReturnValue(of(UserGenerator.user()));
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
