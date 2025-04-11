import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { AccessoryGenerator } from "@features/equipment/generators/accessory.generator";
import { AccessoryDisplayProperty, AccessoryService } from "@features/equipment/services/accessory.service";
import { AccessoryType } from "@features/equipment/types/accessory.interface";
import { MockBuilder } from "ng-mocks";

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
