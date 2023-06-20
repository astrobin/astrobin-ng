import { BrandGenerator } from "@features/equipment/generators/brand.generator";
import { TelescopeInterface, TelescopeType } from "@features/equipment/types/telescope.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";

export class TelescopeGenerator {
  static telescope(source: Partial<TelescopeInterface> = {}): TelescopeInterface {
    const generatedBrand = BrandGenerator.brand();

    return {
      id: source.id || 1,
      created: source.created || "1970-01-01",
      updated: source.updated || "1970-01-01",
      lastAddedOrRemovedFromImage: source.updated || "1970-01-01",
      klass: EquipmentItemType.TELESCOPE,
      createdBy: source.createdBy || 1,
      assignee: source.assignee || null,
      brand: source.brand || generatedBrand.id,
      brandName: source.brandName || generatedBrand.name,
      name: source.name || "Test telescope",
      website: source.website || "https://www.test-telescope.com",
      image: source.image || "https://cdn.astrobin.com/images/foo.jpg",
      communityNotes: null,
      type: source.type || TelescopeType.REFRACTOR_ACHROMATIC,
      aperture: source.aperture || 90,
      minFocalLength: source.minFocalLength || 450,
      maxFocalLength: source.maxFocalLength || 450,
      weight: source.weight || 2,
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
      contentType: 6
    };
  }
}
