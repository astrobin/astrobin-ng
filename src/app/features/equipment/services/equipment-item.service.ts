import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import {
  EquipmentItemBaseInterface,
  EquipmentItemType
} from "@features/equipment/interfaces/equipment-item-base.interface";
import { instanceOfSensor } from "@features/equipment/interfaces/sensor.interface";
import { instanceOfCamera } from "@features/equipment/interfaces/camera.interface";
import { instanceOfTelescope } from "@features/equipment/interfaces/telescope.interface";

@Injectable({
  providedIn: "root"
})
export class EquipmentItemService extends BaseService {
  constructor(public readonly loadingService: LoadingService, public readonly utilsService: UtilsService) {
    super(loadingService);
  }

  getType(item: EquipmentItemBaseInterface): EquipmentItemType {
    if (instanceOfSensor(item)) {
      return EquipmentItemType.SENSOR;
    }

    if (instanceOfCamera(item)) {
      return EquipmentItemType.CAMERA;
    }

    if (instanceOfTelescope(item)) {
      return EquipmentItemType.TELESCOPE;
    }

    // TODO: complete.
  }
}
