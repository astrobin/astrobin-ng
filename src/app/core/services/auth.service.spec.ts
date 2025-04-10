import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { AppModule } from "@app/app.module";
import { AuthClassicApiService } from "@core/services/api/classic/auth/auth-classic-api.service";
import { MockBuilder, MockInstance, MockReset } from "ng-mocks";
import { CookieService } from "ngx-cookie";
import { of } from "rxjs";

import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(() =>
    MockInstance(CookieService, instance => {
      let value = "123";

      instance.get = key => (key === AuthService.CLASSIC_AUTH_TOKEN_COOKIE ? value : null);
      instance.remove = key => {
        if (key === AuthService.CLASSIC_AUTH_TOKEN_COOKIE) {
          value = null;
        }
      };
    })
  );

  afterEach(MockReset);

  beforeEach(() =>
    MockBuilder(AuthService, AppModule)
      .mock(AuthClassicApiService, {
        login: jest.fn().mockReturnValue(of("123"))
      })
      .mock(Router, {
        navigate: jest.fn().mockReturnValue(Promise.resolve())
      })
  );

  beforeEach(() => {
    service = TestBed.inject(AuthService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("account/logout", () => {
    it("should work with classic api", done => {
      jest.spyOn(service.authClassicApi, "login").mockReturnValue(of("123"));

      service.login("foo", "bar").subscribe(result => {
        expect(result).toEqual("123");
        expect(service.getClassicApiToken()).toBe("123");

        jest.spyOn(service.router, "navigate").mockReturnValue(Promise.resolve(true));
        jest.spyOn(service.windowRefService, "getCurrentUrl").mockReturnValue(new URL("http://localhost:4200"));
        jest.spyOn(service.windowRefService, "locationAssign").mockImplementation(() => {
          return;
        });

        service.logout().subscribe(() => {
          expect(service.getClassicApiToken()).toBe(null);
          done();
        });
      });
    });
  });
});
