import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { EquipmentItemServiceInterface } from "@features/equipment/services/equipment-item.service-interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { CameraInterface } from "@features/equipment/interfaces/camera.interface";

export enum CameraDisplayProperty {
  COOLED,
  MAX_COOLING,
  BACK_FOCUS
}

@Injectable({
  providedIn: "root"
})
export class CameraService extends BaseService implements EquipmentItemServiceInterface {
  constructor(public readonly loadingService: LoadingService, public readonly utilsService: UtilsService) {
    super(loadingService);
  }

  getPrintableProperty(item: CameraInterface, property: CameraDisplayProperty): string {
    switch (property) {
      case CameraDisplayProperty.COOLED:
        return this.utilsService.yesNo(item.cooled);
      case CameraDisplayProperty.MAX_COOLING:
        return item.maxCooling ? `${item.maxCooling} &deg;C` : "";
      case CameraDisplayProperty.BACK_FOCUS:
        return item.backFocus ? `${item.backFocus} mm` : "";
      default:
        throw Error(`Invalid property: ${property}`);
    }
  }
}
