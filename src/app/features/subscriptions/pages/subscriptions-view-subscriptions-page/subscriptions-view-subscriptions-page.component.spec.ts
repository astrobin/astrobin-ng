import { AppModule } from "@app/app.module";
import { MockBuilder, MockRender } from "ng-mocks";
import { SubscriptionsViewSubscriptionsPageComponent } from "./subscriptions-view-subscriptions-page.component";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("SubscriptionsViewSubscriptionsPageComponent", () => {
  let component: SubscriptionsViewSubscriptionsPageComponent;

  beforeEach(() =>
    MockBuilder(SubscriptionsViewSubscriptionsPageComponent, AppModule).provide(provideMockStore({ initialState }))
  );
  beforeEach(() => (component = MockRender(SubscriptionsViewSubscriptionsPageComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
