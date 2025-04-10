import type { EquipmentItemBaseInterface } from "@features/equipment/types/equipment-item-base.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";

export interface SoftwareInterface extends EquipmentItemBaseInterface {}

export function instanceOfSoftware(object: EquipmentItemBaseInterface): object is SoftwareInterface {
  return !!object && object.klass === EquipmentItemType.SOFTWARE;
}
