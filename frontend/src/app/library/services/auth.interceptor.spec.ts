import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { AuthInterceptor } from "@lib/services/auth.interceptor";
import { AuthService } from "@lib/services/auth.service";
import { AuthClassicApiService } from "@lib/services/api/classic/auth-classic-api.service";

describe(`AuthHttpInterceptor`, () => {
  let authService: AuthService;
  let authClassicApi: AuthClassicApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        AuthClassicApiService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true,
        },
      ],
    });

    authService = TestBed.get(AuthService);
    authClassicApi = TestBed.get(AuthClassicApiService);
    httpMock = TestBed.get(HttpTestingController);

    spyOn(AuthService, "getClassicApiToken").and.returnValue("classic-auth-token");
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should add an Authorization header", () => {
    authService.login("handle", "password").subscribe(response => {
      expect(response).toBeTruthy();
    });

    const classicApiHttpRequest = httpMock.expectOne(`${authClassicApi.configUrl}/api-auth-token/`);

    expect(classicApiHttpRequest.request.headers.has("Authorization")).toEqual(true);
  });
});
