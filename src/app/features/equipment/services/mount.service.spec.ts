import { TestBed } from "@angular/core/testing";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { MountDisplayProperty, MountService } from "@features/equipment/services/mount.service";
import { MountGenerator } from "@features/equipment/generators/mount.generator";
import { MountType } from "@features/equipment/types/mount.interface";

describe("MountService", () => {
  let service: MountService;

  beforeEach(async () => {
    await MockBuilder(MountService, AppModule);
    service = TestBed.inject(MountService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("getPrintableProperty", () => {
    it("should work for 'type'", () => {
      const mount = MountGenerator.mount({ type: MountType.EQUATORIAL });
      service.getPrintableProperty$(mount, MountDisplayProperty.TYPE).subscribe(value => {
        expect(value).toEqual("Equatorial");
      });
    });

    it("should work for 'trackingAccuracy'", () => {
      const mount = MountGenerator.mount({ trackingAccuracy: 3 });
      service.getPrintableProperty$(mount, MountDisplayProperty.TRACKING_ACCURACY).subscribe(value => {
        expect(value).toEqual("3 arcsec");
      });
    });

    it("should work for 'pec'", () => {
      const mount = MountGenerator.mount({ pec: false });
      service.getPrintableProperty$(mount, MountDisplayProperty.PEC).subscribe(value => {
        expect(value).toEqual("No");
      });
    });

    it("should work for 'maxPayload'", () => {
      const mount = MountGenerator.mount({ maxPayload: 100 });
      service.getPrintableProperty$(mount, MountDisplayProperty.MAX_PAYLOAD).subscribe(value => {
        expect(value).toEqual("100 kg");
      });
    });

    it("should work for 'computerized'", () => {
      const mount = MountGenerator.mount({ computerized: false });
      service.getPrintableProperty$(mount, MountDisplayProperty.COMPUTERIZED).subscribe(value => {
        expect(value).toEqual("No");
      });
    });

    it("should work for 'slewSpeed'", () => {
      const mount = MountGenerator.mount({ slewSpeed: 5 });
      service.getPrintableProperty$(mount, MountDisplayProperty.MAX_PAYLOAD).subscribe(value => {
        expect(value).toEqual("5 deg/sec");
      });
    });
  });
});
