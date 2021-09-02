import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { EquipmentItemServiceInterface } from "@features/equipment/services/equipment-item.service-interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { CameraInterface } from "@features/equipment/interfaces/camera.interface";

@Injectable({
  providedIn: "root"
})
export class CameraService extends BaseService implements EquipmentItemServiceInterface {
  constructor(public readonly loadingService: LoadingService, public readonly utilsService: UtilsService) {
    super(loadingService);
  }

  getPrintableProperty(item: CameraInterface, property: string): string {
    switch (property) {
      case "cooled":
        return this.utilsService.yesNo(item.cooled);
      case "maxCooling":
        return item.maxCooling ? `${item.maxCooling} &deg;C` : "";
      case "backFocus":
        return item.backFocus ? `${item.backFocus} mm` : "";
      default:
        throw Error(`Invalid property: ${property}`);
    }
  }
}
