import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { StateGenerator } from "@app/store/generators/state.generator";
import { MainState } from "@app/store/state";
import { SubscriptionName } from "@core/types/subscription-name.type";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { UserSubscriptionGenerator } from "@shared/generators/user-subscription.generator";
import { TestConstants } from "@shared/test-constants";
import { MockBuilder } from "ng-mocks";

import { UserSubscriptionService } from "./user-subscription.service";

describe("UserSubscriptionService", () => {
  let service: UserSubscriptionService;
  let store: MockStore;
  const initialState: MainState = StateGenerator.default();

  beforeEach(async () => {
    await MockBuilder(UserSubscriptionService, AppModule).provide(provideMockStore({ initialState }));
    store = TestBed.inject(MockStore);
    service = TestBed.inject(UserSubscriptionService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("hasValidSubscription", () => {
    it("should match Ultimate", done => {
      service
        .hasValidSubscription$(initialState.auth.userProfile, [SubscriptionName.ASTROBIN_ULTIMATE_2020])
        .subscribe(result => {
          expect(result).toBe(true);
          done();
        });
    });

    it("should not match Ultimate if not active and not expired", done => {
      const state = { ...initialState };
      state.auth.userSubscriptions[0] = UserSubscriptionGenerator.nonExpiredButNotActiveUserSubscription();
      store.setState(state);

      service
        .hasValidSubscription$(initialState.auth.userProfile, [SubscriptionName.ASTROBIN_ULTIMATE_2020])
        .subscribe(result => {
          expect(result).toBe(false);
          done();
        });
    });

    it("should match Ultimate on the last day", done => {
      const state = { ...initialState };
      state.auth.userSubscriptions[0].expires = new Date().toISOString().split("T")[0];
      state.auth.userSubscriptions[0].active = true;
      store.setState(state);

      service
        .hasValidSubscription$(initialState.auth.userProfile, [SubscriptionName.ASTROBIN_ULTIMATE_2020])
        .subscribe(result => {
          expect(result).toBe(true);
          done();
        });
    });

    it("should not match expired Ultimate", done => {
      const state = { ...initialState };
      state.auth.userSubscriptions = [
        UserSubscriptionGenerator.expiredUserSubscription(TestConstants.ASTROBIN_ULTIMATE_2020_ID)
      ];
      store.setState(state);

      service
        .hasValidSubscription$(initialState.auth.userProfile, [SubscriptionName.ASTROBIN_ULTIMATE_2020])
        .subscribe(result => {
          expect(result).toBe(false);
          done();
        });
    });

    it("should match Premium", done => {
      const state = { ...initialState };
      state.auth.userSubscriptions = [
        UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_PREMIUM_2020_ID)
      ];
      store.setState(state);

      service
        .hasValidSubscription$(initialState.auth.userProfile, [SubscriptionName.ASTROBIN_PREMIUM_2020])
        .subscribe(result => {
          expect(result).toBe(true);
          done();
        });
    });

    it("should match if user has one of many", done => {
      const state = { ...initialState };
      state.auth.userSubscriptions = [
        UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_PREMIUM_AUTORENEW_ID)
      ];
      store.setState(state);

      service
        .hasValidSubscription$(initialState.auth.userProfile, [
          SubscriptionName.ASTROBIN_PREMIUM_AUTORENEW,
          SubscriptionName.ASTROBIN_PREMIUM
        ])
        .subscribe(result => {
          expect(result).toBe(true);
          done();
        });
    });

    it("should be false when mismatching", done => {
      service
        .hasValidSubscription$(initialState.auth.userProfile, [SubscriptionName.ASTROBIN_PREMIUM_2020])
        .subscribe(result => {
          expect(result).toBe(false);
          done();
        });
    });

    it("should be false when user doesn't have subscriptions", done => {
      const state = { ...initialState };
      state.auth.userSubscriptions = [];
      store.setState(state);

      service
        .hasValidSubscription$(initialState.auth.userProfile, [SubscriptionName.ASTROBIN_ULTIMATE_2020])
        .subscribe(result => {
          expect(result).toBe(false);
          done();
        });
    });
  });

  describe("getUserSubscription$", () => {
    it("should get active Ultimate", done => {
      store.setState(StateGenerator.default());

      service
        .getActiveUserSubscription$(initialState.auth.userProfile, SubscriptionName.ASTROBIN_ULTIMATE_2020)
        .subscribe(result => {
          expect(result).not.toBeNull();
          done();
        });
    });

    it("should not get inactive Ultimate", done => {
      const state = StateGenerator.default();
      state.auth.userSubscriptions[0].active = false;
      store.setState(state);

      service
        .getActiveUserSubscription$(initialState.auth.userProfile, SubscriptionName.ASTROBIN_ULTIMATE_2020)
        .subscribe(result => {
          expect(result).toBeNull();
          done();
        });
    });
  });

  describe("uploadAllowed", () => {
    it("should be true if user is Ultimate 2020", done => {
      service.uploadAllowed$().subscribe(allowed => {
        expect(allowed).toBe(true);
        done();
      });
    });

    it("should be true if user is Premium 2020", done => {
      const state = { ...initialState };
      state.auth.userSubscriptions = [
        UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_PREMIUM_2020_ID)
      ];
      store.setState(state);

      service.uploadAllowed$().subscribe(allowed => {
        expect(allowed).toBe(true);
        done();
      });
    });

    it("should be true if user is Premium", done => {
      const state = { ...initialState };
      state.auth.userSubscriptions = [UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_PREMIUM_ID)];
      store.setState(state);

      service.uploadAllowed$().subscribe(allowed => {
        expect(allowed).toBe(true);
        done();
      });
    });

    it("should be true if user is Premium Autorenew", done => {
      const state = { ...initialState };
      state.auth.userSubscriptions = [
        UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_PREMIUM_AUTORENEW_ID)
      ];
      store.setState(state);

      service.uploadAllowed$().subscribe(allowed => {
        expect(allowed).toBe(true);
        done();
      });
    });

    it("should be true if user is Lite 2020 and has fewer uploads than the limit", done => {
      const state = { ...initialState };
      state.auth.userSubscriptions = [UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_LITE_2020_ID)];
      store.setState(state);

      service.uploadAllowed$().subscribe(allowed => {
        expect(allowed).toBe(true);
        done();
      });
    });

    it("should be false if user is Lite 2020 and has more uploads than the limit", done => {
      const state = { ...initialState };
      state.auth.userSubscriptions = [UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_LITE_2020_ID)];
      state.auth.userProfile.premiumCounter = 100;
      store.setState(state);

      service.uploadAllowed$().subscribe(allowed => {
        expect(allowed).toBe(false);
        done();
      });
    });

    it("should be true if user is Lite and has fewer uploads than the limit", done => {
      const state = { ...initialState };
      state.auth.userSubscriptions = [UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_LITE_ID)];
      state.auth.userProfile.premiumCounter = 0;
      store.setState(state);

      service.uploadAllowed$().subscribe(allowed => {
        expect(allowed).toBe(true);
        done();
      });
    });

    it("should be false if user is Lite and has more uploads than the limit", done => {
      const state = { ...initialState };
      state.auth.userSubscriptions = [UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_LITE_ID)];
      state.auth.userProfile.premiumCounter = 100;
      store.setState(state);

      service.uploadAllowed$().subscribe(allowed => {
        expect(allowed).toBe(false);
        done();
      });
    });

    it("should be true if user is Lite Autorenew and has fewer uploads than the limit", done => {
      const state = { ...initialState };
      state.auth.userSubscriptions = [
        UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_LITE_AUTORENEW_ID)
      ];
      state.auth.userProfile.premiumCounter = 0;
      store.setState(state);

      service.uploadAllowed$().subscribe(allowed => {
        expect(allowed).toBe(true);
        done();
      });
    });

    it("should be false if user is Lite Autorenew and has more uploads than the limit", done => {
      const state = { ...initialState };
      state.auth.userSubscriptions = [
        UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_LITE_AUTORENEW_ID)
      ];
      state.auth.userProfile.premiumCounter = 100;
      store.setState(state);

      service.uploadAllowed$().subscribe(allowed => {
        expect(allowed).toBe(false);
        done();
      });
    });

    it("should be true if user is Free and has fewer uploads than the limit", done => {
      const state = { ...initialState };
      state.auth.userSubscriptions = [];
      state.auth.userProfile.premiumCounter = 0;
      store.setState(state);

      service.uploadAllowed$().subscribe(allowed => {
        expect(allowed).toBe(true);
        done();
      });
    });

    it("should be false if user is Free and has more uploads than the limit", done => {
      const state = { ...initialState };
      state.auth.userSubscriptions = [];
      state.auth.userProfile.premiumCounter = 100;
      store.setState(state);

      service.uploadAllowed$().subscribe(allowed => {
        expect(allowed).toBe(false);
        done();
      });
    });
  });

  describe("fileSizeAllowed", () => {
    it("should allow any size if user is Ultimate 2020", done => {
      const state = { ...initialState };
      state.auth.userSubscriptions = [
        UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_ULTIMATE_2020_ID)
      ];
      store.setState(state);

      service.fileSizeAllowed(Number.MAX_SAFE_INTEGER).subscribe(result => {
        expect(result.allowed).toBe(true);
        done();
      });
    });

    it("should allow any size if user is Premium", done => {
      const state = { ...initialState };
      state.auth.userSubscriptions = [UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_PREMIUM_ID)];
      store.setState(state);

      service.fileSizeAllowed(Number.MAX_SAFE_INTEGER).subscribe(result => {
        expect(result.allowed).toBe(true);
        done();
      });
    });

    it("should allow any size if user is Premium Autorenew", done => {
      const state = { ...initialState };
      state.auth.userSubscriptions = [
        UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_PREMIUM_AUTORENEW_ID)
      ];
      store.setState(state);

      service.fileSizeAllowed(Number.MAX_SAFE_INTEGER).subscribe(result => {
        expect(result.allowed).toBe(true);
        done();
      });
    });

    it("should allow any size if user is Lite", done => {
      const state = { ...initialState };
      state.auth.userSubscriptions = [UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_LITE_ID)];
      store.setState(state);

      service.fileSizeAllowed(Number.MAX_SAFE_INTEGER).subscribe(result => {
        expect(result.allowed).toBe(true);
        done();
      });
    });

    it("should allow any size if user is Lite Autorenew", done => {
      const state = { ...initialState };
      state.auth.userSubscriptions = [
        UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_LITE_AUTORENEW_ID)
      ];
      store.setState(state);

      service.fileSizeAllowed(Number.MAX_SAFE_INTEGER).subscribe(result => {
        expect(result.allowed).toBe(true);
        done();
      });
    });

    it("should not allow too large a size if user is Premium 2020", done => {
      const state = { ...initialState };
      state.auth.userSubscriptions = [
        UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_PREMIUM_2020_ID)
      ];
      store.setState(state);

      service
        .fileSizeAllowed(initialState.app.backendConfig.PREMIUM_MAX_IMAGE_SIZE_PREMIUM_2020 + 1)
        .subscribe(result => {
          expect(result.allowed).toBe(false);
          done();
        });
    });

    it("should not allow too large a size if user is Lite 2020", done => {
      const state = { ...initialState };
      state.auth.userSubscriptions = [UserSubscriptionGenerator.userSubscription(TestConstants.ASTROBIN_LITE_2020_ID)];
      store.setState(state);

      service.fileSizeAllowed(initialState.app.backendConfig.PREMIUM_MAX_IMAGE_SIZE_LITE_2020 + 1).subscribe(result => {
        expect(result.allowed).toBe(false);
        done();
      });
    });

    it("should not allow too large a size if user is Free", done => {
      const state = { ...initialState };
      state.auth.userSubscriptions = [];
      store.setState(state);

      service.fileSizeAllowed(initialState.app.backendConfig.PREMIUM_MAX_IMAGE_SIZE_FREE_2020 + 1).subscribe(result => {
        expect(result.allowed).toBe(false);
        done();
      });
    });
  });
});
