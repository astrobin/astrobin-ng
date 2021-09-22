import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { EquipmentItemServiceInterface } from "@features/equipment/services/equipment-item.service-interface";
import { ColorOrMono, SensorInterface } from "@features/equipment/interfaces/sensor.interface";
import { TranslateService } from "@ngx-translate/core";
import { Observable, of } from "rxjs";

export enum SensorDisplayProperty {
  QUANTUM_EFFICIENCY = "QUANTUM_EFFICIENCY",
  PIXEL_SIZE = "PIXEL_SIZE",
  PIXELS = "PIXELS",
  PIXEL_WIDTH = "PIXEL_WIDTH",
  PIXEL_HEIGHT = "PIXEL_HEIGHT",
  SENSOR_SIZE = "SENSOR_SIZE",
  SENSOR_WIDTH = "SENSOR_WIDTH",
  SENSOR_HEIGHT = "SENSOR_HEIGHT",
  FULL_WELL_CAPACITY = "FULL_WELL_CAPACITY",
  READ_NOISE = "READ_NOISE",
  FRAME_RATE = "FRAME_RATE",
  ADC = "ADC",
  COLOR_OR_MONO = "COLOR_OR_MONO"
}
@Injectable({
  providedIn: "root"
})
export class SensorService extends BaseService implements EquipmentItemServiceInterface {
  constructor(public readonly loadingService: LoadingService, public readonly translateService: TranslateService) {
    super(loadingService);
  }

  getPrintableProperty$(
    item: SensorInterface,
    property: SensorDisplayProperty,
    propertyValue?: any
  ): Observable<string> {
    switch (property) {
      case SensorDisplayProperty.PIXEL_SIZE:
        return of(propertyValue || item.pixelSize ? `${propertyValue || item.pixelSize} μm` : "");
      case SensorDisplayProperty.PIXELS:
        return of(
          propertyValue || (item.pixelWidth && item.pixelHeight)
            ? `${propertyValue?.pixelWidth || item.pixelWidth} x ${propertyValue?.pixelHeight || item.pixelHeight}`
            : ""
        );
      case SensorDisplayProperty.SENSOR_SIZE:
        return of(
          propertyValue || (item.sensorWidth && item.sensorHeight)
            ? `${propertyValue?.sensorWidth || item.sensorWidth} x ${propertyValue?.sensorHeight ||
                item.sensorHeight} mm`
            : ""
        );
      case SensorDisplayProperty.QUANTUM_EFFICIENCY:
        return of(propertyValue || item.quantumEfficiency ? `${propertyValue || item.quantumEfficiency}%` : "");
      case SensorDisplayProperty.FULL_WELL_CAPACITY:
        return of(propertyValue || item.fullWellCapacity ? `${propertyValue || item.fullWellCapacity} e-` : "");
      case SensorDisplayProperty.READ_NOISE:
        return of(propertyValue || item.readNoise ? `${propertyValue || item.readNoise} e-` : "");
      case SensorDisplayProperty.FRAME_RATE:
        return of(propertyValue || item.frameRate ? `${propertyValue || item.frameRate} FPS` : "");
      case SensorDisplayProperty.ADC:
        return of(propertyValue || item.adc ? `${propertyValue || item.adc}-bit` : "");
      case SensorDisplayProperty.COLOR_OR_MONO:
        if (propertyValue || item.colorOrMono === ColorOrMono.C) {
          return this.translateService.stream("Color");
        } else if (propertyValue || item.colorOrMono === ColorOrMono.M) {
          return this.translateService.stream("Mono");
        }
        return of("");
      default:
        throw Error(`Invalid property: ${property}`);
    }
  }

  getPrintablePropertyName(propertyName: SensorDisplayProperty, shortForm = false): string {
    switch (propertyName) {
      case SensorDisplayProperty.PIXEL_SIZE:
        return shortForm
          ? this.translateService.instant("Pixel size")
          : this.translateService.instant("Pixel size") + " (μm)";
      case SensorDisplayProperty.PIXEL_WIDTH:
        return shortForm
          ? this.translateService.instant("Pixels X")
          : this.translateService.instant("Number of pixels across the X axis");
      case SensorDisplayProperty.PIXEL_HEIGHT:
        return shortForm
          ? this.translateService.instant("Pixels Y")
          : this.translateService.instant("Number of pixels across the Y axis");
      case SensorDisplayProperty.SENSOR_WIDTH:
        return shortForm
          ? this.translateService.instant("Sensor width")
          : this.translateService.instant("Sensor width") + " (mm)";
      case SensorDisplayProperty.SENSOR_HEIGHT:
        return shortForm
          ? this.translateService.instant("Sensor height")
          : this.translateService.instant("Sensor height") + " (mm)";
      case SensorDisplayProperty.QUANTUM_EFFICIENCY:
        return shortForm ? "QE" : this.translateService.instant("Quantum efficiency") + " (%)";
      case SensorDisplayProperty.FULL_WELL_CAPACITY:
        return shortForm
          ? this.translateService.instant("Full well capacity")
          : this.translateService.instant("Full well capacity") + " (e-)";
      case SensorDisplayProperty.READ_NOISE:
        return shortForm
          ? this.translateService.instant("Read noise")
          : this.translateService.instant("Read noise") + " (e-)";
      case SensorDisplayProperty.FRAME_RATE:
        return shortForm
          ? this.translateService.instant("Frame rate")
          : this.translateService.instant("Frame rate") + " (FPS)";
      case SensorDisplayProperty.ADC:
        return shortForm ? this.translateService.instant("ADC") : this.translateService.instant("ADC") + " (bits)";
      case SensorDisplayProperty.COLOR_OR_MONO:
        return this.translateService.instant("Color");
      default:
        throw Error(`Invalid property: ${propertyName}`);
    }
  }
}
