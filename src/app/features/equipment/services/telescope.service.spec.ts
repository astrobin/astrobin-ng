import { TestBed } from "@angular/core/testing";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { TelescopeDisplayProperty, TelescopeService } from "@features/equipment/services/telescope.service";
import { TelescopeGenerator } from "@features/equipment/generators/telescope.generator";
import { TelescopeType } from "@features/equipment/types/telescope.interface";

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
      service.getPrintableProperty$(telescope, TelescopeDisplayProperty.TYPE).subscribe(value => {
        expect(value).toEqual("Refractor: achromatic");
      });
    });

    it("should work for 'aperture'", () => {
      let telescope = TelescopeGenerator.telescope({ aperture: 50 });
      service.getPrintableProperty$(telescope, TelescopeDisplayProperty.APERTURE).subscribe(value => {
        expect(value).toEqual("50 mm");
      });
    });

    it("should work for 'focalLength'", () => {
      let telescope = TelescopeGenerator.telescope({ minFocalLength: 50, maxFocalLength: 200 });
      service.getPrintableProperty$(telescope, TelescopeDisplayProperty.FOCAL_LENGTH).subscribe(value => {
        expect(value).toEqual("50 - 200 mm");
      });

      telescope = TelescopeGenerator.telescope({ minFocalLength: 50, maxFocalLength: 50 });
      service.getPrintableProperty$(telescope, TelescopeDisplayProperty.FOCAL_LENGTH).subscribe(value => {
        expect(value).toEqual("50 mm");
      });
    });

    it("should work for 'weight'", () => {
      const telescope = TelescopeGenerator.telescope({ weight: 50 });
      service.getPrintableProperty$(telescope, TelescopeDisplayProperty.WEIGHT).subscribe(value => {
        expect(value).toEqual("50 kg");
      });
    });
  });
});
