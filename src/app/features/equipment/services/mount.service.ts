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
  TRACKING_ACCURACY = "TRACKING_ACCURACY",
  PEC = "PEC",
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
      [MountType.OTHER]: this.translateService.instant("Other")
    };

    return map[type];
  }

  getSupportedPrintableProperties(): string[] {
    return [
      MountDisplayProperty.TYPE,
      MountDisplayProperty.TRACKING_ACCURACY,
      MountDisplayProperty.PEC,
      MountDisplayProperty.MAX_PAYLOAD,
      MountDisplayProperty.COMPUTERIZED,
      MountDisplayProperty.SLEW_SPEED
    ];
  }

  getPrintableProperty$(item: MountInterface, property: MountDisplayProperty, propertyValue?: any): Observable<string> {
    switch (property) {
      case MountDisplayProperty.TYPE:
        return of(this.humanizeType(propertyValue || item.type));
      case MountDisplayProperty.TRACKING_ACCURACY:
        propertyValue = parseInt(propertyValue, 10);
        return of(propertyValue || item.trackingAccuracy ? `${propertyValue || item.trackingAccuracy} arcsec` : "");
      case MountDisplayProperty.PEC:
        return of(this.utilsService.yesNo(propertyValue !== undefined ? propertyValue : item.pec));
      case MountDisplayProperty.MAX_PAYLOAD:
        propertyValue = parseInt(propertyValue, 10);
        return of(propertyValue || item.maxPayload ? `${propertyValue || item.maxPayload} kg` : "");
      case MountDisplayProperty.COMPUTERIZED:
        return of(this.utilsService.yesNo(propertyValue !== undefined ? propertyValue : item.computerized));
      case MountDisplayProperty.SLEW_SPEED:
        propertyValue = parseFloat(propertyValue);
        return of(propertyValue || item.slewSpeed ? `${propertyValue || item.slewSpeed} deg/sec` : "");
      default:
        throw Error(`Invalid property: ${property}`);
    }
  }

  getPrintablePropertyName(propertyName: MountDisplayProperty, shortForm = false): string {
    switch (propertyName) {
      case MountDisplayProperty.TYPE:
        return this.translateService.instant("Type");
      case MountDisplayProperty.TRACKING_ACCURACY:
        return shortForm
          ? this.translateService.instant("Tracking accuracy")
          : this.translateService.instant("Tracking accuracy") + " (arcsec)";
      case MountDisplayProperty.PEC:
        return shortForm
          ? this.translateService.instant("PEC")
          : this.translateService.instant("Periodic error correction");
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
