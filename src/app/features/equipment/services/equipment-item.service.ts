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
import { TranslateService } from "@ngx-translate/core";

export function getEquipmentItemType(item: EquipmentItemBaseInterface) {
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

@Injectable({
  providedIn: "root"
})
export class EquipmentItemService extends BaseService {
  constructor(
    public readonly loadingService: LoadingService,
    public readonly utilsService: UtilsService,
    public readonly translateService: TranslateService
  ) {
    super(loadingService);
  }

  getType(item: EquipmentItemBaseInterface): EquipmentItemType {
    return getEquipmentItemType(item);
  }

  humanizeType(type: EquipmentItemType) {
    switch (type) {
      case EquipmentItemType.CAMERA:
        return this.translateService.instant("Camera");
      case EquipmentItemType.SENSOR:
        return this.translateService.instant("Sensor");
      case EquipmentItemType.TELESCOPE:
        return this.translateService.instant("Telescope");
    }
  }
}
