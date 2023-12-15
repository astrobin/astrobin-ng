import { TestBed } from "@angular/core/testing";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { AppModule } from "@app/app.module";
import { State } from "@app/store/state";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { MockBuilder, MockReset, MockService } from "ng-mocks";
import { of, ReplaySubject } from "rxjs";
import { MarketplaceListingOwnerGuardService } from "./marketplace-listing-owner-guard.service";
import { provideMockActions } from "@ngrx/effects/testing";
import { StateGenerator } from "@app/store/generators/state.generator";
import { UserGenerator } from "@shared/generators/user.generator";
import { EquipmentActionTypes } from "@features/equipment/store/equipment.actions";
import { MarketplaceGenerator } from "@features/equipment/generators/marketplace.generator";

describe("MarketplaceListingOwnerGuardService", () => {
  let service: MarketplaceListingOwnerGuardService;
  let route: ActivatedRouteSnapshot;
  let store: MockStore;
  const actions: ReplaySubject<any> = new ReplaySubject<any>();

  const initialState: State = StateGenerator.default();

  beforeEach(async () => {
    await MockBuilder(MarketplaceListingOwnerGuardService, AppModule).provide([
      provideMockStore({ initialState }),
      provideMockActions(() => actions)
    ]);

    store = TestBed.inject(MockStore);
    service = TestBed.inject(MarketplaceListingOwnerGuardService);

    jest
      .spyOn(service.router, "navigateByUrl")
      .mockImplementation(() => new Promise<boolean>(resolve => resolve(true)));
  });

  afterEach(MockReset);

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should not pass if user is not logged in", done => {
    jest.spyOn(service.authService, "isAuthenticated$").mockReturnValue(of(false));

    service.canActivate(null, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(false);
      done();
    });
  });

  it("should not pass if the listing doesn't exist", done => {
    const state = { ...initialState };
    state.auth.user = UserGenerator.user();
    state.equipment.marketplace.listings = [];
    store.setState(state);

    route = MockService(ActivatedRouteSnapshot, {
      params: { hash: "abc123" }
    });

    jest.spyOn(service.authService, "isAuthenticated$").mockReturnValue(of(true));

    actions.next({ type: EquipmentActionTypes.LOAD_MARKETPLACE_LISTING_FAILURE });

    service.canActivate(route, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(false);
      done();
    });
  });

  it("should not pass if user is not the owner of the listing", done => {
    const user1 = UserGenerator.user({ id: 99 });
    const user2 = UserGenerator.user({ id: 100 });
    const listing = MarketplaceGenerator.listing({ user: user2.id });
    const state = { ...initialState };

    state.auth = { ...state.auth, user: user1 };
    state.equipment = { ...state.equipment, marketplace: { ...state.equipment.marketplace, listings: [listing] } };
    store.setState(state);

    route = MockService(ActivatedRouteSnapshot, {
      params: { hash: "abc123" }
    });

    jest.spyOn(service.authService, "isAuthenticated$").mockReturnValue(of(true));
    jest.spyOn(service.equipmentApiService, "loadMarketplaceListingByHash").mockReturnValue(of(listing));

    service.canActivate(route, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(false);
      done();
    });
  });

  it("should pass if user is the owner of the listing", done => {
    const user = UserGenerator.user({ id: 99 });
    const listing = MarketplaceGenerator.listing({ user: user.id });
    const state = { ...initialState };

    state.auth = { ...state.auth, user: user };
    state.equipment = { ...state.equipment, marketplace: { ...state.equipment.marketplace, listings: [listing] } };
    store.setState(state);

    route = MockService(ActivatedRouteSnapshot, {
      params: { hash: "abc123" }
    });

    jest.spyOn(service.authService, "isAuthenticated$").mockReturnValue(of(true));
    jest.spyOn(service.equipmentApiService, "loadMarketplaceListingByHash").mockReturnValue(of(listing));

    service.canActivate(route, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(true);
      done();
    });
  });
});

