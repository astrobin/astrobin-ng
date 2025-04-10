import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { TelescopeGenerator } from "@features/equipment/generators/telescope.generator";
import { TelescopeDisplayProperty, TelescopeService } from "@features/equipment/services/telescope.service";
import { TelescopeType } from "@features/equipment/types/telescope.interface";
import { MockBuilder } from "ng-mocks";

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
    it("should work for 'type'", done => {
      const telescope = TelescopeGenerator.telescope({ type: TelescopeType.REFRACTOR_ACHROMATIC });
      service.getPrintableProperty$(telescope, TelescopeDisplayProperty.TYPE).subscribe(value => {
        expect(value).toEqual("Refractor: achromatic");
        done();
      });
    });

    it("should work for 'aperture'", done => {
      const telescope = TelescopeGenerator.telescope({ aperture: 50 });
      service.getPrintableProperty$(telescope, TelescopeDisplayProperty.APERTURE).subscribe(value => {
        expect(value).toEqual("50 mm");
        done();
      });
    });

    it("should work for 'focalLength'", done => {
      const telescope = TelescopeGenerator.telescope({ minFocalLength: 50, maxFocalLength: 200 });
      service.getPrintableProperty$(telescope, TelescopeDisplayProperty.FOCAL_LENGTH).subscribe(value => {
        expect(value).toEqual("50 - 200 mm");
        done();
      });
    });

    it("should work for variable 'focalLength'", done => {
      const telescope = TelescopeGenerator.telescope({ minFocalLength: 50, maxFocalLength: 50 });
      service.getPrintableProperty$(telescope, TelescopeDisplayProperty.FOCAL_LENGTH).subscribe(value => {
        expect(value).toEqual("50 mm");
        done();
      });
    });

    it("should work for 'weight'", done => {
      const telescope = TelescopeGenerator.telescope({ weight: 50 });
      service.getPrintableProperty$(telescope, TelescopeDisplayProperty.WEIGHT).subscribe(value => {
        expect(value).toEqual("50 kg");
        done();
      });
    });
  });
});
