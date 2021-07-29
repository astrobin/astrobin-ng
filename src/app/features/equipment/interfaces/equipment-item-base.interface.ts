import { UserInterface } from "@shared/interfaces/user.interface";
import { CameraInterface, instanceOfCamera } from "@features/equipment/interfaces/camera.interface";
import { instanceOfSensor } from "@features/equipment/interfaces/sensor.interface";

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
  brand: number;
  name: string;
  image?: string;
}

export function equipmentItemType(object: EquipmentItemBaseInterface): EquipmentItemType | undefined {
  if (instanceOfSensor(object)) {
    return EquipmentItemType.SENSOR;
  }

  if (instanceOfCamera(object)) {
    return EquipmentItemType.CAMERA;
  }
}
