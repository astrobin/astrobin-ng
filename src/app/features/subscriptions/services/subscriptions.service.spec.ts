import { TestBed } from "@angular/core/testing";

import { AppModule } from "@app/app.module";
import { MainState, mainStateEffects, mainStateReducers } from "@app/store/state";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { SubscriptionsService } from "./subscriptions.service";
import { StateGenerator } from "@app/store/generators/state.generator";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("SubscriptionsService", () => {
  let service: SubscriptionsService;
  const initialState: MainState = StateGenerator.default();

  beforeEach(async () => {
    await MockBuilder(SubscriptionsService, AppModule)
      .keep(StoreModule.forRoot(mainStateReducers))
      .keep(EffectsModule.forRoot(mainStateEffects))
      .replace(HttpClientModule, HttpClientTestingModule)
      .provide(provideMockStore({ initialState }));

    service = TestBed.inject(SubscriptionsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
