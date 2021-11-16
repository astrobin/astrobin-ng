import { TestBed } from "@angular/core/testing";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { AccessoryService } from "@features/equipment/services/accessory.service";

describe("AccessoryService", () => {
  let service: AccessoryService;

  beforeEach(async () => {
    await MockBuilder(AccessoryService, AppModule);
    service = TestBed.inject(AccessoryService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
