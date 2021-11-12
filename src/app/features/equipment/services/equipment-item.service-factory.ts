import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { CameraService } from "@features/equipment/services/camera.service";
import { SensorService } from "@features/equipment/services/sensor.service";
import { TelescopeService } from "@features/equipment/services/telescope.service";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { getEquipmentItemType } from "@features/equipment/store/equipment.selectors";
import { EquipmentItemServiceInterface } from "@features/equipment/services/equipment-item.service-interface";
import { MountService } from "@features/equipment/services/mount.service";

@Injectable({
  providedIn: "root"
})
export class EquipmentItemServiceFactory extends BaseService {
  constructor(
    public readonly loadingService: LoadingService,
    public readonly cameraService: CameraService,
    public readonly sensorService: SensorService,
    public readonly telescopeService: TelescopeService,
    public readonly mountService: MountService
  ) {
    super(loadingService);
  }

  getServiceByType(type: EquipmentItemType): EquipmentItemServiceInterface {
    // TODO: complete
    switch (type) {
      case EquipmentItemType.CAMERA:
        return this.cameraService;
      case EquipmentItemType.SENSOR:
        return this.sensorService;
      case EquipmentItemType.TELESCOPE:
        return this.telescopeService;
      case EquipmentItemType.MOUNT:
        return this.mountService;
    }

    throw Error("Invalid type");
  }

  getService(item: EquipmentItemBaseInterface): EquipmentItemServiceInterface {
    return this.getServiceByType(this._getType(item));
  }

  private _getType(item: EquipmentItemBaseInterface): EquipmentItemType {
    return getEquipmentItemType(item);
  }
}
