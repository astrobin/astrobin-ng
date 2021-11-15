import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { FilterGenerator } from "@shared/generators/filter.generator";
import { FilterApiService } from "@shared/services/api/classic/gear/filter/filter-api.service";
import { MockBuilder } from "ng-mocks";

describe("filterApiService", () => {
  let service: FilterApiService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await MockBuilder(FilterApiService, AppModule).replace(HttpClientModule, HttpClientTestingModule);

    service = TestBed.inject(FilterApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("getfilter should work", () => {
    const filter = FilterGenerator.filter();

    service.get(filter.pk).subscribe(response => {
      expect(response.pk).toEqual(filter.pk);
    });

    const req = httpMock.expectOne(`${service.configUrl}/${filter.pk}/`);
    expect(req.request.method).toBe("GET");
    req.flush(filter);
  });
});
