import { TestBed } from "@angular/core/testing";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { SensorDisplayProperty, SensorService } from "@features/equipment/services/sensor.service";
import { SensorGenerator } from "@features/equipment/generators/sensor.generator";
import { ColorOrMono } from "@features/equipment/interfaces/sensor.interface";

describe("SensorService", () => {
  let service: SensorService;

  beforeEach(async () => {
    await MockBuilder(SensorService, AppModule);
    service = TestBed.inject(SensorService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("getPrintableProperty", () => {
    it("should work for all properties'", () => {
      const sensor = SensorGenerator.sensor({
        quantumEfficiency: 10,
        pixelSize: 7.4,
        pixelWidth: 800,
        pixelHeight: 600,
        sensorWidth: 25,
        sensorHeight: 20,
        fullWellCapacity: 5000,
        readNoise: 1000,
        frameRate: 24,
        adc: 12,
        colorOrMono: ColorOrMono.M
      });

      expect(service.getPrintableProperty(sensor, SensorDisplayProperty.QUANTUM_EFFICIENCY)).toEqual("10%");
      expect(service.getPrintableProperty(sensor, SensorDisplayProperty.PIXEL_SIZE)).toEqual("7.4 μm");
      expect(service.getPrintableProperty(sensor, SensorDisplayProperty.PIXELS)).toEqual("800 x 600");
      expect(service.getPrintableProperty(sensor, SensorDisplayProperty.SENSOR_SIZE)).toEqual("25 x 20 mm");
      expect(service.getPrintableProperty(sensor, SensorDisplayProperty.FULL_WELL_CAPACITY)).toEqual("5000 e-");
      expect(service.getPrintableProperty(sensor, SensorDisplayProperty.READ_NOISE)).toEqual("1000 e-");
      expect(service.getPrintableProperty(sensor, SensorDisplayProperty.FRAME_RATE)).toEqual("24 FPS");
      expect(service.getPrintableProperty(sensor, SensorDisplayProperty.ADC)).toEqual("12-bit");
      expect(service.getPrintableProperty(sensor, SensorDisplayProperty.COLOR_OR_MONO)).toEqual("Mono");
    });
  });
});
