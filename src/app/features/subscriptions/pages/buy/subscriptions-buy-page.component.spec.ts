import { SubscriptionsBuyPageComponent } from "./subscriptions-buy-page.component";
import { MockBuilder, MockInstance, MockRender, MockReset } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { ActivatedRoute } from "@angular/router";
import { EMPTY } from "rxjs";

describe("BuyLitePageComponent", () => {
  let component: SubscriptionsBuyPageComponent;

  beforeEach(() =>
    MockInstance(ActivatedRoute, () => ({
      params: EMPTY
    }))
  );

  afterEach(MockReset);

  beforeEach(() => MockBuilder(SubscriptionsBuyPageComponent, AppModule));
  beforeEach(() => (component = MockRender(SubscriptionsBuyPageComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
