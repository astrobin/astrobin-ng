import { SubscriptionsRouterPageComponent } from "./subscriptions-router-page.component";
import { MockBuilder, MockRender } from "ng-mocks";
import { AppModule } from "@app/app.module";

describe("SubscriptionsRouterPageComponent", () => {
  let component: SubscriptionsRouterPageComponent;

  beforeEach(() => MockBuilder(SubscriptionsRouterPageComponent, AppModule));
  beforeEach(() => (component = MockRender(SubscriptionsRouterPageComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
