import { BrandGenerator } from "@features/equipment/generators/brand.generator";
import { AccessoryInterface, AccessoryType } from "@features/equipment/types/accessory.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";

export class AccessoryGenerator {
  static accessory(source: Partial<AccessoryInterface> = {}): AccessoryInterface {
    const generatedBrand = BrandGenerator.brand();

    return {
      id: source.id || 1,
      created: source.created || "1970-01-01",
      updated: source.updated || "1970-01-01",
      lastAddedOrRemovedFromImage: source.updated || "1970-01-01",
      klass: EquipmentItemType.ACCESSORY,
      createdBy: source.createdBy || 1,
      assignee: source.assignee || null,
      brand: source.brand || generatedBrand.id,
      brandName: source.brandName || generatedBrand.name,
      name: source.name || "Test accessory",
      website: source.website || "https://www.test-accessory.com",
      image: source.image || "https://cdn.astrobin.com/images/foo.jpg",
      communityNotes: null,
      type: source.type || AccessoryType.OTHER,
      frozenAsAmbiguous: null,
      userCount: null,
      imageCount: null,
      variantOf: null,
      variants: []
    };
  }
}
