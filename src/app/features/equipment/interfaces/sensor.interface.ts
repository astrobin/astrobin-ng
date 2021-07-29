import { EquipmentItemBaseInterface } from "@features/equipment/interfaces/equipment-item-base.interface";

export enum CameraType {}

export enum ColorOrMono {
  C = "C",
  M = "M"
}

export interface SensorInterface extends EquipmentItemBaseInterface {
  quantumEfficiency: number;
  pixelSize: number;
  pixelWidth: number;
  pixelHeight: number;
  sensorWidth: number;
  sensorHeight: number;
  fullWellCapacity: number;
  readNoise: number;
  frameRate: number;
  adc: number;
  colorOrMono: ColorOrMono;
}

export function instanceOfSensor(object: EquipmentItemBaseInterface): object is SensorInterface {
  return "quantumEfficiency" in object;
}
