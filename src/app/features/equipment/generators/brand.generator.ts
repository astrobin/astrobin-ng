import { BrandInterface } from "@features/equipment/interfaces/brand.interface";

export class BrandGenerator {
  static brand(): BrandInterface {
    return {
      id: 1,
      created: "1970-01-01",
      updated: "1970-01-01",
      name: "Test brand"
    };
  }
}
