import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { EquipmentItemServiceInterface } from "@features/equipment/services/equipment-item.service-interface";
import { SoftwareInterface } from "@features/equipment/types/software.interface";
import { TranslateService } from "@ngx-translate/core";
import { Observable, of } from "rxjs";
import { UtilsService } from "@shared/services/utils/utils.service";
import { WeightUnit } from "@shared/types/weight-unit.enum";

export enum SoftwareDisplayProperty {}

@Injectable({
  providedIn: "root"
})
export class SoftwareService extends BaseService implements EquipmentItemServiceInterface {
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
    item: SoftwareInterface,
    property: SoftwareDisplayProperty,
    propertyValue: any,
    options: { weightUnit?: WeightUnit } = {}
  ): Observable<string | null> {
    throw Error(`Invalid property: ${property}`);
  }

  getPrintablePropertyName(propertyName: SoftwareDisplayProperty, shortForm = false): string {
    throw Error(`Invalid property: ${propertyName}`);
  }
}
