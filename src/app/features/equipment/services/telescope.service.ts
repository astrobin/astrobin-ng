import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { EquipmentItemServiceInterface } from "@features/equipment/services/equipment-item.service-interface";
import { TelescopeInterface, TelescopeType } from "@features/equipment/interfaces/telescope.interface";
import { TranslateService } from "@ngx-translate/core";
import { Observable, of } from "rxjs";

export enum TelescopeDisplayProperty {
  TYPE = "TYPE",
  APERTURE = "APERTURE",
  MIN_APERTURE = "MIN_APERTURE",
  MAX_APERTURE = "MAX_APERTURE",
  FOCAL_LENGTH = "FOCAL_LENGTH",
  MIN_FOCAL_LENGTH = "MIN_FOCAL_LENGTH",
  MAX_FOCAL_LENGTH = "MAX_FOCAL_LENGTH",
  WEIGHT = "WEIGHT"
}

@Injectable({
  providedIn: "root"
})
export class TelescopeService extends BaseService implements EquipmentItemServiceInterface {
  constructor(public readonly loadingService: LoadingService, public readonly translateService: TranslateService) {
    super(loadingService);
  }

  humanizeType(type: TelescopeType) {
    switch (type) {
      case TelescopeType.REFRACTOR_ACHROMATIC:
        return this.translateService.instant("Refractor: achromatic");
    }
  }

  getPrintableProperty$(
    item: TelescopeInterface,
    property: TelescopeDisplayProperty,
    propertyValue?: any
  ): Observable<string> {
    switch (property) {
      case TelescopeDisplayProperty.TYPE:
        return of(this.humanizeType(propertyValue || item.type));
      case TelescopeDisplayProperty.APERTURE:
        return of(
          propertyValue?.minAperture || item.minAperture === propertyValue?.maxAperture || item.maxAperture
            ? `${propertyValue?.maxAperure || item.maxAperture} mm`
            : `${propertyValue?.minAperture || item.minAperture} - ${propertyValue?.minAperture || item.maxAperture} mm`
        );
      case TelescopeDisplayProperty.FOCAL_LENGTH:
        return of(
          propertyValue?.minFocalLength || item.minFocalLength === propertyValue?.maxFocalLength || item.maxFocalLength
            ? `${propertyValue?.maxFocalLength || item.maxFocalLength} mm`
            : `${propertyValue?.minFocalLength || item.minFocalLength} - ${propertyValue?.maxFocalLength ||
                item.maxFocalLength} mm`
        );
      case TelescopeDisplayProperty.WEIGHT:
        return of(propertyValue || item.weight ? `${propertyValue || item.weight} kg` : "");
      default:
        throw Error(`Invalid property: ${property}`);
    }
  }

  getPrintablePropertyName(propertyName: TelescopeDisplayProperty, shortForm = false): string {
    switch (propertyName) {
      case TelescopeDisplayProperty.TYPE:
        return this.translateService.instant("Type");
      case TelescopeDisplayProperty.MIN_APERTURE:
        return shortForm
          ? this.translateService.instant("Min. aperture")
          : this.translateService.instant("Min. aperture") + " (mm)";
      case TelescopeDisplayProperty.MAX_APERTURE:
        return shortForm
          ? this.translateService.instant("Max. aperture")
          : this.translateService.instant("Max. aperture") + " (mm)";
      case TelescopeDisplayProperty.MIN_FOCAL_LENGTH:
        return shortForm
          ? this.translateService.instant("Min. focal length")
          : this.translateService.instant("Min. focal length") + " (mm)";
      case TelescopeDisplayProperty.MAX_FOCAL_LENGTH:
        return shortForm
          ? this.translateService.instant("Max. focal length")
          : this.translateService.instant("Max. focal length") + " (mm)";
      case TelescopeDisplayProperty.WEIGHT:
        return shortForm ? this.translateService.instant("Weight") : this.translateService.instant("Weight") + " (kg)";
      default:
        throw Error(`Invalid property: ${propertyName}`);
    }
  }
}
