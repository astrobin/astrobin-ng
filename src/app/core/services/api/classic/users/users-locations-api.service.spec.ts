import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { LocationInterface } from "@core/interfaces/location.interface";
import { UsersLocationsApiService } from "@core/services/api/classic/users/users-locations-api.service";
import { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import { LocationGenerator } from "@shared/generators/location.generator";
import { MockBuilder } from "ng-mocks";

describe("UsersLocationsApiService", () => {
  let service: UsersLocationsApiService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await MockBuilder(UsersLocationsApiService, AppModule).replace(HttpClientModule, HttpClientTestingModule);

    service = TestBed.inject(UsersLocationsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("getAll should work", () => {
    const location = LocationGenerator.location();
    const result: PaginatedApiResultInterface<LocationInterface> = {
      count: 1,
      results: [location],
      next: null,
      prev: null
    };

    service.getAll().subscribe(response => {
      expect(response).toEqual(result);
    });

    const req = httpMock.expectOne(`${service.configUrl}/`);
    expect(req.request.method).toBe("GET");
    req.flush(result);
  });
});
