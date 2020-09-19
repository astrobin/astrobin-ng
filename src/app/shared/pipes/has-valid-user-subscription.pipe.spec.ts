import { TestBed } from "@angular/core/testing";
import { testAppImports } from "@app/test-app.imports";
import { testAppProviders } from "@app/test-app.providers";
import { UserProfileGenerator } from "@shared/generators/user-profile.generator";
import { HasValidUserSubscriptionPipe } from "@shared/pipes/has-valid-user-subscription.pipe";
import { UserStoreService } from "@shared/services/user-store.service";
import { UserSubscriptionService } from "@shared/services/user-subscription/user-subscription.service";
import { SubscriptionName } from "@shared/types/subscription-name.type";
import { of } from "rxjs";

describe("HasValidUserSubscriptionPipe", () => {
  let pipe: HasValidUserSubscriptionPipe;

  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: testAppImports,
      providers: testAppProviders
    });

    pipe = new HasValidUserSubscriptionPipe(TestBed.inject(UserStoreService), TestBed.inject(UserSubscriptionService));
  });

  it("should create an instance", () => {
    expect(pipe).toBeTruthy();
  });

  it("pipe should work", done => {
    jest.spyOn(pipe.userSubscriptionService, "hasValidSubscription").mockReturnValue(of(true));
    pipe
      .transform(UserProfileGenerator.userProfile(), [SubscriptionName.ASTROBIN_PREMIUM_AUTORENEW])
      .subscribe(result => {
        expect(result).toBe(true);
        done();
      });
  });
});
