import { EquipmentItemBaseInterface } from "@features/equipment/types/equipment-item-base.interface";

export enum ColorOrMono {
  M = "M",
  C = "C",
  MC = "MC"
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
  specificationUrl?: string;
}

export function instanceOfSensor(object: EquipmentItemBaseInterface): object is SensorInterface {
  return !!object && "pixelWidth" in object && "pixelHeight" in object;
}
