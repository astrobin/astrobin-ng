import { TestBed } from "@angular/core/testing";
import { RouterStateSnapshot } from "@angular/router";
import { AppModule } from "@app/app.module";
import { AppContextGenerator } from "@shared/generators/app-context.generator";
import { UltimateSubscriptionGuardService } from "@shared/services/guards/ultimate-subscription-guard.service";
import { UserSubscriptionService } from "@shared/services/user-subscription/user-subscription.service";
import { TestConstants } from "@shared/test-constants";
import { MockBuilder, NG_MOCKS_GUARDS } from "ng-mocks";
import { of } from "rxjs";

describe("UltimateSubscriptionGuardService", () => {
  let service: UltimateSubscriptionGuardService;

  beforeEach(() =>
    MockBuilder(UltimateSubscriptionGuardService, AppModule)
      .exclude(NG_MOCKS_GUARDS)
      .keep(UserSubscriptionService)
  );

  beforeEach(() => {
    service = TestBed.inject(UltimateSubscriptionGuardService);
    jest.spyOn(service.router, "navigateByUrl").mockImplementation(
      () => new Promise<boolean>(resolve => resolve())
    );
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should pass if user is Ultimate", done => {
    const context = AppContextGenerator.default();
    context.currentUserSubscriptions[0].subscription = TestConstants.ASTROBIN_ULTIMATE_2020_ID;
    service.appContextService.context$ = of(context);

    service.canActivate(null, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(true);
      done();
    });
  });

  it("should redirect to permission denied page if user is not Ultimate", done => {
    const context = AppContextGenerator.default();
    context.currentUserSubscriptions[0].subscription = TestConstants.ASTROBIN_PREMIUM_2020_ID;
    service.appContextService.context$ = of(context);

    service.canActivate(null, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(false);
      expect(service.router.navigateByUrl).toHaveBeenCalled();
      done();
    });
  });

  it("should redirect to permission denied page if user is Ultimate but expired", done => {
    const context = AppContextGenerator.default();
    context.currentUserSubscriptions[0].subscription = TestConstants.ASTROBIN_ULTIMATE_2020_ID;
    context.currentUserSubscriptions[0].expires = "1970-01-01";
    service.appContextService.context$ = of(context);

    service.canActivate(null, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(false);
      expect(service.router.navigateByUrl).toHaveBeenCalled();
      done();
    });
  });
});
