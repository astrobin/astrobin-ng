import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { LocationApiService } from "@core/services/api/classic/astrobin/location/location-api.service";
import { LocationGenerator } from "@shared/generators/location.generator";
import { MockBuilder } from "ng-mocks";

describe("LocationApiService", () => {
  let service: LocationApiService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await MockBuilder(LocationApiService, AppModule).replace(HttpClientModule, HttpClientTestingModule);

    service = TestBed.inject(LocationApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("create should work", () => {
    const location = LocationGenerator.location();

    service.create(location).subscribe(response => {
      expect(response).toEqual(location);
    });

    const req = httpMock.expectOne(`${service.configUrl}/`);
    expect(req.request.method).toBe("POST");
    req.flush(location);
  });
});
