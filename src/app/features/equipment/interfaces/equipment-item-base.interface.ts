import { UserInterface } from "@shared/interfaces/user.interface";
import { CameraInterface, instanceOfCamera } from "@features/equipment/interfaces/camera.interface";
import { instanceOfSensor } from "@features/equipment/interfaces/sensor.interface";
import { instanceOfTelescope, TelescopeInterface } from "@features/equipment/interfaces/telescope.interface";
import { BrandInterface } from "@features/equipment/interfaces/brand.interface";

// TODO: complete
export enum EquipmentItemType {
  SENSOR = "SENSOR",
  CAMERA = "CAMERA",
  TELESCOPE = "TELESCOPE"
}

export interface EquipmentItemBaseInterface {
  id: number;
  deleted?: string;
  created: string;
  updated: string;
  createdBy: UserInterface["id"];
  brand: BrandInterface["id"];
  name: string;
  image?: string | File[];
}

export type AnyEquipmentItemType = CameraInterface | TelescopeInterface;

export function equipmentItemType(item: EquipmentItemBaseInterface): EquipmentItemType | undefined {
  if (instanceOfSensor(item)) {
    return EquipmentItemType.SENSOR;
  }

  if (instanceOfCamera(item)) {
    return EquipmentItemType.CAMERA;
  }

  if (instanceOfTelescope(item)) {
    return EquipmentItemType.TELESCOPE;
  }
}
