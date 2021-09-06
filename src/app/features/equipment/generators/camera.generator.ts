import { CameraInterface, CameraType } from "@features/equipment/interfaces/camera.interface";
import { SensorGenerator } from "@features/equipment/generators/sensor.generator";
import { BrandGenerator } from "@features/equipment/generators/brand.generator";

export class CameraGenerator {
  static camera(source: Partial<CameraInterface> = {}): CameraInterface {
    return {
      id: source.id || 1,
      created: source.created || "1970-01-01",
      updated: source.updated || "1970-01-01",
      createdBy: source.createdBy || 1,
      brand: source.brand || BrandGenerator.brand().id,
      name: source.name || "Test camera",
      image: source.image || "https://cdn.astrobin.com/images/foo.jpg",
      type: source.type || CameraType.DSLR_MIRRORLESS,
      sensor: source.sensor || SensorGenerator.sensor().id,
      cooled: source.cooled !== undefined ? source.cooled : true,
      maxCooling: source.maxCooling !== undefined ? source.maxCooling : 50,
      backFocus: source.backFocus !== undefined ? source.backFocus : 10
    };
  }
}
