import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceUserSoldListingsPageComponent } from "./marketplace-user-sold-listings-page.component";
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
import { WindowRefService } from "@core/services/window-ref.service";
import { MarketplaceSearchBarComponent } from "@features/equipment/components/marketplace-search-bar/marketplace-search-bar.component";

describe("MarketplaceUserSoldListingsPageComponent", () => {
  let component: MarketplaceUserSoldListingsPageComponent;
  let fixture: ComponentFixture<MarketplaceUserSoldListingsPageComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceUserSoldListingsPageComponent, AppModule)
      .mock(MarketplaceSearchBarComponent, { export: true })
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
      .replace(HttpClientModule, HttpClientTestingModule);

    fixture = TestBed.createComponent(MarketplaceUserSoldListingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
