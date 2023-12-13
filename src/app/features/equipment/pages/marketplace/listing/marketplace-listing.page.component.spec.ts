import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceListingPageComponent } from "./marketplace-listing.page.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { appStateEffects, appStateReducers, initialState } from "@app/store/state";
import { StoreModule } from "@ngrx/store";
import { EffectsModule } from "@ngrx/effects";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { MarketplaceGenerator } from "@features/equipment/generators/marketplace.generator";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { UserGenerator } from "@shared/generators/user.generator";

describe("MarketplaceListingPageComponent", () => {
  let component: MarketplaceListingPageComponent;
  let fixture: ComponentFixture<MarketplaceListingPageComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceListingPageComponent, AppModule)
      .provide([
        provideMockStore({ initialState }),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                listing: MarketplaceGenerator.listing()
              }
            }
          }
        }
      ])
      .keep(StoreModule.forRoot(appStateReducers))
      .keep(EffectsModule.forRoot(appStateEffects))
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
