import { TestBed } from "@angular/core/testing";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { AppModule } from "@app/app.module";
import { MockBuilder, MockInstance, MockReset, ngMocks } from "ng-mocks";
import { of, throwError } from "rxjs";
import { AppContextGenerator } from "../../generators/app-context.generator";
import { ImageGenerator } from "../../generators/image.generator";
import { UserGenerator } from "../../generators/user.generator";
import { ImageOwnerGuardService } from "./image-owner-guard.service";

describe("ImageOwnerGuardService", () => {
  let service: ImageOwnerGuardService;
  let route: ActivatedRouteSnapshot;

  beforeEach(() =>
    MockInstance(ActivatedRouteSnapshot, instance => {
      ngMocks.stub(instance, "params", "get");
    })
  );

  afterEach(MockReset);

  beforeEach(async () => {
    await MockBuilder(ImageOwnerGuardService, AppModule).mock(ActivatedRouteSnapshot);
    service = TestBed.inject(ImageOwnerGuardService);
    jest.spyOn(service.router, "navigateByUrl").mockImplementation(
      () => new Promise<boolean>(resolve => resolve())
    );
  });

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
    const error = {
      status: 404,
      message: "Not found"
    };

    jest.spyOn(service.authService, "isAuthenticated").mockReturnValue(of(true));
    jest.spyOn(service.imageApiService, "getImage").mockReturnValue(throwError(error));

    service.canActivate(null, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(false);
      done();
    });
  });

  it("should not pass if user is not the owner of the image", done => {
    const user = UserGenerator.user();
    user.id = 99;

    const image = ImageGenerator.image();
    image.user = 100;

    const context = AppContextGenerator.default();
    context.currentUser = user;

    service.appContextService.context$ = of(context);
    route = TestBed.inject(ActivatedRouteSnapshot);
    jest.spyOn(route, "params", "get").mockReturnValue({ imageId: 1 });
    jest.spyOn(service.authService, "isAuthenticated").mockReturnValue(of(true));
    jest.spyOn(service.imageApiService, "getImage").mockReturnValue(of(image));

    service.canActivate(route, { url: "/foo" } as RouterStateSnapshot).subscribe(result => {
      expect(result).toBe(false);
      done();
    });
  });

  it("should pass if user is not the owner of the image", done => {
    const user = UserGenerator.user();
    user.id = 99;

    const image = ImageGenerator.image();
    image.user = 99;

    const context = AppContextGenerator.default();
    context.currentUser = user;

    service.appContextService.context$ = of(context);
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
