import { TestBed } from "@angular/core/testing";
import { RouterStateSnapshot, ActivatedRouteSnapshot } from "@angular/router";
import { AppModule } from "@app/app.module";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { StateGenerator } from "@app/store/generators/state.generator";
import { MainState } from "@app/store/state";
import { provideMockActions } from "@ngrx/effects/testing";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { ImageGenerator } from "@shared/generators/image.generator";
import { UserGenerator } from "@shared/generators/user.generator";
import { MockBuilder, MockReset, MockService } from "ng-mocks";
import { of, ReplaySubject } from "rxjs";

import { ImageOwnerGuardService } from "./image-owner-guard.service";

describe("ImageOwnerGuardService", () => {
  let service: ImageOwnerGuardService;
  let route: ActivatedRouteSnapshot;
  let store: MockStore;
  const actions: ReplaySubject<any> = new ReplaySubject<any>();

  const initialState: MainState = StateGenerator.default();

  beforeEach(async () => {
    await MockBuilder(ImageOwnerGuardService, AppModule).provide([
      provideMockStore({ initialState }),
      provideMockActions(() => actions)
    ]);

    store = TestBed.inject(MockStore);
    service = TestBed.inject(ImageOwnerGuardService);

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

  it("should not pass if the image doesn't exist", done => {
    const state = { ...initialState };
    state.auth.user = UserGenerator.user();
    state.app.images = [];
    store.setState(state);

    route = MockService(ActivatedRouteSnapshot, {
      params: { imageId: 1 }
    });

    jest.spyOn(service.authService, "isAuthenticated$").mockReturnValue(of(true));

    actions.next({ type: AppActionTypes.LOAD_IMAGE_FAILURE, payload: { imageId: 1, error: null } });

    service.canActivate(route, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(false);
      done();
    });
  });

  it("should not pass if user is not the owner of the image", done => {
    const user = UserGenerator.user();
    user.id = 99;

    const image = ImageGenerator.image();
    image.user = 100;

    store.setState({
      ...initialState,
      ...{
        auth: {
          ...initialState.auth,
          ...{
            user
          }
        },
        app: {
          ...initialState.app,
          ...{
            images: [image]
          }
        }
      }
    });

    route = MockService(ActivatedRouteSnapshot, {
      params: { imageId: 1 }
    });

    jest.spyOn(service.authService, "isAuthenticated$").mockReturnValue(of(true));
    jest.spyOn(service.imageApiService, "getImage").mockReturnValue(of(image));

    service.canActivate(route, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(false);
      done();
    });
  });

  it("should pass if user is the owner of the image", done => {
    const user = UserGenerator.user();
    user.id = 99;

    const image = ImageGenerator.image();
    image.user = 99;

    store.setState({
      ...initialState,
      ...{
        auth: {
          ...initialState.auth,
          ...{
            user
          }
        },
        app: {
          ...initialState.app,
          ...{
            images: [image]
          }
        }
      }
    });

    route = MockService(ActivatedRouteSnapshot, {
      params: { imageId: 1 }
    });

    jest.spyOn(service.authService, "isAuthenticated$").mockReturnValue(of(true));
    jest.spyOn(service.imageApiService, "getImage").mockReturnValue(of(image));

    service.canActivate(route, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(true);
      done();
    });
  });

  it("should pass if user is a super user", done => {
    const user = UserGenerator.user();
    user.id = 99;

    const superUser = UserGenerator.user();
    superUser.id = 100;
    superUser.isSuperUser = true;

    const image = ImageGenerator.image();
    image.user = 99;

    store.setState({
      ...initialState,
      ...{
        auth: {
          ...initialState.auth,
          ...{
            user
          }
        },
        app: {
          ...initialState.app,
          ...{
            images: [image],
            users: [user, superUser]
          }
        }
      }
    });

    route = MockService(ActivatedRouteSnapshot, {
      params: { imageId: 1 }
    });

    jest.spyOn(service.authService, "isAuthenticated$").mockReturnValue(of(true));
    jest.spyOn(service.imageApiService, "getImage").mockReturnValue(of(image));

    service.canActivate(route, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(true);
      done();
    });
  });
});
