import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { CameraInterface } from "@features/equipment/types/camera.interface";

export enum ColorOrMono {
  C = "C",
  M = "M"
}

export interface SensorInterface extends EquipmentItemBaseInterface {
  quantumEfficiency?: number;
  pixelSize?: number;
  pixelWidth: number;
  pixelHeight: number;
  sensorWidth?: number;
  sensorHeight?: number;
  fullWellCapacity?: number;
  readNoise?: number;
  frameRate?: number;
  adc?: number;
  colorOrMono?: ColorOrMono;
  cameras: CameraInterface["id"][];
}

export function instanceOfSensor(object: EquipmentItemBaseInterface): object is SensorInterface {
  return !!object && object.klass === EquipmentItemType.SENSOR;
}
