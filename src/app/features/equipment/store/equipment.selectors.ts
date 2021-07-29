import { EquipmentState } from "@features/equipment/store/equipment.reducer";
import { State } from "@app/store/state";
import { createSelector } from "@ngrx/store";
import { EquipmentItemBaseInterface } from "@features/equipment/interfaces/equipment-item-base.interface";

export const selectEquipment = (state: State): EquipmentState => state.equipment;

export const selectEquipmentItems = createSelector(selectEquipment, state => state.equipmentItems);

export const selectEquipmentItem = createSelector(
  selectEquipmentItems,
  (items: EquipmentItemBaseInterface[], id: number) => {
    const matching = items.filter(item => item.id === id);
    return matching.length > 0 ? matching[0] : null;
  }
);
