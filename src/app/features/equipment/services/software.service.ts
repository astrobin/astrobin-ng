import { Injectable } from "@angular/core";
import { BaseService } from "@core/services/base.service";
import { LoadingService } from "@core/services/loading.service";
import { UtilsService } from "@core/services/utils/utils.service";
import type { EquipmentItemServiceInterface } from "@features/equipment/services/equipment-item.service-interface";
import type { SoftwareInterface } from "@features/equipment/types/software.interface";
import { TranslateService } from "@ngx-translate/core";
import type { Observable } from "rxjs";

export enum SoftwareDisplayProperty {
  BRAND = "BRAND"
}

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
    return [SoftwareDisplayProperty.BRAND];
  }

  getPrintableProperty$(item: SoftwareInterface, property: SoftwareDisplayProperty): Observable<string | null> {
    throw Error(`Invalid property: ${property}`);
  }

  getPrintablePropertyName(propertyName: SoftwareDisplayProperty): string {
    if (propertyName === SoftwareDisplayProperty.BRAND) {
      return (
        `${this.translateService.instant("Brand")} / ` +
        `${this.translateService.instant("Company")} / ` +
        this.translateService.instant("Developer(s)")
      );
    }
    throw Error(`Invalid property: ${propertyName}`);
  }
}
