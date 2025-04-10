import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { FilterGenerator } from "@features/equipment/generators/filter.generator";
import { FilterDisplayProperty, FilterService } from "@features/equipment/services/filter.service";
import { FilterSize, FilterType } from "@features/equipment/types/filter.interface";
import { MockBuilder } from "ng-mocks";

describe("FilterService", () => {
  let service: FilterService;

  beforeEach(async () => {
    await MockBuilder(FilterService, AppModule);
    service = TestBed.inject(FilterService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("getPrintableProperty", () => {
    it("should work for 'type'", done => {
      const filter = FilterGenerator.filter({ type: FilterType.L });
      service.getPrintableProperty$(filter, FilterDisplayProperty.TYPE).subscribe(value => {
        expect(value).toEqual("Luminance/clear (L)");
        done();
      });
    });

    it("should work for 'bandwidth'", done => {
      const filter = FilterGenerator.filter({ bandwidth: 3 });
      service.getPrintableProperty$(filter, FilterDisplayProperty.BANDWIDTH).subscribe(value => {
        expect(value).toEqual("3 nm");
        done();
      });
    });

    it("should work for 'size'", done => {
      const filter = FilterGenerator.filter({ size: FilterSize.ROUND_1_25_IN });
      service.getPrintableProperty$(filter, FilterDisplayProperty.SIZE).subscribe(value => {
        expect(value).toEqual(`Round 1.25"`);
        done();
      });
    });
  });
});
