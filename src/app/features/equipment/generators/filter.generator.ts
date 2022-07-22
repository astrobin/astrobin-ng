import { BrandGenerator } from "@features/equipment/generators/brand.generator";
import { FilterInterface, FilterSize, FilterType } from "@features/equipment/types/filter.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";

export class FilterGenerator {
  static filter(source: Partial<FilterInterface> = {}): FilterInterface {
    const generatedBrand = BrandGenerator.brand();

    return {
      id: source.id || 1,
      created: source.created || "1970-01-01",
      updated: source.updated || "1970-01-01",
      lastAddedOrRemovedFromImage: source.updated || "1970-01-01",
      klass: EquipmentItemType.FILTER,
      createdBy: source.createdBy || 1,
      assignee: source.assignee || null,
      brand: source.brand || generatedBrand.id,
      brandName: source.brandName || generatedBrand.name,
      name: source.name || "Test filter",
      website: source.website || "https://www.test-filter.com",
      image: source.image || "https://cdn.astrobin.com/images/foo.jpg",
      communityNotes: null,
      type: source.type || FilterType.L,
      bandwidth: source.bandwidth || 12,
      size: source.size || FilterSize.ROUND_1_25_IN,
      userCount: null,
      imageCount: null,
      variantOf: null,
      variants: []
    };
  }
}
