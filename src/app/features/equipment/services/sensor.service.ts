import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { EquipmentItemServiceInterface } from "@features/equipment/services/equipment-item.service-interface";
import { ColorOrMono, SensorInterface } from "@features/equipment/interfaces/sensor.interface";
import { TranslateService } from "@ngx-translate/core";

export enum SensorDisplayProperty {
  QUANTUM_EFFICIENCY,
  PIXEL_SIZE,
  PIXELS,
  SENSOR_SIZE,
  FULL_WELL_CAPACITY,
  READ_NOISE,
  FRAME_RATE,
  ADC,
  COLOR_OR_MONO
}
@Injectable({
  providedIn: "root"
})
export class SensorService extends BaseService implements EquipmentItemServiceInterface {
  constructor(public readonly loadingService: LoadingService, public readonly translateService: TranslateService) {
    super(loadingService);
  }

  getPrintableProperty(item: SensorInterface, property: SensorDisplayProperty): string {
    switch (property) {
      case SensorDisplayProperty.QUANTUM_EFFICIENCY:
        return item.quantumEfficiency ? `${item.quantumEfficiency}%` : "";
      case SensorDisplayProperty.PIXEL_SIZE:
        return item.pixelSize ? `${item.pixelSize} μm` : "";
      case SensorDisplayProperty.PIXELS:
        return item.pixelWidth && item.pixelHeight ? `${item.pixelWidth} x ${item.pixelHeight}` : "";
      case SensorDisplayProperty.SENSOR_SIZE:
        return item.sensorWidth && item.sensorHeight ? `${item.sensorWidth} x ${item.sensorHeight} mm` : "";
      case SensorDisplayProperty.FULL_WELL_CAPACITY:
        return item.fullWellCapacity ? `${item.fullWellCapacity} e-` : "";
      case SensorDisplayProperty.READ_NOISE:
        return item.readNoise ? `${item.readNoise} e-` : "";
      case SensorDisplayProperty.FRAME_RATE:
        return item.frameRate ? `${item.frameRate} FPS` : "";
      case SensorDisplayProperty.ADC:
        return item.adc ? `${item.adc}-bit` : "";
      case SensorDisplayProperty.COLOR_OR_MONO:
        if (item.colorOrMono === ColorOrMono.C) {
          return this.translateService.instant("Color");
        } else if (item.colorOrMono === ColorOrMono.M) {
          return this.translateService.instant("Mono");
        }
        return "";
      default:
        throw Error(`Invalid property: ${property}`);
    }
  }
}
