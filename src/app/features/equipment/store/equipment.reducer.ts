import { EquipmentActions, EquipmentActionTypes } from "./equipment.actions";
import { EquipmentItemBaseInterface } from "@features/equipment/interfaces/equipment-item-base.interface";
import { UtilsService } from "@shared/services/utils/utils.service";

export const equipmentFeatureKey = "equipment";

// tslint:disable-next-line:no-empty-interface
export interface EquipmentState {
  equipmentItems: EquipmentItemBaseInterface[];
}

export const initialEquipmentState: EquipmentState = {
  equipmentItems: []
};

export function reducer(state = initialEquipmentState, action: EquipmentActions): EquipmentState {
  switch (action.type) {
    case EquipmentActionTypes.FIND_ALL_SUCCESS: {
      return {
        ...state,
        equipmentItems: new UtilsService().arrayUniqueObjects([...state.equipmentItems, action.payload.items])
      };
    }

    default: {
      return state;
    }
  }
}
