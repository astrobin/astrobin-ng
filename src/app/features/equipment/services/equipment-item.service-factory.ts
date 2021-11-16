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
import { FilterService } from "@features/equipment/services/filter.service";
import { AccessoryService } from "@features/equipment/services/accessory.service";
import { SoftwareService } from "@features/equipment/services/software.service";

@Injectable({
  providedIn: "root"
})
export class EquipmentItemServiceFactory extends BaseService {
  constructor(
    public readonly loadingService: LoadingService,
    public readonly cameraService: CameraService,
    public readonly sensorService: SensorService,
    public readonly telescopeService: TelescopeService,
    public readonly mountService: MountService,
    public readonly filterService: FilterService,
    public readonly accessoryService: AccessoryService,
    public readonly softwareService: SoftwareService
  ) {
    super(loadingService);
  }

  getServiceByType(type: EquipmentItemType): EquipmentItemServiceInterface {
    switch (type) {
      case EquipmentItemType.CAMERA:
        return this.cameraService;
      case EquipmentItemType.SENSOR:
        return this.sensorService;
      case EquipmentItemType.TELESCOPE:
        return this.telescopeService;
      case EquipmentItemType.MOUNT:
        return this.mountService;
      case EquipmentItemType.FILTER:
        return this.filterService;
      case EquipmentItemType.ACCESSORY:
        return this.accessoryService;
      case EquipmentItemType.SOFTWARE:
        return this.softwareService;
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
