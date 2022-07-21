import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { EquipmentItemServiceInterface } from "@features/equipment/services/equipment-item.service-interface";
import { MountInterface, MountType } from "@features/equipment/types/mount.interface";
import { TranslateService } from "@ngx-translate/core";
import { Observable, of } from "rxjs";
import { UtilsService } from "@shared/services/utils/utils.service";

export enum MountDisplayProperty {
  TYPE = "TYPE",
  PERIODIC_ERROR = "PERIODIC_ERROR",
  PEC = "PEC",
  WEIGHT = "WEIGHT",
  MAX_PAYLOAD = "MAX_PAYLOAD",
  COMPUTERIZED = "COMPUTERIZED",
  SLEW_SPEED = "SLEW_SPEED"
}

@Injectable({
  providedIn: "root"
})
export class MountService extends BaseService implements EquipmentItemServiceInterface {
  constructor(
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly utilsService: UtilsService
  ) {
    super(loadingService);
  }

  humanizeType(type: MountType) {
    const map = {
      [MountType.ALTAZIMUTH]: this.translateService.instant("Alt-Az (altazimuth)"),
      [MountType.WEDGED_ALTAZIMUTH]: this.translateService.instant("Wedged Alt-Az"),
      [MountType.EQUATORIAL]: this.translateService.instant("Equatorial"),
      [MountType.GERMAN_EQUATORIAL]: this.translateService.instant("German equatorial"),
      [MountType.FORK]: this.translateService.instant("Fork"),
      [MountType.DOBSONIAN]: this.translateService.instant("Dobsonian"),
      [MountType.PORTABLE_ENGLISH]: this.translateService.instant("Portable English"),
      [MountType.STAR_TRACKER]: this.translateService.instant("Star tracker"),
      [MountType.ALT_ALT]: this.translateService.instant("Alt-Alt (altitude-altitude)"),
      [MountType.TRANSIT]: this.translateService.instant("Transit"),
      [MountType.HEXAPOD]: this.translateService.instant("Hexapod"),
      [MountType.DUAL_ALT_AZ_EQ]: this.translateService.instant("Dual Alt-Az/Equatorial"),
      [MountType.TRIPOD]: this.translateService.instant("Tripod"),
      [MountType.OTHER]: this.translateService.instant("Other")
    };

    return map[type];
  }

  getSupportedPrintableProperties(): string[] {
    return [
      MountDisplayProperty.TYPE,
      MountDisplayProperty.PERIODIC_ERROR,
      MountDisplayProperty.PEC,
      MountDisplayProperty.WEIGHT,
      MountDisplayProperty.MAX_PAYLOAD,
      MountDisplayProperty.COMPUTERIZED,
      MountDisplayProperty.SLEW_SPEED
    ];
  }

  getPrintableProperty$(
    item: MountInterface,
    property: MountDisplayProperty,
    propertyValue?: any,
    shortForm?: boolean
  ): Observable<string | null> {
    let result: string;

    switch (property) {
      case MountDisplayProperty.TYPE:
        result = this.humanizeType(propertyValue || item.type);
        break;
      case MountDisplayProperty.PERIODIC_ERROR:
        propertyValue = parseInt(propertyValue, 10);
        result = propertyValue || item.periodicError ? `${propertyValue || item.periodicError} arcsec` : "";
        break;
      case MountDisplayProperty.PEC:
        const pecValue = propertyValue !== undefined ? propertyValue : item.pec;
        if (pecValue === null || pecValue === undefined) {
          result = null;
        } else {
          result = this.utilsService.yesNo(pecValue);
        }
        break;
      case MountDisplayProperty.WEIGHT:
        propertyValue = parseFloat(propertyValue);
        result = propertyValue || item.weight ? `${propertyValue || item.weight} kg` : "";
        break;
      case MountDisplayProperty.MAX_PAYLOAD:
        propertyValue = parseFloat(propertyValue);
        result = propertyValue || item.maxPayload ? `${propertyValue || item.maxPayload} kg` : "";
        break;
      case MountDisplayProperty.COMPUTERIZED:
        const computerizedValue = propertyValue !== undefined ? propertyValue : item.computerized;
        if (computerizedValue === null || computerizedValue === undefined) {
          result = null;
        } else {
          result = this.utilsService.yesNo(computerizedValue);
        }
        break;
      case MountDisplayProperty.SLEW_SPEED:
        propertyValue = parseFloat(propertyValue);
        result = propertyValue || item.slewSpeed ? `${propertyValue || item.slewSpeed} deg/sec` : "";
        break;
      default:
        throw Error(`Invalid property: ${property}`);
    }

    return of(result);
  }

  getPrintablePropertyName(propertyName: MountDisplayProperty, shortForm = false): string {
    switch (propertyName) {
      case MountDisplayProperty.TYPE:
        return this.translateService.instant("Type");
      case MountDisplayProperty.PERIODIC_ERROR:
        return shortForm
          ? this.translateService.instant("Periodic error")
          : this.translateService.instant("Periodic error") + " (arcsec)";
      case MountDisplayProperty.PEC:
        return shortForm
          ? this.translateService.instant("PEC")
          : this.translateService.instant("Periodic error correction");
      case MountDisplayProperty.WEIGHT:
        return shortForm ? this.translateService.instant("Weight") : this.translateService.instant("Weight") + " (kg)";
      case MountDisplayProperty.MAX_PAYLOAD:
        return shortForm
          ? this.translateService.instant("Max. payload")
          : this.translateService.instant("Max. payload") + " (kg)";
      case MountDisplayProperty.COMPUTERIZED:
        return this.translateService.instant("Computerized");
      case MountDisplayProperty.SLEW_SPEED:
        return shortForm
          ? this.translateService.instant("Slew speed")
          : this.translateService.instant("Slew speed") + " (deg/sec)";
      default:
        throw Error(`Invalid property: ${propertyName}`);
    }
  }
}
