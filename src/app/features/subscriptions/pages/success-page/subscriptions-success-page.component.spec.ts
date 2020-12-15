import { ActivatedRoute } from "@angular/router";
import { AppModule } from "@app/app.module";
import { MockBuilder, MockProvider, MockRender, ngMocks } from "ng-mocks";
import { SubscriptionsSuccessPageComponent } from "./subscriptions-success-page.component";

describe("SuccessPageComponent", () => {
  let component: SubscriptionsSuccessPageComponent;

  beforeEach(() =>
    MockBuilder(SubscriptionsSuccessPageComponent, AppModule).provide(
      MockProvider(ActivatedRoute, {
        snapshot: {
          queryParams: {
            product: "lite"
          }
        } as any
      })
    )
  );

  beforeEach(() => (component = MockRender(SubscriptionsSuccessPageComponent).point.componentInstance));

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
