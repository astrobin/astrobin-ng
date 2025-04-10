import { TestBed } from "@angular/core/testing";
import type { RouterStateSnapshot } from "@angular/router";
import { ActivatedRouteSnapshot } from "@angular/router";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { AstroBinGroupGuardService } from "@core/services/guards/astrobin-group-guard.service";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { UserGenerator } from "@shared/generators/user.generator";
import { MockBuilder, MockReset, MockService } from "ng-mocks";
import { of } from "rxjs";

describe("AstroBinGroupGuardService", () => {
  let service: AstroBinGroupGuardService;
  let route: ActivatedRouteSnapshot;
  let store: MockStore;

  afterEach(MockReset);

  beforeEach(async () => {
    await MockBuilder(AstroBinGroupGuardService, AppModule).provide(
      provideMockStore({ initialState: initialMainState })
    );

    store = TestBed.inject(MockStore);
    service = TestBed.inject(AstroBinGroupGuardService);

    route = MockService(ActivatedRouteSnapshot, {
      data: { astroBinGroup: "Test group" }
    });
    jest
      .spyOn(service.router, "navigateByUrl")
      .mockImplementation(() => new Promise<boolean>(resolve => resolve(true)));
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should not pass if user is not in the group", done => {
    jest.spyOn(service.authService, "isAuthenticated$").mockReturnValue(of(false));

    service.canActivate(route, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(false);
      done();
    });
  });

  it("should pass if user is in the group", done => {
    const user = UserGenerator.user();
    const state = { ...initialMainState };
    state.auth.user = user;
    store.setState(state);

    jest.spyOn(service.authService, "isAuthenticated$").mockReturnValue(of(true));

    service.canActivate(route, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(true);
      done();
    });
  });
});
