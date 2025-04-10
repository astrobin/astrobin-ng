import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder, MockRender } from "ng-mocks";

import { SubscriptionsOptionsPageComponent } from "./subscriptions-options-page.component";

describe("SubscriptionsOptionsPageComponent", () => {
  let component: SubscriptionsOptionsPageComponent;

  beforeEach(() =>
    MockBuilder(SubscriptionsOptionsPageComponent, AppModule).provide(
      provideMockStore({ initialState: initialMainState })
    )
  );
  beforeEach(() => (component = MockRender(SubscriptionsOptionsPageComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
