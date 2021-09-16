import { EquipmentItemBaseInterface } from "@features/equipment/interfaces/equipment-item-base.interface";

export interface EditProposalInterface<T extends EquipmentItemBaseInterface> extends EquipmentItemBaseInterface {
  editProposalTarget: T["id"];
}
