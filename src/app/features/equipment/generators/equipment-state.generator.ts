import { EquipmentState } from "@features/equipment/store/equipment.reducer";

export class EquipmentStateGenerator {
  static default(): EquipmentState {
    return {
      brands: [],
      equipmentItems: [],
      editProposals: []
    };
  }
}
