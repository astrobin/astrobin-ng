import { TestBed } from "@angular/core/testing";
import { RouterStateSnapshot } from "@angular/router";
import { testAppImports } from "@app/test-app.imports";
import { testAppProviders } from "@app/test-app.providers";
import { Constants } from "@shared/constants";
import { AppContextGenerator } from "@shared/generators/app-context.generator";
import { AuthGuardService } from "@shared/services/guards/auth-guard.service";
import { UltimateSubscriptionGuardService } from "@shared/services/guards/ultimate-subscription-guard.service";
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
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should pass if user is Ultimate", () => {
    const context = AppContextGenerator.appContext();
    context.subscriptions[0].name = Constants.ASTROBIN_ULTIMATE_2020;
    service.appContextService.context$ = of(AppContextGenerator.appContext());
    service.canActivate(null, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(true);
    });
  });

  it("should redirect to permission denied page if user is not Ultimate", () => {
    const context = AppContextGenerator.appContext();
    context.subscriptions[0].name = Constants.ASTROBIN_PREMIUM_2020;
    service.canActivate(null, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(false);
      expect(service.router.navigateByUrl).toHaveBeenCalled();
    });
  });
});
