import { SubscriptionsViewSubscriptionsPageComponent } from "./subscriptions-view-subscriptions-page.component";
import { MockBuilder, MockRender } from "ng-mocks";
import { AppModule } from "@app/app.module";

describe("SubscriptionsViewSubscriptionsPageComponent", () => {
  let component: SubscriptionsViewSubscriptionsPageComponent;

  beforeEach(() => MockBuilder(SubscriptionsViewSubscriptionsPageComponent, AppModule));
  beforeEach(() => (component = MockRender(SubscriptionsViewSubscriptionsPageComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
