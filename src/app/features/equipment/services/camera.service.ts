import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { EquipmentItemServiceInterface } from "@features/equipment/services/equipment-item.service-interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { CameraInterface, CameraType } from "@features/equipment/types/camera.interface";
import { TranslateService } from "@ngx-translate/core";
import { Observable, of } from "rxjs";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { LoadBrand, LoadEquipmentItem } from "@features/equipment/store/equipment.actions";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { selectBrand, selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { filter, map, switchMap, take, tap } from "rxjs/operators";
import { SensorInterface } from "@features/equipment/types/sensor.interface";

export enum CameraDisplayProperty {
  TYPE = "TYPE",
  SENSOR = "SENSOR",
  COOLED = "COOLED",
  MAX_COOLING = "MAX_COOLING",
  BACK_FOCUS = "BACK_FOCUS"
}

@Injectable({
  providedIn: "root"
})
export class CameraService extends BaseService implements EquipmentItemServiceInterface {
  constructor(
    public readonly store$: Store<State>,
    public readonly loadingService: LoadingService,
    public readonly utilsService: UtilsService,
    public readonly translateService: TranslateService
  ) {
    super(loadingService);
  }

  humanizeType(type: CameraType) {
    switch (type) {
      case CameraType.DEDICATED_DEEP_SKY:
        return this.translateService.instant("Dedicated deep-sky camera");
      case CameraType.DSLR_MIRRORLESS:
        return this.translateService.instant("General purpose DSLR or mirrorless camera");
      case CameraType.GUIDER_PLANETARY:
        return this.translateService.instant("Guider or planetary camera");
      case CameraType.VIDEO:
        return this.translateService.instant("General purpose video camera");
      case CameraType.FILM:
        return this.translateService.instant("Film camera");
      case CameraType.OTHER:
        return this.translateService.instant("Other");
    }
  }

  getSupportedPrintableProperties(): string[] {
    return [
      "NAME", // Does not use EquipmentTypeDisplayProperty.NAME to avoid circular dependency.
      CameraDisplayProperty.TYPE,
      CameraDisplayProperty.SENSOR,
      CameraDisplayProperty.COOLED,
      CameraDisplayProperty.MAX_COOLING,
      CameraDisplayProperty.BACK_FOCUS
    ];
  }

  getPrintableProperty$(
    item: CameraInterface,
    property: CameraDisplayProperty | string,
    propertyValue?: any
  ): Observable<string> {
    switch (property) {
      case "NAME":
        return of(item.modified ? `${item.name} ${this.translateService.instant("(modified)")}` : item.name);
      case CameraDisplayProperty.TYPE:
        return of(this.humanizeType(propertyValue || item.type));
      case CameraDisplayProperty.SENSOR:
        const payload = { id: parseInt(propertyValue, 10) || item.sensor, type: EquipmentItemType.SENSOR };
        this.store$.dispatch(new LoadEquipmentItem(payload));
        return this.store$.select(selectEquipmentItem, payload).pipe(
          filter(sensor => !!sensor),
          take(1),
          tap(sensor => this.store$.dispatch(new LoadBrand({ id: sensor.brand }))),
          switchMap((sensor: SensorInterface) =>
            this.store$.select(selectBrand, sensor.brand).pipe(
              filter(brand => !!brand),
              take(1),
              map(brand => ({ brand, sensor }))
            )
          ),
          map(({ brand, sensor }) => `<strong>${brand.name}</strong> ${sensor.name}`)
        );
      case CameraDisplayProperty.COOLED:
        return of(this.utilsService.yesNo(propertyValue !== undefined ? propertyValue : item.cooled));
      case CameraDisplayProperty.MAX_COOLING:
        return of(propertyValue || item.maxCooling ? `${propertyValue || item.maxCooling} &deg;C` : "");
      case CameraDisplayProperty.BACK_FOCUS:
        propertyValue = parseFloat(propertyValue);
        return of(propertyValue || item.backFocus ? `${propertyValue || item.backFocus} mm` : "");
      default:
        throw Error(`Invalid property: ${property}`);
    }
  }

  getPrintablePropertyName(propertyName: CameraDisplayProperty, shortForm = false): string {
    switch (propertyName) {
      case CameraDisplayProperty.TYPE:
        return this.translateService.instant("Type");
      case CameraDisplayProperty.SENSOR:
        return this.translateService.instant("Sensor");
      case CameraDisplayProperty.COOLED:
        return this.translateService.instant("Cooled");
      case CameraDisplayProperty.MAX_COOLING:
        return shortForm
          ? this.translateService.instant("Max. cooling")
          : `${this.translateService.instant("Max. cooling")} (${this.translateService.instant(
              "Celsius degrees below ambient"
            )})`;
      case CameraDisplayProperty.BACK_FOCUS:
        return shortForm
          ? this.translateService.instant("Back focus")
          : this.translateService.instant("Back focus") + " (mm)";
      default:
        throw Error(`Invalid property: ${propertyName}`);
    }
  }
}
