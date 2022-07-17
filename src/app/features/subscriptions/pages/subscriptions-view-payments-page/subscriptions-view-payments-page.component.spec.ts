import { AppModule } from "@app/app.module";
import { MockBuilder, MockRender } from "ng-mocks";
import { SubscriptionsViewPaymentsPageComponent } from "./subscriptions-view-payments-page.component";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("SubscriptionsViewPaymentsPageComponent", () => {
  let component: SubscriptionsViewPaymentsPageComponent;

  beforeEach(() =>
    MockBuilder(SubscriptionsViewPaymentsPageComponent, AppModule).provide(provideMockStore({ initialState }))
  );
  beforeEach(() => (component = MockRender(SubscriptionsViewPaymentsPageComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
