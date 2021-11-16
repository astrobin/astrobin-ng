import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { AccessoryGenerator } from "@shared/generators/accessory.generator";
import { AccessoryApiService } from "@shared/services/api/classic/gear/accessory/accessory-api.service";
import { MockBuilder } from "ng-mocks";

describe("accessoryApiService", () => {
  let service: AccessoryApiService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await MockBuilder(AccessoryApiService, AppModule).replace(HttpClientModule, HttpClientTestingModule);

    service = TestBed.inject(AccessoryApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("getaccessory should work", () => {
    const accessory = AccessoryGenerator.accessory();

    service.get(accessory.pk).subscribe(response => {
      expect(response.pk).toEqual(accessory.pk);
    });

    const req = httpMock.expectOne(`${service.configUrl}/${accessory.pk}/`);
    expect(req.request.method).toBe("GET");
    req.flush(accessory);
  });
});
