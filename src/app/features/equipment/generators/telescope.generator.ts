import { BrandGenerator } from "@features/equipment/generators/brand.generator";
import { TelescopeInterface, TelescopeType } from "@features/equipment/types/telescope.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";

export class TelescopeGenerator {
  static telescope(source: Partial<TelescopeInterface> = {}): TelescopeInterface {
    return {
      id: source.id || 1,
      created: source.created || "1970-01-01",
      updated: source.updated || "1970-01-01",
      lastAddedOrRemovedFromImage: source.updated || "1970-01-01",
      klass: EquipmentItemType.TELESCOPE,
      createdBy: source.createdBy || 1,
      brand: source.brand || BrandGenerator.brand().id,
      name: source.name || "Test telescope",
      website: source.website || "https://www.test-telescope.com",
      image: source.image || "https://cdn.astrobin.com/images/foo.jpg",
      communityNotes: null,
      type: source.type || TelescopeType.REFRACTOR_ACHROMATIC,
      aperture: source.aperture || 90,
      minFocalLength: source.minFocalLength || 450,
      maxFocalLength: source.maxFocalLength || 450,
      weight: source.weight || 2,
      userCount: null,
      imageCount: null,
      variantOf: null,
      variants: []
    };
  }
}
