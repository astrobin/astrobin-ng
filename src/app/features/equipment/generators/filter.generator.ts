import { BrandGenerator } from "@features/equipment/generators/brand.generator";
import { FilterInterface, FilterType } from "@features/equipment/types/filter.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";

export class FilterGenerator {
  static filter(source: Partial<FilterInterface> = {}): FilterInterface {
    return {
      id: source.id || 1,
      created: source.created || "1970-01-01",
      updated: source.updated || "1970-01-01",
      klass: EquipmentItemType.FILTER,
      createdBy: source.createdBy || 1,
      brand: source.brand || BrandGenerator.brand().id,
      name: source.name || "Test filter",
      website: source.website || "https://www.test-filter.com",
      image: source.image || "https://cdn.astrobin.com/images/foo.jpg",
      type: source.type || FilterType.L,
      bandwidth: source.bandwidth || 12,
      userCount: null,
      imageCount: null
    };
  }
}
