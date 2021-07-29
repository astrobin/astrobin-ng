import { EquipmentItemBaseInterface } from "@features/equipment/interfaces/equipment-item-base.interface";
import { SensorInterface } from "@features/equipment/interfaces/sensor.interface";

export enum CameraType {}

export interface CameraInterface extends EquipmentItemBaseInterface {
  type: CameraType;
  sensor: SensorInterface["id"];
  cooled: boolean;
  maxCooling: number;
  backFocus: number;
}

export function instanceOfCamera(object: EquipmentItemBaseInterface): object is CameraInterface {
  return "sensor" in object;
}
