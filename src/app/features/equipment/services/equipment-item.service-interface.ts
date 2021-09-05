import { EquipmentItemBaseInterface } from "@features/equipment/interfaces/equipment-item-base.interface";

export interface EquipmentItemServiceInterface {
  getPrintableProperty(item: EquipmentItemBaseInterface, property: any): string;
}
