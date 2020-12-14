import { HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { testAppImports } from "@app/test-app.imports";
import { JsonApiService } from "./json-api.service";

describe("CommonApiService", () => {
  let service: JsonApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [testAppImports],
      providers: [JsonApiService]
    });

    service = TestBed.inject(JsonApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("getBackendConfig", () => {
    it("should work", () => {
      service.getBackendConfig().subscribe(response => {
        expect(response.readOnly).toEqual(false);
      });

      const req = httpMock.expectOne(`${service.configUrl}/common/app-config/`);
      expect(req.request.method).toBe("GET");
      req.flush({ readOnly: false });
    });
  });
});
