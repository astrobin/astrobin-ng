import { BrandGenerator } from "@features/equipment/generators/brand.generator";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { SensorInterface, ColorOrMono } from "@features/equipment/types/sensor.interface";

export class SensorGenerator {
  static sensor(source: Partial<SensorInterface> = {}): SensorInterface {
    const generatedBrand = BrandGenerator.brand();

    return {
      id: source.id || 1,
      created: source.created || "1970-01-01",
      updated: source.updated || "1970-01-01",
      lastAddedOrRemovedFromImage: source.updated || "1970-01-01",
      klass: EquipmentItemType.SENSOR,
      createdBy: source.createdBy || 1,
      assignee: source.assignee || null,
      brand: source.brand || generatedBrand.id,
      brandName: source.brandName || generatedBrand.name,
      name: source.name || "Test sensor",
      website: source.website || "https://www.test-sensor.com",
      image: source.image || "https://cdn.astrobin.com/images/foo.jpg",
      communityNotes: null,
      quantumEfficiency: source.quantumEfficiency || 1,
      pixelSize: source.pixelSize || 1,
      pixelWidth: source.pixelWidth || 1,
      pixelHeight: source.pixelHeight || 1,
      sensorWidth: source.sensorWidth || 1,
      sensorHeight: source.sensorHeight || 1,
      fullWellCapacity: source.fullWellCapacity || 1,
      readNoise: source.readNoise || 1,
      frameRate: source.frameRate || 1,
      adc: source.adc || 1,
      colorOrMono: source.colorOrMono || ColorOrMono.M,
      frozenAsAmbiguous: null,
      userCount: null,
      imageCount: null,
      variantOf: null,
      variants: [],
      forum: null,
      listings: {
        itemListings: [],
        brandListings: [],
        allowFullRetailerIntegration: false
      },
      cameras: source.cameras || [],
      followed: false,
      contentType: 4
    };
  }
}
