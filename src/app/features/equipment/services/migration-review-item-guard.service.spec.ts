import { TestBed } from "@angular/core/testing";

import { MigrationReviewItemGuardService } from "./migration-review-item-guard.service";
import { MockBuilder, MockInstance, MockReset, ngMocks } from "ng-mocks";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { UserGenerator } from "@shared/generators/user.generator";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { AppModule } from "@app/app.module";
import { of } from "rxjs";

describe("MigrationReviewItemGuardService", () => {
  let store: MockStore;
  let route: ActivatedRouteSnapshot;
  let service: MigrationReviewItemGuardService;

  beforeEach(async () => {
    await MockInstance(ActivatedRouteSnapshot, instance => {
      ngMocks.stub(instance, "params", "get");
    });

    await MockBuilder(MigrationReviewItemGuardService, AppModule)
      .mock(ActivatedRouteSnapshot)
      .provide(provideMockStore({ initialState }));

    store = TestBed.inject(MockStore);
    service = TestBed.inject(MigrationReviewItemGuardService);

    jest.spyOn(service.router, "navigateByUrl").mockImplementation(
      () => new Promise<boolean>(resolve => resolve(true))
    );
  });

  afterEach(MockReset);

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should not pass if the user is the moderator for this item", done => {
    const state = { ...initialState };
    state.auth.user = UserGenerator.user();
    store.setState(state);

    const item = {
      migrationFlagModerator: state.auth.user.id
    };

    route = TestBed.inject(ActivatedRouteSnapshot);
    jest.spyOn(route, "params", "get").mockReturnValue({ itemId: 1 });
    jest.spyOn(service.legacyGearApi, "get").mockReturnValue(of(item));

    service.canActivate(route, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(false);
      done();
    });
  });

  it("should not pass if the item is locked for review", done => {
    const state = { ...initialState };
    state.auth.user = UserGenerator.user();
    store.setState(state);

    const item = {
      migrationFlagModerator: 999,
      migrationFlagReviewerLock: 999
    };

    route = TestBed.inject(ActivatedRouteSnapshot);
    jest.spyOn(route, "params", "get").mockReturnValue({ itemId: 1 });
    jest.spyOn(service.legacyGearApi, "get").mockReturnValue(of(item));

    service.canActivate(route, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(false);
      done();
    });
  });

  it("should pass if the user is not the moderator and the item is not locked for review", done => {
    const state = { ...initialState };
    state.auth.user = UserGenerator.user();
    store.setState(state);

    const item = {
      migrationFlagModerator: 999
    };

    route = TestBed.inject(ActivatedRouteSnapshot);
    jest.spyOn(route, "params", "get").mockReturnValue({ itemId: 1 });
    jest.spyOn(service.legacyGearApi, "get").mockReturnValue(of(item));

    service.canActivate(route, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(true);
      done();
    });
  });
});
