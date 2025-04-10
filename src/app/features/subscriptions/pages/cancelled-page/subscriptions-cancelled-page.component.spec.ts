import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder, MockRender } from "ng-mocks";

import { SubscriptionsCancelledPageComponent } from "./subscriptions-cancelled-page.component";

describe("CancelledPageComponent", () => {
  let component: SubscriptionsCancelledPageComponent;

  beforeEach(() =>
    MockBuilder(SubscriptionsCancelledPageComponent, AppModule).provide(
      provideMockStore({ initialState: initialMainState })
    )
  );
  beforeEach(() => (component = MockRender(SubscriptionsCancelledPageComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
