import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { testAppImports } from "@app/test-app.imports";
import { AuthClassicApiService } from "@shared/services/api/classic/auth/auth-classic-api.service";
import { AuthInterceptor } from "@shared/services/auth.interceptor";
import { AuthService } from "@shared/services/auth.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { TimeagoIntl } from "ngx-timeago";

describe(`AuthHttpInterceptor`, () => {
  let authService: AuthService;
  let authClassicApi: AuthClassicApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [testAppImports],
      providers: [
        AuthService,
        AuthClassicApiService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true
        },
        TimeagoIntl,
        WindowRefService
      ]
    });

    authService = TestBed.inject(AuthService);
    authClassicApi = TestBed.inject(AuthClassicApiService);
    httpMock = TestBed.inject(HttpTestingController);

    spyOn(authService, "getClassicApiToken").and.returnValue("classic-auth-token");
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should add an Authorization header", () => {
    authService.login("handle", "password").subscribe(response => {
      expect(response).toBe(false);
    });

    const classicApiHttpRequest = httpMock.expectOne(`${authClassicApi.configUrl}/api-auth-token/`);
    expect(classicApiHttpRequest.request.headers.has("Authorization")).toEqual(true);
  });
});
