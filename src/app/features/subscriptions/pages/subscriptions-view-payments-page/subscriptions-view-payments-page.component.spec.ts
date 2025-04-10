import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder, MockRender } from "ng-mocks";

import { SubscriptionsViewPaymentsPageComponent } from "./subscriptions-view-payments-page.component";

describe("SubscriptionsViewPaymentsPageComponent", () => {
  let component: SubscriptionsViewPaymentsPageComponent;

  beforeEach(() =>
    MockBuilder(SubscriptionsViewPaymentsPageComponent, AppModule).provide(
      provideMockStore({ initialState: initialMainState })
    )
  );
  beforeEach(() => (component = MockRender(SubscriptionsViewPaymentsPageComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
