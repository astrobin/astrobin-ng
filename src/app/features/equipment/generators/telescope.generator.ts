import { BrandGenerator } from "@features/equipment/generators/brand.generator";
import { TelescopeInterface, TelescopeType } from "@features/equipment/interfaces/telescope.interface";

export class TelescopeGenerator {
  static telescope(): TelescopeInterface {
    return {
      id: 1,
      created: "1970-01-01",
      updated: "1970-01-01",
      createdBy: 1,
      brand: BrandGenerator.brand().id,
      name: "Test telescope",
      image: "https://cdn.astrobin.com/images/foo.jpg",
      type: TelescopeType.REFRACTORS_ACHROMATIC,
      minAperture: 90,
      maxAperture: 90,
      minFocalLength: 450,
      maxFocalLength: 450,
      weight: 2
    };
  }
}
