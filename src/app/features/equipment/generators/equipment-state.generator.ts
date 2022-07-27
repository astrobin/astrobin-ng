import { EquipmentState } from "@features/equipment/store/equipment.reducer";

export class EquipmentStateGenerator {
  static default(): EquipmentState {
    return {
      brands: [],
      brandsCount: 0,
      equipmentItems: [],
      editProposals: [],
      presets: [],
      usersUsingEquipmentItems: [],
      usersUsingEquipmentBrands: [],
      mostOftenUsedWithData: {},
      contributors: []
    };
  }
}
