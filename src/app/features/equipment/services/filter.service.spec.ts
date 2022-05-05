import { TestBed } from "@angular/core/testing";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { FilterDisplayProperty, FilterService } from "@features/equipment/services/filter.service";
import { FilterGenerator } from "@features/equipment/generators/filter.generator";
import { FilterSize, FilterType } from "@features/equipment/types/filter.interface";

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
    it("should work for 'type'", () => {
      const filter = FilterGenerator.filter({ type: FilterType.L });
      service.getPrintableProperty$(filter, FilterDisplayProperty.TYPE).subscribe(value => {
        expect(value).toEqual("Luminance/clear (L)");
      });
    });

    it("should work for 'bandwidth'", () => {
      const filter = FilterGenerator.filter({ bandwidth: 3 });
      service.getPrintableProperty$(filter, FilterDisplayProperty.BANDWIDTH).subscribe(value => {
        expect(value).toEqual("3 nm");
      });
    });

    it("should work for 'size'", () => {
      const filter = FilterGenerator.filter({ size: FilterSize.ROUND_1_25_IN });
      service.getPrintableProperty$(filter, FilterDisplayProperty.SIZE).subscribe(value => {
        expect(value).toEqual(`Round 1.25"`);
      });
    });
  });
});
