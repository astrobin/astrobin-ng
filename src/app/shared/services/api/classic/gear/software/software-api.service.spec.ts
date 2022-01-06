import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { SoftwareGenerator } from "@shared/generators/software.generator";
import { SoftwareApiService } from "@shared/services/api/classic/gear/software/software-api.service";
import { MockBuilder } from "ng-mocks";

describe("softwareApiService", () => {
  let service: SoftwareApiService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await MockBuilder(SoftwareApiService, AppModule).replace(HttpClientModule, HttpClientTestingModule);

    service = TestBed.inject(SoftwareApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("get should work", () => {
    const software = SoftwareGenerator.software();

    service.get(software.pk).subscribe(response => {
      expect(response.pk).toEqual(software.pk);
    });

    const req = httpMock.expectOne(`${service.configUrl}/${software.pk}/`);
    expect(req.request.method).toBe("GET");
    req.flush(software);
  });
});
