import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { AppModule } from "@app/app.module";
import { mainStateEffects, mainStateReducers, initialMainState } from "@app/store/state";
import { WindowRefService } from "@core/services/window-ref.service";
import { MarketplaceGenerator } from "@features/equipment/generators/marketplace.generator";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { provideMockStore } from "@ngrx/store/testing";
import { UserGenerator } from "@shared/generators/user.generator";
import { MockBuilder } from "ng-mocks";
import { EMPTY, of } from "rxjs";

import { MarketplaceListingPageComponent } from "./marketplace-listing.page.component";

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

    jest.spyOn(component.windowRefService, "scroll").mockImplementation(() => {});

    jest.spyOn(component.equipmentMarketplaceService, "getListingUser$").mockReturnValue(of(UserGenerator.user()));
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
