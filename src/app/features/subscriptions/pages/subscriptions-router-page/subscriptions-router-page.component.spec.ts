import { AppModule } from "@app/app.module";
import { MockBuilder, MockRender } from "ng-mocks";
import { SubscriptionsRouterPageComponent } from "./subscriptions-router-page.component";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("SubscriptionsRouterPageComponent", () => {
  let component: SubscriptionsRouterPageComponent;

  beforeEach(() =>
    MockBuilder(SubscriptionsRouterPageComponent, AppModule).provide(provideMockStore({ initialState }))
  );
  beforeEach(() => (component = MockRender(SubscriptionsRouterPageComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
