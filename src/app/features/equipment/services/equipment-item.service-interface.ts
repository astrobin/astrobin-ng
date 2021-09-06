import { EquipmentItemBaseInterface } from "@features/equipment/interfaces/equipment-item-base.interface";

export interface EquipmentItemServiceInterface {
  humanizeType?(type: any);
  getPrintableProperty(item: EquipmentItemBaseInterface, property: any): string;
}
