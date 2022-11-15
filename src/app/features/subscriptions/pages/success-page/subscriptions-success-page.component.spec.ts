import { ActivatedRoute } from "@angular/router";
import { AppModule } from "@app/app.module";
import { appStateEffects, appStateReducers, State } from "@app/store/state";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder, MockProvider, MockRender } from "ng-mocks";
import { SubscriptionsSuccessPageComponent } from "./subscriptions-success-page.component";
import { StateGenerator } from "@app/store/generators/state.generator";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("SuccessPageComponent", () => {
  let component: SubscriptionsSuccessPageComponent;
  const initialState: State = StateGenerator.default();

  beforeEach(() =>
    MockBuilder(SubscriptionsSuccessPageComponent, AppModule)
      .keep(StoreModule.forRoot(appStateReducers))
      .keep(EffectsModule.forRoot(appStateEffects))
      .replace(HttpClientModule, HttpClientTestingModule)
      .provide(provideMockStore({ initialState }))
      .provide(
        MockProvider(ActivatedRoute, {
          snapshot: {
            queryParams: {
              product: "lite"
            }
          } as any
        })
      )
  );

  beforeEach(() => {
    component = MockRender(SubscriptionsSuccessPageComponent).point.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
