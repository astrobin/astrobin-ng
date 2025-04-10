import { TestBed } from "@angular/core/testing";
import { RouterStateSnapshot } from "@angular/router";
import { AppModule } from "@app/app.module";
import { StateGenerator } from "@app/store/generators/state.generator";
import { MainState } from "@app/store/state";
import { PremiumSubscriptionGuardService } from "@core/services/guards/premium-subscription-guard.service";
import { UserSubscriptionService } from "@core/services/user-subscription/user-subscription.service";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { TestConstants } from "@shared/test-constants";
import { MockBuilder, NG_MOCKS_GUARDS } from "ng-mocks";

describe("PremiumSubscriptionGuardService", () => {
  let service: PremiumSubscriptionGuardService;
  let store: MockStore;
  const initialState: MainState = StateGenerator.default();

  beforeEach(() =>
    MockBuilder(PremiumSubscriptionGuardService, AppModule)
      .exclude(NG_MOCKS_GUARDS)
      .keep(UserSubscriptionService)
      .provide(provideMockStore({ initialState }))
  );

  beforeEach(() => {
    store = TestBed.inject(MockStore);
    service = TestBed.inject(PremiumSubscriptionGuardService);

    jest
      .spyOn(service.router, "navigateByUrl")
      .mockImplementation(() => new Promise<boolean>(resolve => resolve(true)));
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should pass if user is Premium", done => {
    const state = { ...initialState };
    state.auth.userSubscriptions[0].subscription = TestConstants.ASTROBIN_PREMIUM_ID;
    store.setState(state);

    service.canActivate(null, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(true);
      done();
    });
  });

  it("should pass if user is Premium (autorenew)", done => {
    const state = { ...initialState };
    state.auth.userSubscriptions[0].subscription = TestConstants.ASTROBIN_PREMIUM_AUTORENEW_ID;
    store.setState(state);

    service.canActivate(null, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(true);
      done();
    });
  });

  it("should redirect to permission denied page if user is Premium 2020", done => {
    const state = { ...initialState };
    state.auth.userSubscriptions[0].subscription = TestConstants.ASTROBIN_PREMIUM_2020_ID;
    store.setState(state);

    service.canActivate(null, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(false);
      expect(service.router.navigateByUrl).toHaveBeenCalled();
      done();
    });
  });

  it("should redirect to permission denied page if user is Premium but expired", done => {
    const state = { ...initialState };
    state.auth.userSubscriptions[0].subscription = TestConstants.ASTROBIN_PREMIUM_2020_ID;
    state.auth.userSubscriptions[0].expires = "1970-01-01";
    store.setState(state);

    service.canActivate(null, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(false);
      expect(service.router.navigateByUrl).toHaveBeenCalled();
      done();
    });
  });
});
