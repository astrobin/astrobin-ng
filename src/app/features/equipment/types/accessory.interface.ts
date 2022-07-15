import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";

export enum AccessoryType {
  COMPUTER = "COMPUTER",
  DEW_MITIGATION = "DEW_MITIGATION",
  FIELD_DEROTATOR = "FIELD_DEROTATOR",
  FILTER_WHEEL = "FILTER_WHEEL",
  FLAT_BOX = "FLAT_BOX",
  FOCAL_MODIFIED_FIELD_CORRECTOR = "FOCAL_MODIFIED_FIELD_CORRECTOR",
  FOCUSER = "FOCUSER",
  OAG = "OAG",
  OBSERVATORY_CONTROL = "OBSERVATORY_CONTROL",
  OBSERVATORY_DOME = "OBSERVATORY_DOME",
  POWER_DISTRIBUTION = "POWER_DISTRIBUTION",
  WEATHER_MONITORING = "WEATHER_MONITORING",
  OTHER = "OTHER"
}

export interface AccessoryInterface extends EquipmentItemBaseInterface {
  type: AccessoryType;
}

export function instanceOfAccessory(object: EquipmentItemBaseInterface): object is AccessoryInterface {
  return !!object && object.klass === EquipmentItemType.ACCESSORY;
}
