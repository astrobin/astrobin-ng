import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";

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
}

export function instanceOfSensor(object: EquipmentItemBaseInterface): object is SensorInterface {
  return !!object && object.klass === EquipmentItemType.SENSOR;
}
