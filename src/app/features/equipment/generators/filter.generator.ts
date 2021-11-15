import { BrandGenerator } from "@features/equipment/generators/brand.generator";
import { FilterInterface, FilterType } from "@features/equipment/types/filter.interface";

export class FilterGenerator {
  static filter(source: Partial<FilterInterface> = {}): FilterInterface {
    return {
      id: source.id || 1,
      created: source.created || "1970-01-01",
      updated: source.updated || "1970-01-01",
      createdBy: source.createdBy || 1,
      brand: source.brand || BrandGenerator.brand().id,
      name: source.name || "Test filter",
      image: source.image || "https://cdn.astrobin.com/images/foo.jpg",
      type: source.type || FilterType.L,
      bandwidth: source.bandwidth || 12,
      size: source.size || 31.8
    };
  }
}
