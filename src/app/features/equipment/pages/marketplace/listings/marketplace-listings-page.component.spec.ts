import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceListingsPageComponent } from "./marketplace-listings-page.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { mainStateEffects, mainStateReducers, initialMainState } from "@app/store/state";
import { EffectsModule } from "@ngrx/effects";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { HttpClientModule } from "@angular/common/http";
import { StoreModule } from "@ngrx/store";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { WindowRefService } from "@shared/services/window-ref.service";

describe("ListingsComponent", () => {
  let component: MarketplaceListingsPageComponent;
  let fixture: ComponentFixture<MarketplaceListingsPageComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await MockBuilder(MarketplaceListingsPageComponent, AppModule)
      .provide([
        WindowRefService,
        provideMockStore({ initialState: initialMainState }),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ region: "us" })
          }
        }
      ])
      .keep(StoreModule.forRoot(mainStateReducers))
      .keep(EffectsModule.forRoot(mainStateEffects))
      .replace(HttpClientModule, HttpClientTestingModule);

    store = TestBed.inject(MockStore);

    fixture = TestBed.createComponent(MarketplaceListingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
