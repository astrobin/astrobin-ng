import { TestBed } from "@angular/core/testing";
import { testAppImports } from "@app/test-app.imports";
import { testAppProviders } from "@app/test-app.providers";
import { AppContextGenerator } from "@shared/generators/app-context.generator";
import { TestConstants } from "@shared/test-constants";
import { SubscriptionName } from "@shared/types/subscription-name.type";
import { of } from "rxjs";
import { UserSubscriptionService } from "./user-subscription.service";

describe("UserSubscriptionService", () => {
  let service: UserSubscriptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: testAppImports,
      providers: [...testAppProviders, UserSubscriptionService]
    });
    service = TestBed.inject(UserSubscriptionService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("hasValidSubscription", () => {
    it("should match Ultimate", done => {
      const context = AppContextGenerator.default();

      service.appContextService.context$ = of(context);

      service
        .hasValidSubscription(context.currentUserProfile, [SubscriptionName.ASTROBIN_ULTIMATE_2020])
        .subscribe(result => {
          expect(result).toBe(true);
          done();
        });
    });

    it("should match Premium", done => {
      const context = AppContextGenerator.default();
      context.currentUserSubscriptions[0].subscription = TestConstants.ASTROBIN_PREMIUM_2020_ID;

      service.appContextService.context$ = of(context);

      service
        .hasValidSubscription(context.currentUserProfile, [SubscriptionName.ASTROBIN_PREMIUM_2020])
        .subscribe(result => {
          expect(result).toBe(true);
          done();
        });
    });

    it("should match if user has one of many", done => {
      const context = AppContextGenerator.default();
      context.currentUserSubscriptions[0].subscription = TestConstants.ASTROBIN_PREMIUM_AUTORENEW_ID;

      service.appContextService.context$ = of(context);

      service
        .hasValidSubscription(context.currentUserProfile, [
          SubscriptionName.ASTROBIN_PREMIUM_AUTORENEW,
          SubscriptionName.ASTROBIN_PREMIUM
        ])
        .subscribe(result => {
          expect(result).toBe(true);
          done();
        });
    });

    it("should be false when mismatching", done => {
      const context = AppContextGenerator.default();

      service.appContextService.context$ = of(context);

      service
        .hasValidSubscription(context.currentUserProfile, [SubscriptionName.ASTROBIN_PREMIUM_2020])
        .subscribe(result => {
          expect(result).toBe(false);
          done();
        });
    });

    it("should be false when user doesn't have subscriptions", done => {
      const context = AppContextGenerator.default();
      context.currentUserSubscriptions = [];

      service.appContextService.context$ = of(context);

      service
        .hasValidSubscription(context.currentUserProfile, [SubscriptionName.ASTROBIN_ULTIMATE_2020])
        .subscribe(result => {
          expect(result).toBe(false);
          done();
        });
    });
  });
});
