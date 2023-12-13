import { TestBed } from "@angular/core/testing";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { EquipmentMarketplaceService } from "@features/equipment/services/equipment-marketplace.service";

describe("EquipmentMarketplaceService", () => {
  let service: EquipmentMarketplaceService;

  beforeEach(async () => {
    await MockBuilder(EquipmentMarketplaceService, AppModule);
    service = TestBed.inject(EquipmentMarketplaceService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
