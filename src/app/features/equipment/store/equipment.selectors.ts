import { EquipmentState } from "@features/equipment/store/equipment.reducer";
import { State } from "@app/store/state";
import { createSelector } from "@ngrx/store";
import {
  EquipmentItemBaseInterface,
  EquipmentItemType
} from "@features/equipment/interfaces/equipment-item-base.interface";
import { BrandInterface } from "@features/equipment/interfaces/brand.interface";
import { EditProposalInterface } from "@features/equipment/interfaces/edit-proposal.interface";
import { instanceOfSensor } from "@features/equipment/interfaces/sensor.interface";
import { instanceOfCamera } from "@features/equipment/interfaces/camera.interface";
import { instanceOfTelescope } from "@features/equipment/interfaces/telescope.interface";

export function getEquipmentItemType(item: EquipmentItemBaseInterface): EquipmentItemType {
  if (instanceOfSensor(item)) {
    return EquipmentItemType.SENSOR;
  }

  if (instanceOfCamera(item)) {
    return EquipmentItemType.CAMERA;
  }

  if (instanceOfTelescope(item)) {
    return EquipmentItemType.TELESCOPE;
  }

  // TODO: complete.
}

export function arrayUniqueEquipmentItems(array: EquipmentItemBaseInterface[]): EquipmentItemBaseInterface[] {
  // The array is reverser because this algorithm prefers to keep the object appearing later in the array.
  const a: EquipmentItemBaseInterface[] = array.concat().reverse();

  for (let i = 0; i < a.length; ++i) {
    for (let j = i + 1; j < a.length; ++j) {
      if (a[i].id === a[j].id && getEquipmentItemType(a[i]) === getEquipmentItemType(a[j])) {
        a.splice(j--, 1);
      }
    }
  }

  return a;
}

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
