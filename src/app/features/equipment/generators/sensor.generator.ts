import { ColorOrMono, SensorInterface } from "@features/equipment/interfaces/sensor.interface";
import { BrandGenerator } from "@features/equipment/generators/brand.generator";

export class SensorGenerator {
  static sensor(): SensorInterface {
    return {
      id: 1,
      created: "1970-01-01",
      updated: "1970-01-01",
      createdBy: 1,
      brand: BrandGenerator.brand().id,
      name: "Test camera",
      image: "https://cdn.astrobin.com/images/foo.jpg",
      quantumEfficiency: 1,
      pixelSize: 1,
      pixelWidth: 1,
      pixelHeight: 1,
      sensorWidth: 1,
      sensorHeight: 1,
      fullWellCapacity: 1,
      readNoise: 1,
      frameRate: 1,
      adc: 1,
      colorOrMono: ColorOrMono.M
    };
  }
}
