import { TestBed } from "@angular/core/testing";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { AccessoryDisplayProperty, AccessoryService } from "@features/equipment/services/accessory.service";
import { AccessoryGenerator } from "@features/equipment/generators/accessory.generator";
import { AccessoryType } from "@features/equipment/types/accessory.interface";

describe("AccessoryService", () => {
  let service: AccessoryService;

  beforeEach(async () => {
    await MockBuilder(AccessoryService, AppModule);
    service = TestBed.inject(AccessoryService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should work for 'type'", done => {
    const item = AccessoryGenerator.accessory({ type: AccessoryType.COMPUTER });
    service.getPrintableProperty$(item, AccessoryDisplayProperty.TYPE).subscribe(value => {
      expect(value).toEqual(`Computer`);
      done();
    });
  });
});
