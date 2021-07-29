import { TestBed } from "@angular/core/testing";

import { EquipmentApiService } from "./equipment-api.service";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";

describe("EquipmentApiService", () => {
  let service: EquipmentApiService;

  beforeEach(async () => {
    await MockBuilder(EquipmentApiService, AppModule);
    service = TestBed.inject(EquipmentApiService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
