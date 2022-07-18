import { AppModule } from "@app/app.module";
import { MockBuilder, MockRender } from "ng-mocks";
import { SubscriptionsCancelledPageComponent } from "./subscriptions-cancelled-page.component";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("CancelledPageComponent", () => {
  let component: SubscriptionsCancelledPageComponent;

  beforeEach(() =>
    MockBuilder(SubscriptionsCancelledPageComponent, AppModule).provide(provideMockStore({ initialState }))
  );
  beforeEach(() => (component = MockRender(SubscriptionsCancelledPageComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
