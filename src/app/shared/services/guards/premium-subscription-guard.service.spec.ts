import { TestBed } from "@angular/core/testing";
import { RouterStateSnapshot } from "@angular/router";
import { AppContextGenerator } from "@shared/generators/app-context.generator";
import { PremiumSubscriptionGuardService } from "@shared/services/guards/premium-subscription-guard.service";
import { TestConstants } from "@shared/test-constants";
import { of } from "rxjs";
import { MockBuilder, NG_MOCKS_GUARDS } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { UserSubscriptionService } from "@shared/services/user-subscription/user-subscription.service";

describe("PremiumSubscriptionGuardService", () => {
  let service: PremiumSubscriptionGuardService;

  beforeEach(() =>
    MockBuilder(PremiumSubscriptionGuardService, AppModule)
      .exclude(NG_MOCKS_GUARDS)
      .keep(UserSubscriptionService)
  );

  beforeEach(() => {
    service = TestBed.inject(PremiumSubscriptionGuardService);
    jest.spyOn(service.router, "navigateByUrl").mockImplementation(
      () => new Promise<boolean>(resolve => resolve())
    );
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should pass if user is Premium", done => {
    const context = AppContextGenerator.default();
    context.currentUserSubscriptions[0].subscription = TestConstants.ASTROBIN_PREMIUM_ID;
    service.appContextService.context$ = of(context);

    service.canActivate(null, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(true);
      done();
    });
  });

  it("should pass if user is Premium (autorenew)", done => {
    const context = AppContextGenerator.default();
    context.currentUserSubscriptions[0].subscription = TestConstants.ASTROBIN_PREMIUM_AUTORENEW_ID;
    service.appContextService.context$ = of(context);

    service.canActivate(null, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(true);
      done();
    });
  });

  it("should redirect to permission denied page if user is Premium 2020", done => {
    const context = AppContextGenerator.default();
    context.currentUserSubscriptions[0].subscription = TestConstants.ASTROBIN_PREMIUM_2020_ID;
    service.appContextService.context$ = of(context);

    service.canActivate(null, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(false);
      expect(service.router.navigateByUrl).toHaveBeenCalled();
      done();
    });
  });

  it("should redirect to permission denied page if user is Premium but expired", done => {
    const context = AppContextGenerator.default();
    context.currentUserSubscriptions[0].subscription = TestConstants.ASTROBIN_PREMIUM_ID;
    context.currentUserSubscriptions[0].expires = "1970-01-01";
    service.appContextService.context$ = of(context);

    service.canActivate(null, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(false);
      expect(service.router.navigateByUrl).toHaveBeenCalled();
      done();
    });
  });
});
