import { EquipmentState } from "@features/equipment/store/equipment.reducer";
import { State } from "@app/store/state";
import { createSelector } from "@ngrx/store";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { BrandInterface } from "@features/equipment/types/brand.interface";
import { EditProposalInterface } from "@features/equipment/types/edit-proposal.interface";
import { instanceOfSensor } from "@features/equipment/types/sensor.interface";
import { instanceOfCamera } from "@features/equipment/types/camera.interface";
import { instanceOfTelescope } from "@features/equipment/types/telescope.interface";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { instanceOfMount } from "@features/equipment/types/mount.interface";
import { instanceOfFilter } from "@features/equipment/types/filter.interface";
import { instanceOfAccessory } from "@features/equipment/types/accessory.interface";
import { instanceOfSoftware } from "@features/equipment/types/software.interface";

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

  if (instanceOfMount(item)) {
    return EquipmentItemType.MOUNT;
  }

  if (instanceOfFilter(item)) {
    return EquipmentItemType.FILTER;
  }

  if (instanceOfAccessory(item)) {
    return EquipmentItemType.ACCESSORY;
  }

  if (instanceOfSoftware(item)) {
    return EquipmentItemType.SOFTWARE;
  }

  throw new Error("Unknown type");
}

export function arrayUniqueEquipmentItems(
  array: (EquipmentItemBaseInterface | EditProposalInterface<EquipmentItemBaseInterface>)[]
): (EquipmentItemBaseInterface | EditProposalInterface<EquipmentItemBaseInterface>)[] {
  // The array is reverser because this algorithm prefers to keep the object appearing later in the array.
  const a: (
    | EquipmentItemBaseInterface
    | EditProposalInterface<EquipmentItemBaseInterface>
  )[] = array.concat().reverse();

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
  (items: EquipmentItem[], data: { id: number; type: EquipmentItemType }) => {
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
