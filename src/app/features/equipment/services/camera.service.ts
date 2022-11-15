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
  NAME = "NAME",
  TYPE = "TYPE",
  SENSOR = "SENSOR",
  COOLED = "COOLED",
  MAX_COOLING = "MAX_COOLING",
  BACK_FOCUS = "BACK_FOCUS",
  MODIFIED = "MODIFIED"
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

  humanizeType(type: CameraType): string {
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
      CameraDisplayProperty.NAME,
      CameraDisplayProperty.TYPE,
      CameraDisplayProperty.SENSOR,
      CameraDisplayProperty.COOLED,
      CameraDisplayProperty.MAX_COOLING,
      CameraDisplayProperty.BACK_FOCUS,
      CameraDisplayProperty.MODIFIED
    ];
  }

  getPrintableProperty$(
    item: CameraInterface,
    property: CameraDisplayProperty | string,
    propertyValue?: any,
    shortForm?: boolean
  ): Observable<string | null> {
    switch (property) {
      case "NAME":
        let name: string = propertyValue || item.name;

        if (item.type === CameraType.DSLR_MIRRORLESS) {
          const modifiedLabel = this.translateService.instant("modified");
          const cooledLabel = this.translateService.instant("cooled");

          if (item.modified && item.cooled) {
            name = `${name} (${modifiedLabel} + ${cooledLabel})`;
          } else if (item.modified) {
            name = `${name} (${modifiedLabel})`;
          } else if (item.cooled) {
            name = `${name} (${cooledLabel})`;
          }
        }

        return of(name);
      case CameraDisplayProperty.TYPE:
        return of(this.humanizeType(propertyValue || item.type));
      case CameraDisplayProperty.SENSOR:
        const id = parseInt(propertyValue, 10) || item.sensor;

        if (!id) {
          return of(null);
        }

        const payload = {
          id,
          type: EquipmentItemType.SENSOR
        };

        this.store$.dispatch(new LoadEquipmentItem(payload));

        return this.store$.select(selectEquipmentItem, payload).pipe(
          filter(sensor => !!sensor),
          take(1),
          tap(sensor => {
            if (!!sensor.brand) {
              this.store$.dispatch(new LoadBrand({ id: sensor.brand }));
            }
          }),
          switchMap((sensor: SensorInterface) =>
            this.store$.select(selectBrand, sensor.brand).pipe(
              filter(brand => {
                if (!!sensor.brand) {
                  return !!brand;
                }

                return true;
              }),
              take(1),
              map(brand => ({ brand, sensor }))
            )
          ),
          map(
            ({ brand, sensor }) =>
              `<strong>${brand ? brand.name : this.translateService.instant("(DIY)")}</strong> ${sensor.name}`
          )
        );
      case CameraDisplayProperty.COOLED:
        const cooledValue = propertyValue !== undefined ? propertyValue : item.cooled;
        if (cooledValue === undefined || cooledValue === null) {
          return of(null);
        }
        return of(this.utilsService.yesNo(cooledValue));
      case CameraDisplayProperty.MAX_COOLING:
        return of(propertyValue || item.maxCooling ? `${propertyValue || item.maxCooling} &deg;C` : "");
      case CameraDisplayProperty.BACK_FOCUS:
        propertyValue = parseFloat(propertyValue);
        return of(propertyValue || item.backFocus ? `${propertyValue || item.backFocus} mm` : "");
      case CameraDisplayProperty.MODIFIED:
        const modifiedValue = propertyValue !== undefined ? propertyValue : item.modified;
        if (modifiedValue === undefined || modifiedValue === null) {
          return of(null);
        }
        return of(this.utilsService.yesNo(modifiedValue));
      default:
        throw Error(`Invalid property: ${property}`);
    }
  }

  getPrintablePropertyName(propertyName: CameraDisplayProperty, shortForm = false): string {
    switch (propertyName) {
      case CameraDisplayProperty.NAME:
        return shortForm
          ? this.translateService.instant("Name")
          : this.translateService.instant("Official and complete product name");
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
      case CameraDisplayProperty.MODIFIED:
        return this.translateService.instant("Modified");
      default:
        throw Error(`Invalid property: ${propertyName}`);
    }
  }
}
