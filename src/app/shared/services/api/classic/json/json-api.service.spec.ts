import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { JsonApiService } from "./json-api.service";

describe("JsonApiService", () => {
  let service: JsonApiService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await MockBuilder(JsonApiService, AppModule).replace(HttpClientModule, HttpClientTestingModule);

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

  describe("toggleUseHighContrastThemeCookie", () => {
    it("should work", () => {
      service.toggleUseHighContrastThemeCookie().subscribe(response => {
        expect(response).toEqual(void 0);
      });

      const req = httpMock.expectOne(`${service.configUrl}/user/toggle-use-high-contrast-cookie/`);
      expect(req.request.method).toBe("POST");
      req.flush(void 0);
    });
  });
});
