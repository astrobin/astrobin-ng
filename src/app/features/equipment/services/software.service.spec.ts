import { TestBed } from "@angular/core/testing";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { SoftwareService } from "@features/equipment/services/software.service";

describe("SoftwareService", () => {
  let service: SoftwareService;

  beforeEach(async () => {
    await MockBuilder(SoftwareService, AppModule);
    service = TestBed.inject(SoftwareService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
