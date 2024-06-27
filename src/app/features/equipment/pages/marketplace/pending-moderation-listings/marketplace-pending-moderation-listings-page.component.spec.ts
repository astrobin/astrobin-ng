import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplacePendingModerationListingsPageComponent } from "./marketplace-pending-moderation-listings-page.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { appStateEffects, appStateReducers, initialState } from "@app/store/state";
import { EffectsModule } from "@ngrx/effects";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { HttpClientModule } from "@angular/common/http";
import { StoreModule } from "@ngrx/store";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { WindowRefService } from "@shared/services/window-ref.service";

describe("SoldListingsComponent", () => {
  let component: MarketplacePendingModerationListingsPageComponent;
  let fixture: ComponentFixture<MarketplacePendingModerationListingsPageComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await MockBuilder(MarketplacePendingModerationListingsPageComponent, AppModule)
      .provide([
        WindowRefService,
        provideMockStore({ initialState }),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ region: "us" })
          }
        }
      ])
      .keep(StoreModule.forRoot(appStateReducers))
      .keep(EffectsModule.forRoot(appStateEffects))
      .replace(HttpClientModule, HttpClientTestingModule);

    store = TestBed.inject(MockStore);

    fixture = TestBed.createComponent(MarketplacePendingModerationListingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
