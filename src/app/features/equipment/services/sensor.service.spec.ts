import { TestBed } from "@angular/core/testing";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { SensorDisplayProperty, SensorService } from "@features/equipment/services/sensor.service";
import { SensorGenerator } from "@features/equipment/generators/sensor.generator";
import { SensorInterface } from "@features/equipment/types/sensor.interface";
import { ColorOrMono } from "@features/equipment/types/sensor.interface";
import { of } from "rxjs";

describe("SensorService", () => {
  let service: SensorService;
  let sensor: SensorInterface;

  beforeEach(async () => {
    await MockBuilder(SensorService, AppModule);
    service = TestBed.inject(SensorService);
    jest.spyOn(service.translateService, "instant").mockImplementation(s => s);
    jest.spyOn(service.translateService, "stream").mockImplementation(s => of(s));
    sensor = SensorGenerator.sensor({
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
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("getPrintableProperty", () => {
    it("should work for quantum efficiency'", (done) => {
      service.getPrintableProperty$(sensor, SensorDisplayProperty.QUANTUM_EFFICIENCY).subscribe(value => {
        expect(value).toEqual("10%");
        done();
      });
    });

    it("should work for pixel size'", (done) => {
      service.getPrintableProperty$(sensor, SensorDisplayProperty.PIXEL_SIZE).subscribe(value => {
        expect(value).toEqual("7.4 μm");
        done();
      });
    });

    it("should work for pixels'", (done) => {
      service.getPrintableProperty$(sensor, SensorDisplayProperty.PIXELS).subscribe(value => {
        expect(value).toEqual("800 x 600");
        done();
      });
    });

    it("should work for sensor size'", (done) => {
      service.getPrintableProperty$(sensor, SensorDisplayProperty.SENSOR_SIZE).subscribe(value => {
        expect(value).toEqual("25 x 20 mm");
        done();
      });
    });

    it("should work for full well capacity'", (done) => {
      service.getPrintableProperty$(sensor, SensorDisplayProperty.FULL_WELL_CAPACITY).subscribe(value => {
        expect(value).toEqual("5 ke-");
        done();
      });
    });

    it("should work for read noise'", (done) => {
      service.getPrintableProperty$(sensor, SensorDisplayProperty.READ_NOISE).subscribe(value => {
        expect(value).toEqual("1000 e-");
        done();
      });
    });

    it("should work for frame rate'", (done) => {
      service.getPrintableProperty$(sensor, SensorDisplayProperty.FRAME_RATE).subscribe(value => {
        expect(value).toEqual("24 FPS");
        done();
      });
    });

    it("should work for ADC'", (done) => {
      service.getPrintableProperty$(sensor, SensorDisplayProperty.ADC).subscribe(value => {
        expect(value).toEqual("12-bit");
        done();
      });
    });

    it("should work for color or mono'", (done) => {
      service.getPrintableProperty$(sensor, SensorDisplayProperty.COLOR_OR_MONO).subscribe(value => {
        expect(value).toEqual("Mono");
        done();
      });
    });
  });
});
