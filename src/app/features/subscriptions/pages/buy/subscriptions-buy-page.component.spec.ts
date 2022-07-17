import { ActivatedRoute } from "@angular/router";
import { AppModule } from "@app/app.module";
import { MockBuilder, MockInstance, MockRender, MockReset } from "ng-mocks";
import { EMPTY } from "rxjs";
import { SubscriptionsBuyPageComponent } from "./subscriptions-buy-page.component";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("BuyLitePageComponent", () => {
  let component: SubscriptionsBuyPageComponent;

  beforeEach(() =>
    MockInstance(ActivatedRoute, () => ({
      params: EMPTY
    }))
  );

  afterEach(MockReset);

  beforeEach(() => MockBuilder(SubscriptionsBuyPageComponent, AppModule).provide(provideMockStore({ initialState })));
  beforeEach(() => (component = MockRender(SubscriptionsBuyPageComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
