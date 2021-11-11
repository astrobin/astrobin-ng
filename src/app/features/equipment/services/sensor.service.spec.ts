import { TestBed } from "@angular/core/testing";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { SensorDisplayProperty, SensorService } from "@features/equipment/services/sensor.service";
import { SensorGenerator } from "@features/equipment/generators/sensor.generator";
import { ColorOrMono } from "@features/equipment/types/sensor.interface";
import { of } from "rxjs";

describe("SensorService", () => {
  let service: SensorService;

  beforeEach(async () => {
    await MockBuilder(SensorService, AppModule);
    service = TestBed.inject(SensorService);
    jest.spyOn(service.translateService, "instant").mockImplementation(s => s);
    jest.spyOn(service.translateService, "stream").mockImplementation(s => of(s));
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
        fullWellCapacity: 5,
        readNoise: 1000,
        frameRate: 24,
        adc: 12,
        colorOrMono: ColorOrMono.M
      });

      service.getPrintableProperty$(sensor, SensorDisplayProperty.QUANTUM_EFFICIENCY).subscribe(value => {
        expect(value).toEqual("10%");
      });

      service.getPrintableProperty$(sensor, SensorDisplayProperty.PIXEL_SIZE).subscribe(value => {
        expect(value).toEqual("7.4 μm");
      });

      service.getPrintableProperty$(sensor, SensorDisplayProperty.PIXELS).subscribe(value => {
        expect(value).toEqual("800 x 600");
      });

      service.getPrintableProperty$(sensor, SensorDisplayProperty.SENSOR_SIZE).subscribe(value => {
        expect(value).toEqual("25 x 20 mm");
      });

      service.getPrintableProperty$(sensor, SensorDisplayProperty.FULL_WELL_CAPACITY).subscribe(value => {
        expect(value).toEqual("5 ke-");
      });

      service.getPrintableProperty$(sensor, SensorDisplayProperty.READ_NOISE).subscribe(value => {
        expect(value).toEqual("1000 e-");
      });

      service.getPrintableProperty$(sensor, SensorDisplayProperty.FRAME_RATE).subscribe(value => {
        expect(value).toEqual("24 FPS");
      });

      service.getPrintableProperty$(sensor, SensorDisplayProperty.ADC).subscribe(value => {
        expect(value).toEqual("12-bit");
      });

      service.getPrintableProperty$(sensor, SensorDisplayProperty.COLOR_OR_MONO).subscribe(value => {
        expect(value).toEqual("Mono");
      });
    });
  });
});
