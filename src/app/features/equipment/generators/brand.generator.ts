import { BrandInterface } from "@features/equipment/types/brand.interface";

export class BrandGenerator {
  static brand(): BrandInterface {
    return {
      id: 1,
      created: "1970-01-01",
      updated: "1970-01-01",
      lastAddedOrRemovedFromImage: "1970-01-01",
      name: "Test brand",
      userCount: 0,
      imageCount: 0
    };
  }
}
