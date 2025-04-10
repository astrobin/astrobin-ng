import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder, MockRender } from "ng-mocks";

import { SubscriptionsRouterPageComponent } from "./subscriptions-router-page.component";

describe("SubscriptionsRouterPageComponent", () => {
  let component: SubscriptionsRouterPageComponent;

  beforeEach(() =>
    MockBuilder(SubscriptionsRouterPageComponent, AppModule).provide(
      provideMockStore({ initialState: initialMainState })
    )
  );
  beforeEach(() => (component = MockRender(SubscriptionsRouterPageComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
