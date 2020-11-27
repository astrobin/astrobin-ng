import { TestBed } from "@angular/core/testing";
import { testAppImports } from "@app/test-app.imports";
import { testAppProviders } from "@app/test-app.providers";
import { AppContextGenerator } from "@shared/generators/app-context.generator";
import { BackendConfigGenerator } from "@shared/generators/backend-config.generator";
import { UserSubscriptionGenerator } from "@shared/generators/user-subscription.generator";
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

    it("should match Ultimate if not active but not expired", done => {
      const context = AppContextGenerator.default();

      context.currentUserSubscriptions[0] = UserSubscriptionGenerator.nonExpiredButNotActiveUserSubscription();
      service.appContextService.context$ = of(context);

      service
        .hasValidSubscription(context.currentUserProfile, [SubscriptionName.ASTROBIN_ULTIMATE_2020])
        .subscribe(result => {
          expect(result).toBe(true);
          done();
        });
    });

    it("should match Ultimate on the last day", done => {
      const context = AppContextGenerator.default();
      context.currentUserSubscriptions[0].expires = new Date().toISOString().split("T")[0];
      service.appContextService.context$ = of(context);

      service
        .hasValidSubscription(context.currentUserProfile, [SubscriptionName.ASTROBIN_ULTIMATE_2020])
        .subscribe(result => {
          expect(result).toBe(true);
          done();
        });
    });

    it("should not match expired Ultimate", done => {
      const context = AppContextGenerator.default();
      context.currentUserSubscriptions = [
        UserSubscriptionGenerator.expiredUserSubscription(TestConstants.ASTROBIN_ULTIMATE_2020_ID)
      ];
      service.appContextService.context$ = of(context);

      service
        .hasValidSubscription(context.currentUserProfile, [SubscriptionName.ASTROBIN_ULTIMATE_2020])
        .subscribe(result => {
          expect(result).toBe(false);
          done();
        });
    });

    it("should match Premium", done => {
      const context = AppContextGenerator.default();
      context.currentUserSubscriptions = [
        UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_PREMIUM_2020_ID)
      ];
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
      context.currentUserSubscriptions = [
        UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_PREMIUM_AUTORENEW_ID)
      ];
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

  describe("uploadAllowed", () => {
    it("should be true if user is Ultimate 2020", done => {
      const context = AppContextGenerator.default();
      const backendConfig = BackendConfigGenerator.backendConfig();

      service.appContextService.context$ = of(context);
      jest.spyOn(service.jsonApiService, "getBackendConfig$").mockReturnValue(of(backendConfig));

      service.uploadAllowed().subscribe(allowed => {
        expect(allowed).toBe(true);
        done();
      });
    });

    it("should be true if user is Premium 2020", done => {
      const context = AppContextGenerator.default();
      context.currentUserSubscriptions = [
        UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_PREMIUM_2020_ID)
      ];
      const backendConfig = BackendConfigGenerator.backendConfig();

      service.appContextService.context$ = of(context);
      jest.spyOn(service.jsonApiService, "getBackendConfig$").mockReturnValue(of(backendConfig));

      service.uploadAllowed().subscribe(allowed => {
        expect(allowed).toBe(true);
        done();
      });
    });

    it("should be true if user is Premium", done => {
      const context = AppContextGenerator.default();
      context.currentUserSubscriptions = [
        UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_PREMIUM_ID)
      ];
      const backendConfig = BackendConfigGenerator.backendConfig();

      service.appContextService.context$ = of(context);
      jest.spyOn(service.jsonApiService, "getBackendConfig$").mockReturnValue(of(backendConfig));

      service.uploadAllowed().subscribe(allowed => {
        expect(allowed).toBe(true);
        done();
      });
    });

    it("should be true if user is Premium Autorenew", done => {
      const context = AppContextGenerator.default();
      context.currentUserSubscriptions = [
        UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_PREMIUM_AUTORENEW_ID)
      ];
      const backendConfig = BackendConfigGenerator.backendConfig();

      service.appContextService.context$ = of(context);
      jest.spyOn(service.jsonApiService, "getBackendConfig$").mockReturnValue(of(backendConfig));

      service.uploadAllowed().subscribe(allowed => {
        expect(allowed).toBe(true);
        done();
      });
    });

    it("should be true if user is Lite 2020 and has fewer uploads than the limit", done => {
      const context = AppContextGenerator.default();
      context.currentUserSubscriptions = [
        UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_LITE_2020_ID)
      ];
      const backendConfig = BackendConfigGenerator.backendConfig();

      service.appContextService.context$ = of(context);
      jest.spyOn(service.jsonApiService, "getBackendConfig$").mockReturnValue(of(backendConfig));

      service.uploadAllowed().subscribe(allowed => {
        expect(allowed).toBe(true);
        done();
      });
    });

    it("should be false if user is Lite 2020 and has more uploads than the limit", done => {
      const context = AppContextGenerator.default();
      context.currentUserSubscriptions = [
        UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_LITE_2020_ID)
      ];
      context.currentUserProfile.premiumCounter = 100;
      const backendConfig = BackendConfigGenerator.backendConfig();

      service.appContextService.context$ = of(context);
      jest.spyOn(service.jsonApiService, "getBackendConfig$").mockReturnValue(of(backendConfig));

      service.uploadAllowed().subscribe(allowed => {
        expect(allowed).toBe(false);
        done();
      });
    });

    it("should be true if user is Lite and has fewer uploads than the limit", done => {
      const context = AppContextGenerator.default();
      context.currentUserSubscriptions = [UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_LITE_ID)];
      const backendConfig = BackendConfigGenerator.backendConfig();

      service.appContextService.context$ = of(context);
      jest.spyOn(service.jsonApiService, "getBackendConfig$").mockReturnValue(of(backendConfig));

      service.uploadAllowed().subscribe(allowed => {
        expect(allowed).toBe(true);
        done();
      });
    });

    it("should be false if user is Lite and has more uploads than the limit", done => {
      const context = AppContextGenerator.default();
      context.currentUserSubscriptions = [UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_LITE_ID)];
      context.currentUserProfile.premiumCounter = 100;
      const backendConfig = BackendConfigGenerator.backendConfig();

      service.appContextService.context$ = of(context);
      jest.spyOn(service.jsonApiService, "getBackendConfig$").mockReturnValue(of(backendConfig));

      service.uploadAllowed().subscribe(allowed => {
        expect(allowed).toBe(false);
        done();
      });
    });

    it("should be true if user is Lite Autorenew and has fewer uploads than the limit", done => {
      const context = AppContextGenerator.default();
      context.currentUserSubscriptions = [
        UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_LITE_AUTORENEW_ID)
      ];
      const backendConfig = BackendConfigGenerator.backendConfig();

      service.appContextService.context$ = of(context);
      jest.spyOn(service.jsonApiService, "getBackendConfig$").mockReturnValue(of(backendConfig));

      service.uploadAllowed().subscribe(allowed => {
        expect(allowed).toBe(true);
        done();
      });
    });

    it("should be false if user is Lite Autorenew and has more uploads than the limit", done => {
      const context = AppContextGenerator.default();
      context.currentUserSubscriptions = [
        UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_LITE_AUTORENEW_ID)
      ];
      context.currentUserProfile.premiumCounter = 100;
      const backendConfig = BackendConfigGenerator.backendConfig();

      service.appContextService.context$ = of(context);
      jest.spyOn(service.jsonApiService, "getBackendConfig$").mockReturnValue(of(backendConfig));

      service.uploadAllowed().subscribe(allowed => {
        expect(allowed).toBe(false);
        done();
      });
    });

    it("should be true if user is Free and has fewer uploads than the limit", done => {
      const context = AppContextGenerator.default();
      context.currentUserSubscriptions = [];
      const backendConfig = BackendConfigGenerator.backendConfig();

      service.appContextService.context$ = of(context);
      jest.spyOn(service.jsonApiService, "getBackendConfig$").mockReturnValue(of(backendConfig));

      service.uploadAllowed().subscribe(allowed => {
        expect(allowed).toBe(true);
        done();
      });
    });

    it("should be false if user is Free and has more uploads than the limit", done => {
      const context = AppContextGenerator.default();
      context.currentUserSubscriptions = [];
      context.currentUserProfile.premiumCounter = 100;
      const backendConfig = BackendConfigGenerator.backendConfig();

      service.appContextService.context$ = of(context);
      jest.spyOn(service.jsonApiService, "getBackendConfig$").mockReturnValue(of(backendConfig));

      service.uploadAllowed().subscribe(allowed => {
        expect(allowed).toBe(false);
        done();
      });
    });
  });

  describe("fileSizeAllowed", () => {
    it("should allow any size if user is Ultimate 2020", done => {
      const context = AppContextGenerator.default();
      const backendConfig = BackendConfigGenerator.backendConfig();

      service.appContextService.context$ = of(context);
      jest.spyOn(service.jsonApiService, "getBackendConfig$").mockReturnValue(of(backendConfig));

      service.fileSizeAllowed(Number.MAX_SAFE_INTEGER).subscribe(result => {
        expect(result.allowed).toBe(true);
        done();
      });
    });

    it("should allow any size if user is Premium", done => {
      const context = AppContextGenerator.default();
      context.currentUserSubscriptions = [
        UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_PREMIUM_ID)
      ];
      const backendConfig = BackendConfigGenerator.backendConfig();

      service.appContextService.context$ = of(context);
      jest.spyOn(service.jsonApiService, "getBackendConfig$").mockReturnValue(of(backendConfig));

      service.fileSizeAllowed(Number.MAX_SAFE_INTEGER).subscribe(result => {
        expect(result.allowed).toBe(true);
        done();
      });
    });

    it("should allow any size if user is Premium Autorenew", done => {
      const context = AppContextGenerator.default();
      context.currentUserSubscriptions = [
        UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_PREMIUM_AUTORENEW_ID)
      ];
      const backendConfig = BackendConfigGenerator.backendConfig();

      service.appContextService.context$ = of(context);
      jest.spyOn(service.jsonApiService, "getBackendConfig$").mockReturnValue(of(backendConfig));

      service.fileSizeAllowed(Number.MAX_SAFE_INTEGER).subscribe(result => {
        expect(result.allowed).toBe(true);
        done();
      });
    });

    it("should allow any size if user is Lite", done => {
      const context = AppContextGenerator.default();
      context.currentUserSubscriptions = [UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_LITE_ID)];
      const backendConfig = BackendConfigGenerator.backendConfig();

      service.appContextService.context$ = of(context);
      jest.spyOn(service.jsonApiService, "getBackendConfig$").mockReturnValue(of(backendConfig));

      service.fileSizeAllowed(Number.MAX_SAFE_INTEGER).subscribe(result => {
        expect(result.allowed).toBe(true);
        done();
      });
    });

    it("should allow any size if user is Lite Autorenew", done => {
      const context = AppContextGenerator.default();
      context.currentUserSubscriptions = [
        UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_LITE_AUTORENEW_ID)
      ];
      const backendConfig = BackendConfigGenerator.backendConfig();

      service.appContextService.context$ = of(context);
      jest.spyOn(service.jsonApiService, "getBackendConfig$").mockReturnValue(of(backendConfig));

      service.fileSizeAllowed(Number.MAX_SAFE_INTEGER).subscribe(result => {
        expect(result.allowed).toBe(true);
        done();
      });
    });

    it("should not allow too large a size if user is Premium 2020", done => {
      const context = AppContextGenerator.default();
      context.currentUserSubscriptions = [
        UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_PREMIUM_2020_ID)
      ];
      const backendConfig = BackendConfigGenerator.backendConfig();

      service.appContextService.context$ = of(context);
      jest.spyOn(service.jsonApiService, "getBackendConfig$").mockReturnValue(of(backendConfig));

      service.fileSizeAllowed(backendConfig.PREMIUM_MAX_IMAGE_SIZE_PREMIUM_2020 + 1).subscribe(result => {
        expect(result.allowed).toBe(false);
        done();
      });
    });

    it("should not allow too large a size if user is Lite 2020", done => {
      const context = AppContextGenerator.default();
      context.currentUserSubscriptions = [
        UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_LITE_2020_ID)
      ];
      const backendConfig = BackendConfigGenerator.backendConfig();

      service.appContextService.context$ = of(context);
      jest.spyOn(service.jsonApiService, "getBackendConfig$").mockReturnValue(of(backendConfig));

      service.fileSizeAllowed(backendConfig.PREMIUM_MAX_IMAGE_SIZE_LITE_2020 + 1).subscribe(result => {
        expect(result.allowed).toBe(false);
        done();
      });
    });

    it("should not allow too large a size if user is Free", done => {
      const context = AppContextGenerator.default();
      context.currentUserSubscriptions = [];
      const backendConfig = BackendConfigGenerator.backendConfig();

      service.appContextService.context$ = of(context);
      jest.spyOn(service.jsonApiService, "getBackendConfig$").mockReturnValue(of(backendConfig));

      service.fileSizeAllowed(backendConfig.PREMIUM_MAX_IMAGE_SIZE_FREE_2020 + 1).subscribe(result => {
        expect(result.allowed).toBe(false);
        done();
      });
    });
  });
});
