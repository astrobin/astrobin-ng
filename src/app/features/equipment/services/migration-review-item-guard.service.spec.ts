import { TestBed } from "@angular/core/testing";
import { RouterStateSnapshot, ActivatedRouteSnapshot } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { MigrationFlag } from "@core/services/api/classic/astrobin/migratable-gear-item-api.service.interface";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { UserGenerator } from "@shared/generators/user.generator";
import { MockBuilder, MockReset, MockService } from "ng-mocks";
import { of } from "rxjs";

import { MigrationReviewItemGuardService } from "./migration-review-item-guard.service";

describe("MigrationReviewItemGuardService", () => {
  let store: MockStore;
  let route: ActivatedRouteSnapshot;
  let service: MigrationReviewItemGuardService;

  beforeEach(async () => {
    await MockBuilder(MigrationReviewItemGuardService, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
      RouterTestingModule
    ]);

    store = TestBed.inject(MockStore);
    service = TestBed.inject(MigrationReviewItemGuardService);

    route = MockService(ActivatedRouteSnapshot, {
      params: { migrationStrategyId: 1 }
    });

    jest
      .spyOn(service.router, "navigateByUrl")
      .mockImplementation(() => new Promise<boolean>(resolve => resolve(true)));
  });

  afterEach(MockReset);

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should not pass if the user is the moderator for this item", done => {
    const state = { ...initialMainState };
    state.auth.user = UserGenerator.user();
    store.setState(state);

    const item = {
      pk: 1,
      gear: 1
    };

    const strategy = {
      pk: 1,
      migrationFlag: MigrationFlag.NOT_ENOUGH_INFO,
      migrationFlagModerator: state.auth.user.id
    };

    jest.spyOn(service.migrationStrategyApiService, "get").mockReturnValue(of(strategy));
    jest.spyOn(service.legacyGearApi, "get").mockReturnValue(of(item));

    service.canActivate(route, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(false);
      done();
    });
  });

  it("should not pass if the item is locked for review", done => {
    const state = { ...initialMainState };
    state.auth.user = UserGenerator.user();
    store.setState(state);

    const item = {
      pk: 1
    };

    const strategy = {
      pk: 1,
      gear: 1,
      migrationFlag: MigrationFlag.NOT_ENOUGH_INFO,
      migrationFlagModerator: 999,
      migrationFlagReviewerLock: 999
    };

    jest.spyOn(service.migrationStrategyApiService, "get").mockReturnValue(of(strategy));
    jest.spyOn(service.legacyGearApi, "get").mockReturnValue(of(item));

    service.canActivate(route, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(false);
      done();
    });
  });

  it("should not pass if the item is already reviewed", done => {
    const state = { ...initialMainState };
    state.auth.user = UserGenerator.user();
    store.setState(state);

    const item = {
      pk: 1
    };

    const strategy = {
      pk: 1,
      gear: 1,
      migrationFlag: MigrationFlag.NOT_ENOUGH_INFO,
      migrationFlagModerator: 999,
      migrationFlagReviewer: 1000
    };

    jest.spyOn(service.migrationStrategyApiService, "get").mockReturnValue(of(strategy));
    jest.spyOn(service.legacyGearApi, "get").mockReturnValue(of(item));

    service.canActivate(route, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(false);
      done();
    });
  });

  it("should pass if the user is not the moderator and the item is not locked for review", done => {
    const state = { ...initialMainState };
    state.auth.user = UserGenerator.user();
    store.setState(state);

    const item = {
      pk: 1
    };

    const strategy = {
      pk: 1,
      gear: 1,
      migrationFlag: MigrationFlag.NOT_ENOUGH_INFO,
      migrationFlagModerator: 999
    };

    jest.spyOn(service.migrationStrategyApiService, "get").mockReturnValue(of(strategy));
    jest.spyOn(service.legacyGearApi, "get").mockReturnValue(of(item));

    service.canActivate(route, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(true);
      done();
    });
  });

  it("should pass if the user is not the moderator and the item is locked for review by the user", done => {
    const state = { ...initialMainState };
    state.auth.user = UserGenerator.user();
    store.setState(state);

    const item = {
      pk: 1
    };

    const strategy = {
      pk: 1,
      gear: 1,
      migrationFlag: MigrationFlag.NOT_ENOUGH_INFO,
      migrationFlagModerator: 999,
      migrationFlagReviewerLock: state.auth.user.id
    };

    jest.spyOn(service.migrationStrategyApiService, "get").mockReturnValue(of(strategy));
    jest.spyOn(service.legacyGearApi, "get").mockReturnValue(of(item));

    service.canActivate(route, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(true);
      done();
    });
  });

  it("should not pass if the item is not reviewable", done => {
    const state = { ...initialMainState };
    state.auth.user = UserGenerator.user();
    store.setState(state);

    const item = {
      pk: 1
    };

    const strategy = {
      pk: 1,
      gear: 1,
      migrationFlag: null,
      migrationFlagModerator: 999,
      migrationFlagReviewerLock: state.auth.user.id
    };

    jest.spyOn(service.migrationStrategyApiService, "get").mockReturnValue(of(strategy));
    jest.spyOn(service.legacyGearApi, "get").mockReturnValue(of(item));

    service.canActivate(route, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(false);
      done();
    });
  });
});
