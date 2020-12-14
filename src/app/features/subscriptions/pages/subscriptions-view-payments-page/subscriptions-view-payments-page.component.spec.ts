import { SubscriptionsViewPaymentsPageComponent } from "./subscriptions-view-payments-page.component";
import { MockBuilder, MockRender } from "ng-mocks";
import { AppModule } from "@app/app.module";

describe("SubscriptionsViewPaymentsPageComponent", () => {
  let component: SubscriptionsViewPaymentsPageComponent;

  beforeEach(() => MockBuilder(SubscriptionsViewPaymentsPageComponent, AppModule));
  beforeEach(() => (component = MockRender(SubscriptionsViewPaymentsPageComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
