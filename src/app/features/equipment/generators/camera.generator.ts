import { CameraInterface, CameraType } from "@features/equipment/interfaces/camera.interface";
import { SensorGenerator } from "@features/equipment/generators/sensor.generator";
import { BrandGenerator } from "@features/equipment/generators/brand.generator";

export class CameraGenerator {
  static camera(): CameraInterface {
    return {
      id: 1,
      created: "1970-01-01",
      updated: "1970-01-01",
      createdBy: 1,
      brand: BrandGenerator.brand().id,
      name: "Test camera",
      image: "https://cdn.astrobin.com/images/foo.jpg",
      type: CameraType.DSLR,
      sensor: SensorGenerator.sensor().id,
      cooled: true,
      maxCooling: 50,
      backFocus: 10
    };
  }
}
