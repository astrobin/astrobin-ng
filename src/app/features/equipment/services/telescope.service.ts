import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { EquipmentItemServiceInterface } from "@features/equipment/services/equipment-item.service-interface";
import { TelescopeInterface } from "@features/equipment/interfaces/telescope.interface";

export enum TelescopeDisplayProperty {
  TYPE,
  APERTURE,
  FOCAL_LENGHT,
  WEIGHT
}

@Injectable({
  providedIn: "root"
})
export class TelescopeService extends BaseService implements EquipmentItemServiceInterface {
  constructor(public readonly loadingService: LoadingService) {
    super(loadingService);
  }

  getPrintableProperty(item: TelescopeInterface, property: TelescopeDisplayProperty): string {
    switch (property) {
      case TelescopeDisplayProperty.TYPE:
        return item.type;
      case TelescopeDisplayProperty.APERTURE:
        return item.minAperture === item.maxAperture
          ? `${item.maxAperture} mm`
          : `${item.minAperture} - ${item.maxAperture} mm`;
      case TelescopeDisplayProperty.FOCAL_LENGHT:
        return item.minFocalLength === item.maxFocalLength
          ? `${item.maxFocalLength} mm`
          : `${item.minFocalLength} - ${item.maxFocalLength} mm`;
      case TelescopeDisplayProperty.WEIGHT:
        return item.weight ? `${item.weight} kg` : "";
      default:
        throw Error(`Invalid property: ${property}`);
    }
  }
}
