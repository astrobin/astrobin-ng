import { EquipmentState } from "@features/equipment/store/equipment.reducer";
import { State } from "@app/store/state";
import { createSelector } from "@ngrx/store";
import {
  EquipmentItemBaseInterface,
  EquipmentItemType
} from "@features/equipment/interfaces/equipment-item-base.interface";
import { BrandInterface } from "@features/equipment/interfaces/brand.interface";
import { getEquipmentItemType } from "@features/equipment/services/equipment-item.service";
import { EditProposalInterface } from "@features/equipment/interfaces/edit-proposal.interface";

export const selectEquipment = (state: State): EquipmentState => state.equipment;

export const selectBrands = createSelector(selectEquipment, state => state.brands);

export const selectBrand = createSelector(selectBrands, (brands: BrandInterface[], id: number) => {
  const matching = brands.filter(brand => brand.id === id);
  return matching.length > 0 ? matching[0] : null;
});

export const selectEquipmentItems = createSelector(selectEquipment, state => state.equipmentItems);

export const selectEquipmentItem = createSelector(
  selectEquipmentItems,
  (items: EquipmentItemBaseInterface[], data: { id: number; type: EquipmentItemType }) => {
    const matching = items.filter(item => {
      const itemType = getEquipmentItemType(item);
      return item.id === data.id && itemType === data.type;
    });
    return matching.length > 0 ? matching[0] : null;
  }
);

export const selectEditProposals = createSelector(selectEquipment, state => state.editProposals);

export const selectEditProposalsForItem = createSelector(
  selectEditProposals,
  (editProposals: EditProposalInterface<EquipmentItemBaseInterface>[], item: EquipmentItemBaseInterface) => {
    const type: EquipmentItemType = getEquipmentItemType(item);
    return editProposals.filter(editProposal => {
      const thisType: EquipmentItemType = getEquipmentItemType(editProposal);
      return item.id === editProposal.editProposalTarget && type === thisType;
    });
  }
);
