import { EquipmentState } from "@features/equipment/store/equipment.reducer";

export class EquipmentStateGenerator {
  static default(): EquipmentState {
    return {
      brands: [],
      brandsCount: 0,
      equipmentItems: [],
      editProposals: [],
      presets: [],
      mostOftenUsedWithData: {},
      contributors: [],
      marketplace: {
        lastPaginatedRequestCount: null,
        listings: null,
        privateConversations: null
      }
    };
  }
}
