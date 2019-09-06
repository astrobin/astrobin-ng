import { TestBed } from "@angular/core/testing";
import { AuthNgApiService } from "./auth-ng-api.service";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";

describe("AuthNgApiService", () => {
  let service: AuthNgApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
    ],
  }));

  beforeEach(() => {
    service = TestBed.get(AuthNgApiService);
    httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("login", () => {
    it("should get a token", () => {
      const mockToken = "123";
      service.login("foo", "bar").subscribe(token => {
        expect(token).toEqual(mockToken);
      });

      const req = httpMock.expectOne(`${service.configUrl}/api-auth-token/`);
      expect(req.request.method).toBe("POST");
      req.flush({ token: mockToken });
    });
  });
});
