import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";

// tslint:disable-next-line:no-empty-interface
export interface SoftwareInterface extends EquipmentItemBaseInterface {}

export function instanceOfSoftware(object: EquipmentItemBaseInterface): object is SoftwareInterface {
  return !!object && object.klass === EquipmentItemType.SOFTWARE;
}
