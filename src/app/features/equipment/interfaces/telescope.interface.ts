import { EquipmentItemBaseInterface } from "@features/equipment/interfaces/equipment-item-base.interface";
import { SensorInterface } from "@features/equipment/interfaces/sensor.interface";

// TODO
export enum TelescopeType {
  REFRACTORS_ACHROMATIC = "REFRACTORS_ACHROMATIC"
}

export interface TelescopeInterface extends EquipmentItemBaseInterface {
  type: TelescopeType;
  minAperture?: number;
  maxAperture?: number;
  minFocalLength?: number;
  maxFocalLength?: number;
  weight?: number;
}

export function instanceOfTelescope(object: EquipmentItemBaseInterface): object is TelescopeInterface {
  return "minAperture" in object;
}
