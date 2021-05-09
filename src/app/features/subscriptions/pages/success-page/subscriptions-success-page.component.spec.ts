import { ActivatedRoute } from "@angular/router";
import { AppModule } from "@app/app.module";
import { AppGenerator } from "@app/store/generators/app.generator";
import { appStateEffects, appStateReducers, State } from "@app/store/state";
import { AuthGenerator } from "@features/account/store/auth.generator";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder, MockProvider, MockRender, ngMocks } from "ng-mocks";
import { SubscriptionsSuccessPageComponent } from "./subscriptions-success-page.component";

describe("SuccessPageComponent", () => {
  let component: SubscriptionsSuccessPageComponent;
  const initialState: State = {
    app: AppGenerator.default(),
    auth: AuthGenerator.default()
  };

  beforeEach(() =>
    MockBuilder(SubscriptionsSuccessPageComponent, AppModule)
      .keep(StoreModule.forRoot(appStateReducers))
      .keep(EffectsModule.forRoot(appStateEffects))
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
