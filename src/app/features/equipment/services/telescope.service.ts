import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { EquipmentItemServiceInterface } from "@features/equipment/services/equipment-item.service-interface";
import { TelescopeInterface, TelescopeType } from "@features/equipment/types/telescope.interface";
import { TranslateService } from "@ngx-translate/core";
import { Observable, of } from "rxjs";

export enum TelescopeDisplayProperty {
  TYPE = "TYPE",
  APERTURE = "APERTURE",
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
    const map = {
      [TelescopeType.REFRACTOR_ACHROMATIC]: this.translateService.instant("Refractor: achromatic"),
      [TelescopeType.REFRACTOR_SEMI_APOCHROMATIC]: this.translateService.instant("Refractor: semi-apochromatic"),
      [TelescopeType.REFRACTOR_APOCHROMATIC]: this.translateService.instant("Refractor: apochromatic"),
      [TelescopeType.REFRACTOR_NON_ACHROMATIC_GALILEAN]: this.translateService.instant(
        "Refractor: non-achromatic Galilean"
      ),
      [TelescopeType.REFRACTOR_NON_ACHROMATIC_KEPLERIAN]: this.translateService.instant(
        "Refractor: non-acrhmatic Keplerian"
      ),
      [TelescopeType.REFRACTOR_SUPERACHROMAT]: this.translateService.instant("Refractor: superachromat"),
      [TelescopeType.REFRACTOR_PETZVAL]: this.translateService.instant("Refractor: Petzval"),

      [TelescopeType.REFLECTOR_DALL_KIRKHAM]: this.translateService.instant("Reflector: Dall-Kirkham"),
      [TelescopeType.REFLECTOR_NASMYTH]: this.translateService.instant("Reflector: Nasmyth"),
      [TelescopeType.REFLECTOR_RITCHEY_CHRETIEN]: this.translateService.instant("Reflector: Ritchey Chretien"),
      [TelescopeType.REFLECTOR_GREGORIAN]: this.translateService.instant("Reflector: Gregorian"),
      [TelescopeType.REFLECTOR_HERSCHELLIAN]: this.translateService.instant("Reflector: Herschellian"),
      [TelescopeType.REFLECTOR_NEWTONIAN]: this.translateService.instant("Reflector: Newtonian"),
      [TelescopeType.REFLECTOR_DOBSONIAN]: this.translateService.instant("Reflector: Dobsonian"),

      [TelescopeType.CATADIOPTRIC_ARGUNOV_CASSEGRAIN]: this.translateService.instant(
        "Catadioptric: Argunov-Cassegrain"
      ),
      [TelescopeType.CATADIOPTRIC_KLEVTSOV_CASSEGRAIN]: this.translateService.instant(
        "Catadioptric: Klevtsov-Cassegrain"
      ),
      [TelescopeType.CATADIOPTRIC_LURIE_HOUGHTON]: this.translateService.instant("Catadioptric: Lurie-Houghton"),
      [TelescopeType.CATADIOPTRIC_MAKSUTOV]: this.translateService.instant("Catadioptric: Maksutov"),
      [TelescopeType.CATADIOPTRIC_MAKSUTOV_CASSEGRAIN]: this.translateService.instant(
        "Catadioptric: Maksutov-Cassegrain"
      ),
      [TelescopeType.CATADIOPTRIC_MODIFIED_DALL_KIRKHAM]: this.translateService.instant(
        "Catadioptric: modified Dall-Kirkham"
      ),
      [TelescopeType.CATADIOPTRIC_SCHMIDT_CAMERA]: this.translateService.instant("Catadioptric: Schmidt camera"),
      [TelescopeType.CATADIOPTRIC_SCHMIDT_CASSEGRAIN]: this.translateService.instant(
        "Catadioptric: Schmidt-Cassegrain"
      ),
      [TelescopeType.CATADIOPTRIC_ACF_SCHMIDT_CASSEGRAIN]: this.translateService.instant(
        "Catadioptric: ACF Schmidt-Cassegrain"
      ),
      [TelescopeType.CATADIOPTRIC_ROWE_ACKERMAN_SCHMIDT]: this.translateService.instant(
        "Catadioptric: Rowe-Atkinson Schmidt astrograph"
      ),
      [TelescopeType.CATADIOPTRIC_RICCARDI_HONDERS]: this.translateService.instant("Catadioptric: Riccardi-Honders"),
      [TelescopeType.CATADIOPTRIC_MODIFIED_HARMER_WYNNE]: this.translateService.instant(
        "Catadioptric: modified Harmer-Wynne"
      ),

      [TelescopeType.CAMERA_LENS]: this.translateService.instant("Camera lens"),
      [TelescopeType.BINOCULARS]: this.translateService.instant("Binoculars")
    };

    return map[type];
  }

  getSupportedPrintableProperties(): string[] {
    return [
      TelescopeDisplayProperty.TYPE,
      TelescopeDisplayProperty.APERTURE,
      TelescopeDisplayProperty.FOCAL_LENGTH,
      TelescopeDisplayProperty.MIN_FOCAL_LENGTH,
      TelescopeDisplayProperty.MAX_FOCAL_LENGTH,
      TelescopeDisplayProperty.WEIGHT
    ];
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
        propertyValue = parseFloat(propertyValue);
        return of(propertyValue || item.aperture ? `${propertyValue || item.aperture} mm` : "");
      case TelescopeDisplayProperty.FOCAL_LENGTH:
        if (!!propertyValue) {
          propertyValue.minFocalLength = parseFloat(propertyValue.minFocalLength);
          propertyValue.maxFocalLength = parseFloat(propertyValue.maxFocalLength);
          return of(
            propertyValue.minFocalLength === propertyValue.maxFocalLength
              ? `${propertyValue.minFocalLength} mm`
              : `${propertyValue.minFocalLength} - ${propertyValue.maxFocalLength} mm`
          );
        }

        if (item.minFocalLength === null || item.maxFocalLength === null) {
          return of(null);
        }

        return of(
          item.minFocalLength === item.maxFocalLength
            ? `${item.minFocalLength} mm`
            : `${item.minFocalLength} - ${item.maxFocalLength} mm`
        );
      case TelescopeDisplayProperty.MIN_FOCAL_LENGTH:
        propertyValue = parseFloat(propertyValue);
        return of(propertyValue || item.minFocalLength ? `${propertyValue || item.minFocalLength} mm` : "");
      case TelescopeDisplayProperty.MAX_FOCAL_LENGTH:
        propertyValue = parseFloat(propertyValue);
        return of(propertyValue || item.maxFocalLength ? `${propertyValue || item.maxFocalLength} mm` : "");
      case TelescopeDisplayProperty.WEIGHT:
        propertyValue = parseFloat(propertyValue);
        return of(propertyValue || item.weight ? `${propertyValue || item.weight} kg` : "");
      default:
        throw Error(`Invalid property: ${property}`);
    }
  }

  getPrintablePropertyName(propertyName: TelescopeDisplayProperty, shortForm = false): string {
    switch (propertyName) {
      case TelescopeDisplayProperty.TYPE:
        return this.translateService.instant("Type");
      case TelescopeDisplayProperty.APERTURE:
        return shortForm
          ? this.translateService.instant("Aperture")
          : this.translateService.instant("Aperture") + " (mm)";
      case TelescopeDisplayProperty.FOCAL_LENGTH:
        return shortForm
          ? this.translateService.instant("Focal length")
          : this.translateService.instant("Focal length") + " (mm)";
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
