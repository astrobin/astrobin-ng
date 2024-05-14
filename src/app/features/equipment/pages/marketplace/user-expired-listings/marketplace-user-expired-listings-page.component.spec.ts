import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceUserExpiredListingsPageComponent } from "./marketplace-user-expired-listings-page.component";
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

describe("MarketplaceUserExpiredListingsPageComponent", () => {
  let component: MarketplaceUserExpiredListingsPageComponent;
  let fixture: ComponentFixture<MarketplaceUserExpiredListingsPageComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceUserExpiredListingsPageComponent, AppModule)
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
      .replace(HttpClientModule, HttpClientTestingModule);

    fixture = TestBed.createComponent(MarketplaceUserExpiredListingsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
