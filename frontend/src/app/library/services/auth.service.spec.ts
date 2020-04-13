import { TestBed } from "@angular/core/testing";
import { AuthService } from "./auth.service";
import { of } from "rxjs";
import { AuthClassicApiService } from "./api/classic/auth/auth-classic-api.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
    ],
    providers: [
      AuthService,
      AuthClassicApiService,
    ],
  }));

  beforeEach(() => {
    service = TestBed.get(AuthService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("login/logout", () => {
    beforeEach(() => {
      jest.spyOn(service.authClassicApi, "login").mockReturnValue(of("123"));
    });

    it("should work with classic api", () => {
      service.login("foo", "bar").subscribe(result => {
        expect(result).toEqual(true);
        expect(service.isAuthenticated()).toBe(true);
        expect(AuthService.getClassicApiToken()).toBe("123");

        service.logout();

        expect(service.isAuthenticated()).toBe(false);
        expect(AuthService.getClassicApiToken()).toBe(null);
      });
    });
  });
});
