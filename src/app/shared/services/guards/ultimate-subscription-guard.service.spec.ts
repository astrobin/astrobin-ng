import { TestBed } from "@angular/core/testing";
import { RouterStateSnapshot } from "@angular/router";
import { testAppImports } from "@app/test-app.imports";
import { testAppProviders } from "@app/test-app.providers";
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
    service.appContextService.context$ = of(AppContextGenerator.appContext());
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should pass if user is Ultimate", () => {
    jest.spyOn(service.userSubscriptionService, "isUltimateSubscriber").mockReturnValue(true);
    service.canActivate(null, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(true);
    });
  });

  it("should redirect to permission denied page if user is not Ultimate", () => {
    jest.spyOn(service.userSubscriptionService, "isUltimateSubscriber").mockReturnValue(false);
    jest.spyOn(service.router, "navigateByUrl").mockImplementation(() => {
      return new Promise(resolve => resolve());
    });
    service.canActivate(null, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(false);
      expect(service.router.navigateByUrl).toHaveBeenCalled();
    });
  });
});
