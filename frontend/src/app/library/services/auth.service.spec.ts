import { TestBed } from "@angular/core/testing";
import { AuthService } from "./auth.service";
import { AuthApiService } from "./api/interfacees/auth-api.service.interface";
import { of } from "rxjs";
import { AuthLegacyApiService } from "./api/legacy/auth-legacy-api.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { AuthNgApiService } from "./api/ng/auth-ng-api.service";

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
    ],
    providers: [
      AuthService,
      AuthLegacyApiService,
      AuthNgApiService,
    ],
  }));

  beforeEach(() => {
    service = TestBed.get(AuthService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("login/logout", () => {
    it("should work with legacy api", () => {
      spyOn(service.authLegacyApi, "login").and.returnValue(of("123"));

      service.login("foo", "bar").subscribe(result => {
        expect(result).toEqual(true);
        expect(service.isAuthenticated()).toBe(true);
        expect(AuthService.getToken()).toBe("123");

        service.logout();

        expect(service.isAuthenticated()).toBe(false);
        expect(AuthService.getToken()).toBe(null);
      });
    });

    it("should work with ng api", () => {
      spyOn(service.authNgApi, "login").and.returnValue(of("123"));

      service.login("foo", "bar").subscribe(result => {
        expect(result).toEqual(true);
        expect(service.isAuthenticated()).toBe(true);
        expect(AuthService.getToken()).toBe("123");

        service.logout();

        expect(service.isAuthenticated()).toBe(false);
        expect(AuthService.getToken()).toBe(null);
      });
    });
  });
});
