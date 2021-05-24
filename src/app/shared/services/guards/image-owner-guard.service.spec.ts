import { TestBed } from "@angular/core/testing";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { AppModule } from "@app/app.module";
import { State } from "@app/store/state";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { MockBuilder, MockInstance, MockReset, ngMocks } from "ng-mocks";
import { of, ReplaySubject } from "rxjs";
import { ImageGenerator } from "../../generators/image.generator";
import { UserGenerator } from "../../generators/user.generator";
import { ImageOwnerGuardService } from "./image-owner-guard.service";
import { provideMockActions } from "@ngrx/effects/testing";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { StateGenerator } from "@app/store/generators/state.generator";

describe("ImageOwnerGuardService", () => {
  let service: ImageOwnerGuardService;
  let route: ActivatedRouteSnapshot;
  let store: MockStore;
  const actions: ReplaySubject<any> = new ReplaySubject<any>();

  const initialState: State = StateGenerator.default();

  beforeEach(async () => {
    MockInstance(ActivatedRouteSnapshot, instance => {
      ngMocks.stub(instance, "params", "get");
    });

    await MockBuilder(ImageOwnerGuardService, AppModule)
      .mock(ActivatedRouteSnapshot)
      .provide([provideMockStore({ initialState }), provideMockActions(() => actions)]);

    store = TestBed.inject(MockStore);
    service = TestBed.inject(ImageOwnerGuardService);

    jest.spyOn(service.router, "navigateByUrl").mockImplementation(
      () => new Promise<boolean>(resolve => resolve(true))
    );
  });

  afterEach(MockReset);

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should not pass if user is not logged in", done => {
    jest.spyOn(service.authService, "isAuthenticated").mockReturnValue(of(false));

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

    route = TestBed.inject(ActivatedRouteSnapshot);
    jest.spyOn(route, "params", "get").mockReturnValue({ imageId: 1 });
    jest.spyOn(service.authService, "isAuthenticated").mockReturnValue(of(true));

    actions.next({ type: AppActionTypes.LOAD_IMAGE_FAILURE });

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

    route = TestBed.inject(ActivatedRouteSnapshot);
    jest.spyOn(route, "params", "get").mockReturnValue({ imageId: 1 });
    jest.spyOn(service.authService, "isAuthenticated").mockReturnValue(of(true));
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

    route = TestBed.inject(ActivatedRouteSnapshot);
    jest.spyOn(route, "params", "get").mockReturnValue({ imageId: 1 });
    jest.spyOn(service.authService, "isAuthenticated").mockReturnValue(of(true));
    jest.spyOn(service.imageApiService, "getImage").mockReturnValue(of(image));

    service.canActivate(route, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(true);
      done();
    });
  });
});
