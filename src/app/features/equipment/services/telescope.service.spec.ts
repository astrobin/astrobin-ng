import { TestBed } from "@angular/core/testing";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { TelescopeDisplayProperty, TelescopeService } from "@features/equipment/services/telescope.service";
import { TelescopeGenerator } from "@features/equipment/generators/telescope.generator";
import { TelescopeType } from "@features/equipment/interfaces/telescope.interface";

describe("TelescopeService", () => {
  let service: TelescopeService;

  beforeEach(async () => {
    await MockBuilder(TelescopeService, AppModule);
    service = TestBed.inject(TelescopeService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("getPrintableProperty", () => {
    it("should work for 'type'", () => {
      const telescope = TelescopeGenerator.telescope({ type: TelescopeType.REFRACTOR_ACHROMATIC });
      expect(service.getPrintableProperty(telescope, TelescopeDisplayProperty.TYPE)).toEqual(
        TelescopeType.REFRACTOR_ACHROMATIC
      );
    });

    it("should work for 'aperture'", () => {
      let telescope = TelescopeGenerator.telescope({ minAperture: 50, maxAperture: 200 });
      expect(service.getPrintableProperty(telescope, TelescopeDisplayProperty.APERTURE)).toEqual("50 - 200 mm");

      telescope = TelescopeGenerator.telescope({ minAperture: 50, maxAperture: 50 });
      expect(service.getPrintableProperty(telescope, TelescopeDisplayProperty.APERTURE)).toEqual("50 mm");
    });

    it("should work for 'focalLength'", () => {
      let telescope = TelescopeGenerator.telescope({ minFocalLength: 50, maxFocalLength: 200 });
      expect(service.getPrintableProperty(telescope, TelescopeDisplayProperty.FOCAL_LENGTH)).toEqual("50 - 200 mm");

      telescope = TelescopeGenerator.telescope({ minFocalLength: 50, maxFocalLength: 50 });
      expect(service.getPrintableProperty(telescope, TelescopeDisplayProperty.FOCAL_LENGTH)).toEqual("50 mm");
    });

    it("should work for 'weight'", () => {
      const telescope = TelescopeGenerator.telescope({ weight: 50 });
      expect(service.getPrintableProperty(telescope, TelescopeDisplayProperty.WEIGHT)).toEqual("50 kg");
    });
  });
});
