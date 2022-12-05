import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SoftwareInterface extends EquipmentItemBaseInterface {
}

export function instanceOfSoftware(object: EquipmentItemBaseInterface): object is SoftwareInterface {
  return !!object && object.klass === EquipmentItemType.SOFTWARE;
}
