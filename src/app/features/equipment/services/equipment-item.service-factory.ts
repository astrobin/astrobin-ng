import { Injectable } from "@angular/core";
import { BaseService } from "@core/services/base.service";
import type { LoadingService } from "@core/services/loading.service";
import type { AccessoryService } from "@features/equipment/services/accessory.service";
import type { CameraService } from "@features/equipment/services/camera.service";
import type { EquipmentItemServiceInterface } from "@features/equipment/services/equipment-item.service-interface";
import type { FilterService } from "@features/equipment/services/filter.service";
import type { MountService } from "@features/equipment/services/mount.service";
import type { SensorService } from "@features/equipment/services/sensor.service";
import type { SoftwareService } from "@features/equipment/services/software.service";
import type { TelescopeService } from "@features/equipment/services/telescope.service";
import { getEquipmentItemType } from "@features/equipment/store/equipment.selectors";
import type { EquipmentItemBaseInterface } from "@features/equipment/types/equipment-item-base.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";

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
