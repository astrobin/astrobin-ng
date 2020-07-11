import { TestBed } from "@angular/core/testing";
import { RouterStateSnapshot } from "@angular/router";
import { testAppImports } from "@app/test-app.imports";
import { testAppProviders } from "@app/test-app.providers";
import { AppContextGenerator } from "@shared/generators/app-context.generator";
import { AuthGuardService } from "@shared/services/guards/auth-guard.service";
import { UltimateSubscriptionGuardService } from "@shared/services/guards/ultimate-subscription-guard.service";
import { TestConstants } from "@shared/test-constants";
import { of } from "rxjs";

describe("UltimateSubscriptionGuardService", () => {
  let service: UltimateSubscriptionGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: testAppImports,
      providers: [...testAppProviders, AuthGuardService, UltimateSubscriptionGuardService]
    }).compileComponents();
  });

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
    const context = AppContextGenerator.appContext();
    context.currentUserSubscriptions[0].subscription = TestConstants.ASTROBIN_ULTIMATE_2020_ID;
    service.appContextService.context$ = of(context);

    service.canActivate(null, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(true);
      done();
    });
  });

  it("should redirect to permission denied page if user is not Ultimate", done => {
    const context = AppContextGenerator.appContext();
    context.currentUserSubscriptions[0].subscription = TestConstants.ASTROBIN_PREMIUM_2020_ID;
    service.appContextService.context$ = of(context);

    service.canActivate(null, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(false);
      expect(service.router.navigateByUrl).toHaveBeenCalled();
      done();
    });
  });

  it("should redirect to permission denied page if user is Ultimate but not valid", done => {
    const context = AppContextGenerator.appContext();
    context.currentUserSubscriptions[0].subscription = TestConstants.ASTROBIN_ULTIMATE_2020_ID;
    context.currentUserSubscriptions[0].valid = false;
    service.appContextService.context$ = of(context);

    service.canActivate(null, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(false);
      expect(service.router.navigateByUrl).toHaveBeenCalled();
      done();
    });
  });
});
