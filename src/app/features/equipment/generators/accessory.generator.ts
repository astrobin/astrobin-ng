import { BrandGenerator } from "@features/equipment/generators/brand.generator";
import { AccessoryInterface } from "@features/equipment/types/accessory.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";

export class AccessoryGenerator {
  static accessory(source: Partial<AccessoryInterface> = {}): AccessoryInterface {
    return {
      id: source.id || 1,
      created: source.created || "1970-01-01",
      updated: source.updated || "1970-01-01",
      klass: EquipmentItemType.ACCESSORY,
      createdBy: source.createdBy || 1,
      brand: source.brand || BrandGenerator.brand().id,
      name: source.name || "Test accessory",
      image: source.image || "https://cdn.astrobin.com/images/foo.jpg"
    };
  }
}
