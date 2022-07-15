import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { EquipmentItemServiceInterface } from "@features/equipment/services/equipment-item.service-interface";
import { AccessoryInterface, AccessoryType } from "@features/equipment/types/accessory.interface";
import { TranslateService } from "@ngx-translate/core";
import { Observable, of } from "rxjs";
import { UtilsService } from "@shared/services/utils/utils.service";
import { FilterDisplayProperty } from "@features/equipment/services/filter.service";

export enum AccessoryDisplayProperty {
  TYPE = "TYPE"
}

@Injectable({
  providedIn: "root"
})
export class AccessoryService extends BaseService implements EquipmentItemServiceInterface {
  constructor(
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly utilsService: UtilsService
  ) {
    super(loadingService);
  }

  humanizeType(type: AccessoryType) {
    const map = {
      [AccessoryType.COMPUTER]: this.translateService.instant("Computer"),
      [AccessoryType.DEW_MITIGATION]: this.translateService.instant("Dew mitigation"),
      [AccessoryType.FIELD_DEROTATOR]: this.translateService.instant("Field derotator"),
      [AccessoryType.FILTER_WHEEL]: this.translateService.instant("Filter wheel"),
      [AccessoryType.FLAT_BOX]: this.translateService.instant("Flat box"),
      [AccessoryType.FOCAL_MODIFIER_FIELD_CORRECTOR]: this.translateService.instant("Focal modifier / field corrector"),
      [AccessoryType.FOCUSER]: this.translateService.instant("Focuser"),
      [AccessoryType.OAG]: this.translateService.instant("Off-xis guider"),
      [AccessoryType.OBSERVATORY_CONTROL]: this.translateService.instant("Observatory control"),
      [AccessoryType.OBSERVATORY_DOME]: this.translateService.instant("Observatory dome"),
      [AccessoryType.POWER_DISTRIBUTION]: this.translateService.instant("Power distribution"),
      [AccessoryType.WEATHER_MONITORING]: this.translateService.instant("Weather monitoring"),
      [AccessoryType.OTHER]: this.translateService.instant("Other")
    };

    return map[type];
  }

  getSupportedPrintableProperties(): string[] {
    return [AccessoryDisplayProperty.TYPE];
  }

  getPrintableProperty$(
    item: AccessoryInterface,
    property: AccessoryDisplayProperty,
    propertyValue?: any
  ): Observable<string | null> {
    switch (property) {
      case AccessoryDisplayProperty.TYPE:
        return of(this.humanizeType(propertyValue || item.type));
      default:
        throw Error(`Invalid property: ${property}`);
    }
  }

  getPrintablePropertyName(propertyName: AccessoryDisplayProperty, shortForm = false): string {
    switch (propertyName) {
      case AccessoryDisplayProperty.TYPE:
        return this.translateService.instant("Type");
      default:
        throw Error(`Invalid property: ${propertyName}`);
    }
  }
}
