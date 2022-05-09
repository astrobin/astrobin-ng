import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { EquipmentItemServiceInterface } from "@features/equipment/services/equipment-item.service-interface";
import { AccessoryInterface } from "@features/equipment/types/accessory.interface";
import { TranslateService } from "@ngx-translate/core";
import { Observable, of } from "rxjs";
import { UtilsService } from "@shared/services/utils/utils.service";

export enum AccessoryDisplayProperty {}

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

  getSupportedPrintableProperties(): string[] {
    return [];
  }

  getPrintableProperty$(
    item: AccessoryInterface,
    property: AccessoryDisplayProperty,
    propertyValue?: any
  ): Observable<string | null> {
    throw Error(`Invalid property: ${property}`);
  }

  getPrintablePropertyName(propertyName: AccessoryDisplayProperty, shortForm = false): string {
    throw Error(`Invalid property: ${propertyName}`);
  }
}
