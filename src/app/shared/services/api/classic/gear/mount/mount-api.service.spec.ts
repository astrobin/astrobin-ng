import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { MountGenerator } from "@shared/generators/mount.generator";
import { MountApiService } from "@shared/services/api/classic/gear/mount/mount-api.service";
import { MockBuilder } from "ng-mocks";

describe("mountApiService", () => {
  let service: MountApiService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await MockBuilder(MountApiService, AppModule).replace(HttpClientModule, HttpClientTestingModule);

    service = TestBed.inject(MountApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("getmount should work", () => {
    const mount = MountGenerator.mount();

    service.get(mount.pk).subscribe(response => {
      expect(response.pk).toEqual(mount.pk);
    });

    const req = httpMock.expectOne(`${service.configUrl}/${mount.pk}/`);
    expect(req.request.method).toBe("GET");
    req.flush(mount);
  });
});
