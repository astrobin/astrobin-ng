import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { EquipmentItemServiceInterface } from "@features/equipment/services/equipment-item.service-interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { ColorOrMono, SensorInterface } from "@features/equipment/types/sensor.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { combineLatest, Observable, of } from "rxjs";
import { filter, map, take } from "rxjs/operators";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { LoadEquipmentItem } from "@features/equipment/store/equipment.actions";

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
  COLOR_OR_MONO = "COLOR_OR_MONO",
  CAMERAS = "CAMERAS"
}

@Injectable({
  providedIn: "root"
})
export class SensorService extends BaseService implements EquipmentItemServiceInterface {
  constructor(
    public readonly store$: Store<State>,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly modalService: NgbModal
  ) {
    super(loadingService);
  }

  humanizeColorOrMono(colorOrMono: ColorOrMono): string {
    if (colorOrMono === ColorOrMono.C) {
      return this.translateService.instant("Color");
    } else if (colorOrMono === ColorOrMono.M) {
      return this.translateService.instant("Mono");
    }

    return "";
  }

  getSupportedPrintableProperties(): SensorDisplayProperty[] {
    return [
      SensorDisplayProperty.PIXEL_SIZE,
      SensorDisplayProperty.PIXELS,
      SensorDisplayProperty.PIXEL_WIDTH,
      SensorDisplayProperty.PIXEL_HEIGHT,
      SensorDisplayProperty.SENSOR_SIZE,
      SensorDisplayProperty.SENSOR_WIDTH,
      SensorDisplayProperty.SENSOR_HEIGHT,
      SensorDisplayProperty.QUANTUM_EFFICIENCY,
      SensorDisplayProperty.FULL_WELL_CAPACITY,
      SensorDisplayProperty.READ_NOISE,
      SensorDisplayProperty.FRAME_RATE,
      SensorDisplayProperty.ADC,
      SensorDisplayProperty.COLOR_OR_MONO,
      SensorDisplayProperty.CAMERAS
    ];
  }

  getPrintableProperty$(
    item: SensorInterface,
    property: SensorDisplayProperty,
    propertyValue?: any,
    shortForm?: boolean
  ): Observable<string | null> {
    switch (property) {
      case SensorDisplayProperty.PIXEL_SIZE:
        propertyValue = parseFloat(propertyValue);
        return of(propertyValue || item.pixelSize ? `${propertyValue || item.pixelSize} μm` : "");
      case SensorDisplayProperty.PIXELS:
        return of(
          propertyValue || (item.pixelWidth && item.pixelHeight)
            ? `${propertyValue?.pixelWidth || item.pixelWidth} x ${propertyValue?.pixelHeight || item.pixelHeight}`
            : ""
        );
      case SensorDisplayProperty.PIXEL_WIDTH:
        propertyValue = parseInt(propertyValue, 10);
        return of(propertyValue || item.pixelWidth ? `${propertyValue || item.pixelWidth}` : "");
      case SensorDisplayProperty.PIXEL_HEIGHT:
        propertyValue = parseInt(propertyValue, 10);
        return of(propertyValue || item.pixelHeight ? `${propertyValue || item.pixelHeight}` : "");
      case SensorDisplayProperty.SENSOR_SIZE:
        if (!!propertyValue) {
          propertyValue.sensorWidth = parseFloat(propertyValue.sensorWidth);
          propertyValue.sensorHeight = parseFloat(propertyValue.sensorHeight);
        }
        return of(
          propertyValue || (item.sensorWidth && item.sensorHeight)
            ? `${propertyValue?.sensorWidth || item.sensorWidth} x ${propertyValue?.sensorHeight ||
            item.sensorHeight} mm`
            : ""
        );
      case SensorDisplayProperty.SENSOR_WIDTH:
        propertyValue = parseInt(propertyValue, 10);
        return of(propertyValue || item.sensorWidth ? `${propertyValue || item.sensorWidth} mm` : "");
      case SensorDisplayProperty.SENSOR_HEIGHT:
        propertyValue = parseInt(propertyValue, 10);
        return of(propertyValue || item.sensorHeight ? `${propertyValue || item.sensorHeight} mm` : "");
      case SensorDisplayProperty.QUANTUM_EFFICIENCY:
        propertyValue = parseFloat(propertyValue);
        return of(propertyValue || item.quantumEfficiency ? `${propertyValue || item.quantumEfficiency}%` : "");
      case SensorDisplayProperty.FULL_WELL_CAPACITY:
        propertyValue = parseFloat(propertyValue);
        return of(propertyValue || item.fullWellCapacity ? `${propertyValue || item.fullWellCapacity} ke-` : "");
      case SensorDisplayProperty.READ_NOISE:
        propertyValue = parseFloat(propertyValue);
        return of(propertyValue || item.readNoise ? `${propertyValue || item.readNoise} e-` : "");
      case SensorDisplayProperty.FRAME_RATE:
        propertyValue = parseInt(propertyValue, 10);
        return of(propertyValue || item.frameRate ? `${propertyValue || item.frameRate} FPS` : "");
      case SensorDisplayProperty.ADC:
        propertyValue = parseInt(propertyValue, 10);
        return of(propertyValue || item.adc ? `${propertyValue || item.adc}-bit` : "");
      case SensorDisplayProperty.COLOR_OR_MONO:
        return of(this.humanizeColorOrMono(propertyValue || item.colorOrMono));
      case SensorDisplayProperty.CAMERAS:
        const ids = propertyValue || item.cameras;
        if (!ids || ids.length === 0) {
          return of(null);
        }

        let cameras$ = [];
        for (const id of ids) {
          const payload = {
            id,
            type: EquipmentItemType.CAMERA
          };
          this.store$.dispatch(new LoadEquipmentItem(payload));

          cameras$.push(this.store$.select(selectEquipmentItem, payload).pipe(
            filter(camera => !!camera),
            take(1),
            map(
              camera =>
                `${camera.brandName ? camera.brandName : this.translateService.instant("(DIY)")} ${camera.name}`
            )
          ));
        }

        return combineLatest(cameras$).pipe(
          map(cameras => cameras.join(", "))
        );

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
      case SensorDisplayProperty.PIXELS:
        return shortForm ? this.translateService.instant("Pixels") : this.translateService.instant("Number of pixels");
      case SensorDisplayProperty.SENSOR_WIDTH:
        return shortForm
          ? this.translateService.instant("Sensor width")
          : this.translateService.instant("Sensor width") + " (mm)";
      case SensorDisplayProperty.SENSOR_HEIGHT:
        return shortForm
          ? this.translateService.instant("Sensor height")
          : this.translateService.instant("Sensor height") + " (mm)";
      case SensorDisplayProperty.SENSOR_SIZE:
        return shortForm
          ? this.translateService.instant("Sensor size")
          : this.translateService.instant("Sensor size") + " (mm)";
      case SensorDisplayProperty.QUANTUM_EFFICIENCY:
        return shortForm ? "QE" : this.translateService.instant("Quantum efficiency") + " (%)";
      case SensorDisplayProperty.FULL_WELL_CAPACITY:
        return shortForm
          ? this.translateService.instant("Full well capacity")
          : this.translateService.instant("Full well capacity") + " (ke-)";
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
        return this.translateService.instant("Color or mono");
      case SensorDisplayProperty.CAMERAS:
        return this.translateService.instant("Cameras");
      default:
        throw Error(`Invalid property: ${propertyName}`);
    }
  }
}
