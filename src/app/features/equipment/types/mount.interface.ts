import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";

export enum MountType {
  ALTAZIMUTH = "ALTAZIMUTH",
  WEDGED_ALTAZIMUTH = "WEDGED_ALTAZIMUTH",
  EQUATORIAL = "EQUATORIAL",
  GERMAN_EQUATORIAL = "GERMAN_EQUATORIAL",
  FORK = "FORK",
  DOBSONIAN = "DOBSONIAN",
  PORTABLE_ENGLISH = "PORTABLE_ENGLISH",
  STAR_TRACKER = "BARN_DOOR_TRACKER",
  ALT_ALT = "ALT_ALT",
  TRANSIT = "TRANSIT",
  HEXAPOD = "HEXAPOD",
  DUAL_ALT_AZ_EQ = "DUAL_ALT_AZ_EQ",
  TRIPOD = "TRIPOD",
  OTHER = "OTHER"
}

export interface MountInterface extends EquipmentItemBaseInterface {
  type: MountType;
  weight: number;
  maxPayload: number;
  computerized: boolean;
  trackingAccuracy: number;
  pec: boolean;
  slewSpeed: number;
}

export function instanceOfMount(object: EquipmentItemBaseInterface): object is MountInterface {
  return !!object && object.klass === EquipmentItemType.MOUNT;
}
