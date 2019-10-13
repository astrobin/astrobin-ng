import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { AuthInterceptor } from "@lib/services/auth.interceptor";
import { AuthService } from "@lib/services/auth.service";
import { AuthLegacyApiService } from "@lib/services/api/legacy/auth-legacy-api.service";
import { AuthNgApiService } from "@lib/services/api/ng/auth-ng-api.service";

describe(`AuthHttpInterceptor`, () => {
  let authService: AuthService;
  let authLegacyApi: AuthLegacyApiService;
  let authNgApi: AuthNgApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        AuthLegacyApiService,
        AuthNgApiService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true,
        },
      ],
    });

    authService = TestBed.get(AuthService);
    authLegacyApi = TestBed.get(AuthLegacyApiService);
    authNgApi = TestBed.get(AuthNgApiService);
    httpMock = TestBed.get(HttpTestingController);

    spyOn(AuthService, "getLegacyApiToken").and.returnValue("legacy-auth-token");
    spyOn(AuthService, "getNgApiToken").and.returnValue("ng-auth-token");
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should add an Authorization header", () => {
    authService.login("handle", "password").subscribe(response => {
      expect(response).toBeTruthy();
    });

    const legacyApiHttpRequest = httpMock.expectOne(`${authLegacyApi.configUrl}/api-auth-token/`);
    const ngApiHttpRequest = httpMock.expectOne(`${authNgApi.configUrl}/auth/login/`);

    expect(legacyApiHttpRequest.request.headers.has("Authorization")).toEqual(true);
    expect(ngApiHttpRequest.request.headers.has("Authorization")).toEqual(true);
  });
});
