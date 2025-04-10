import { BrandGenerator } from "@features/equipment/generators/brand.generator";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import type { SoftwareInterface } from "@features/equipment/types/software.interface";

export class SoftwareGenerator {
  static software(source: Partial<SoftwareInterface> = {}): SoftwareInterface {
    const generatedBrand = BrandGenerator.brand();

    return {
      id: source.id || 1,
      created: source.created || "1970-01-01",
      updated: source.updated || "1970-01-01",
      lastAddedOrRemovedFromImage: source.updated || "1970-01-01",
      klass: EquipmentItemType.SOFTWARE,
      createdBy: source.createdBy || 1,
      assignee: source.assignee || null,
      brand: source.brand || generatedBrand.id,
      brandName: source.brandName || generatedBrand.name,
      name: source.name || "Test software",
      website: source.website || "https://www.test-software.com",
      image: source.image || "https://cdn.astrobin.com/images/foo.jpg",
      communityNotes: null,
      frozenAsAmbiguous: null,
      userCount: null,
      imageCount: null,
      variantOf: null,
      variants: [],
      forum: null,
      listings: {
        itemListings: [],
        brandListings: [],
        allowFullRetailerIntegration: false
      },
      followed: false,
      contentType: 5
    };
  }
}
