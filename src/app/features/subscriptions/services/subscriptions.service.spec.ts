import { TestBed } from "@angular/core/testing";

import { AppModule } from "@app/app.module";
import { AppState, appStateEffects, appStateReducers } from "@app/store/app.states";
import { AppGenerator } from "@app/store/generators/app.generator";
import { AuthGenerator } from "@features/account/store/auth.generator";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { SubscriptionsService } from "./subscriptions.service";

describe("SubscriptionsService", () => {
  let service: SubscriptionsService;
  let store: MockStore;
  const initialState: AppState = {
    app: AppGenerator.default(),
    auth: AuthGenerator.default()
  };

  beforeEach(async () => {
    await MockBuilder(SubscriptionsService, AppModule)
      .keep(StoreModule.forRoot(appStateReducers))
      .keep(EffectsModule.forRoot(appStateEffects))
      .provide(provideMockStore({ initialState }));

    store = TestBed.inject(MockStore);
    service = TestBed.inject(SubscriptionsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
