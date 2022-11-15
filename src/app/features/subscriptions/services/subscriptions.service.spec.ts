import { TestBed } from "@angular/core/testing";

import { AppModule } from "@app/app.module";
import { appStateEffects, appStateReducers, State } from "@app/store/state";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { SubscriptionsService } from "./subscriptions.service";
import { StateGenerator } from "@app/store/generators/state.generator";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("SubscriptionsService", () => {
  let service: SubscriptionsService;
  let store: MockStore;
  const initialState: State = StateGenerator.default();

  beforeEach(async () => {
    await MockBuilder(SubscriptionsService, AppModule)
      .keep(StoreModule.forRoot(appStateReducers))
      .keep(EffectsModule.forRoot(appStateEffects))
      .replace(HttpClientModule, HttpClientTestingModule)
      .provide(provideMockStore({ initialState }));

    store = TestBed.inject(MockStore);
    service = TestBed.inject(SubscriptionsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
