import { TestBed } from "@angular/core/testing";
import { ActivatedRouteSnapshot, convertToParamMap, Router, UrlTree } from "@angular/router";
import { UsernameMatchGuard } from "./username-match-guard"; // Update with actual path
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module"; // Update with actual path
import { Store } from "@ngrx/store";
import { of } from "rxjs";
import { RouterService } from "@shared/services/router.service"; // Update with actual path

describe("UsernameMatchGuard", () => {
  let guard: UsernameMatchGuard;
  let store: Store;
  let router: Router;
  let routerService: RouterService;

  beforeEach(() => {
    return MockBuilder(UsernameMatchGuard, AppModule)
      .mock(Router)
      .mock(Store)
      .mock(RouterService);
  });

  beforeEach(() => {
    guard = TestBed.inject(UsernameMatchGuard);
    store = TestBed.inject(Store);
    router = TestBed.inject(Router);
    routerService = TestBed.inject(RouterService);
  });

  it("should be created", () => {
    expect(guard).toBeTruthy();
  });

  it("should redirect if current user is null", () => {
    const mockSnapshot = { paramMap: convertToParamMap({ username: "user1" }) } as ActivatedRouteSnapshot;
    jest.spyOn(store, "pipe").mockReturnValue(of(null)); // Mocking store to return null
    const urlTreeMock = {} as UrlTree;
    jest.spyOn(router, "createUrlTree").mockReturnValue(urlTreeMock);

    guard.canActivate(mockSnapshot, null).subscribe(result => {
      expect(result).toEqual(urlTreeMock);
    });
  });

  it("should allow access if usernames match", () => {
    const currentUser = { username: "user1" };
    const mockSnapshot = { paramMap: convertToParamMap({ username: "user1" }) } as ActivatedRouteSnapshot;
    jest.spyOn(store, "pipe").mockReturnValue(of(currentUser));

    guard.canActivate(mockSnapshot, null).subscribe(result => {
      expect(routerService.getLoginUrlTree).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  it("should redirect if usernames do not match", () => {
    const currentUser = { username: "user1" };
    const mockSnapshot = { paramMap: convertToParamMap({ username: "user2" }) } as ActivatedRouteSnapshot;
    jest.spyOn(store, "pipe").mockReturnValue(of(currentUser));
    const urlTreeMock = {} as UrlTree;
    jest.spyOn(router, "createUrlTree").mockReturnValue(urlTreeMock);

    guard.canActivate(mockSnapshot, null).subscribe(result => {
      expect(routerService.getPermissionDeniedUrlTree).toHaveBeenCalled();
      expect(result).toEqual(urlTreeMock);
    });
  });
});
