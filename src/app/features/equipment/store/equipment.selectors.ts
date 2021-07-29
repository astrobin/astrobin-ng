import { EquipmentState } from "@features/equipment/store/equipment.reducer";
import { State } from "@app/store/state";
import { createSelector } from "@ngrx/store";
import { EquipmentItemBaseInterface } from "@features/equipment/interfaces/equipment-item-base.interface";
import { BrandInterface } from "@features/equipment/interfaces/brand.interface";

export const selectEquipment = (state: State): EquipmentState => state.equipment;

export const selectBrands = createSelector(selectEquipment, state => state.brands);

export const selectBrand = createSelector(selectBrands, (brands: BrandInterface[], id: number) => {
  const matching = brands.filter(brand => brand.id === id);
  return matching.length > 0 ? matching[0] : null;
});

export const selectEquipmentItems = createSelector(selectEquipment, state => state.equipmentItems);

export const selectEquipmentItem = createSelector(
  selectEquipmentItems,
  (items: EquipmentItemBaseInterface[], id: number) => {
    const matching = items.filter(item => item.id === id);
    return matching.length > 0 ? matching[0] : null;
  }
);
