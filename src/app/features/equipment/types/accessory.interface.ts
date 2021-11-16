import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";

// tslint:disable-next-line:no-empty-interface
export interface AccessoryInterface extends EquipmentItemBaseInterface {}

export function instanceOfAccessory(object: EquipmentItemBaseInterface): object is AccessoryInterface {
  return !!object && object.klass === EquipmentItemType.ACCESSORY;
}
