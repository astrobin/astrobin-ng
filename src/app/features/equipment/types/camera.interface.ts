import { EquipmentItemBaseInterface } from "@features/equipment/types/equipment-item-base.interface";
import { SensorInterface } from "@features/equipment/types/sensor.interface";

export enum CameraType {
  DEDICATED_DEEP_SKY = "DEDICATED_DEEP_SKY",
  DSLR_MIRRORLESS = "DSLR_MIRRORLESS",
  GUIDER_PLANETARY = "GUIDER_PLANETARY",
  VIDEO = "VIDEO",
  FILM = "FILM",
  OTHER = "OTHER"
}

export interface CameraInterface extends EquipmentItemBaseInterface {
  type: CameraType;
  sensor: SensorInterface["id"];
  modified: boolean;
  cooled: boolean;
  maxCooling?: number;
  backFocus?: number;
}

export function instanceOfCamera(object: EquipmentItemBaseInterface): object is CameraInterface {
  return !!object && "sensor" in object;
}
