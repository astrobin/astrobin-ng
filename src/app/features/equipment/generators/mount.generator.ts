import { BrandGenerator } from "@features/equipment/generators/brand.generator";
import { MountInterface, MountType } from "@features/equipment/types/mount.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";

export class MountGenerator {
  static mount(source: Partial<MountInterface> = {}): MountInterface {
    return {
      id: source.id || 1,
      created: source.created || "1970-01-01",
      updated: source.updated || "1970-01-01",
      klass: EquipmentItemType.MOUNT,
      createdBy: source.createdBy || 1,
      brand: source.brand || BrandGenerator.brand().id,
      name: source.name || "Test mount",
      website: source.website || "https://www.test-mount.com",
      image: source.image || "https://cdn.astrobin.com/images/foo.jpg",
      type: source.type || MountType.GERMAN_EQUATORIAL,
      trackingAccuracy: source.trackingAccuracy || 1,
      pec: source.pec !== null && source.pec !== undefined ? source.pec : true,
      weight: source.weight || 50,
      maxPayload: source.maxPayload || 450,
      computerized: source.computerized !== null && source.computerized !== undefined ? source.pec : true,
      slewSpeed: source.slewSpeed || 2
    };
  }
}
