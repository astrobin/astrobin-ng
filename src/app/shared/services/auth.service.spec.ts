import { fakeAsync, flush, TestBed } from "@angular/core/testing";
import { testAppImports } from "@app/test-app.imports";
import { WindowRefService } from "@shared/services/window-ref.service";
import { TimeagoIntl } from "ngx-timeago";
import { of } from "rxjs";
import { AuthClassicApiService } from "./api/classic/auth/auth-classic-api.service";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [testAppImports],
      providers: [AuthService, AuthClassicApiService, TimeagoIntl, WindowRefService]
    })
  );

  beforeEach(() => {
    service = TestBed.inject(AuthService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("account/logout", () => {
    beforeEach(() => {
      jest.spyOn(service.authClassicApi, "login").mockReturnValue(of("123"));
    });

    it("should work with classic api", fakeAsync(done => {
      service.login("foo", "bar").subscribe(result => {
        expect(result).toEqual(true);
        expect(service.getClassicApiToken()).toBe("123");

        flush();

        service.logout();

        expect(service.getClassicApiToken()).toBe(null);

        done();
      });
    }));
  });
});
