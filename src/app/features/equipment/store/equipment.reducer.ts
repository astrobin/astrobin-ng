import { EquipmentActions, EquipmentActionTypes } from "./equipment.actions";
import { EquipmentItemBaseInterface } from "@features/equipment/interfaces/equipment-item-base.interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { BrandInterface } from "@features/equipment/interfaces/brand.interface";

export const equipmentFeatureKey = "equipment";

// tslint:disable-next-line:no-empty-interface
export interface EquipmentState {
  brands: BrandInterface[];
  equipmentItems: EquipmentItemBaseInterface[];
}

export const initialEquipmentState: EquipmentState = {
  brands: [],
  equipmentItems: []
};

export function reducer(state = initialEquipmentState, action: EquipmentActions): EquipmentState {
  switch (action.type) {
    case EquipmentActionTypes.LOAD_BRAND_SUCCESS:
    case EquipmentActionTypes.CREATE_BRAND_SUCCESS: {
      return {
        ...state,
        brands: UtilsService.arrayUniqueObjects([...state.brands, ...[action.payload.brand]])
      };
    }

    case EquipmentActionTypes.FIND_ALL_BRANDS_SUCCESS: {
      return {
        ...state,
        brands: UtilsService.arrayUniqueObjects([...state.brands, ...action.payload.brands])
      };
    }

    case EquipmentActionTypes.FIND_ALL_EQUIPMENT_ITEMS_SUCCESS:
    case EquipmentActionTypes.FIND_SIMILAR_IN_BRAND_SUCCESS:
    case EquipmentActionTypes.GET_OTHERS_IN_BRAND_SUCCESS: {
      return {
        ...state,
        equipmentItems: UtilsService.arrayUniqueObjects([...state.equipmentItems, ...action.payload.items])
      };
    }

    case EquipmentActionTypes.APPROVE_EQUIPMENT_ITEM_SUCCESS:
    case EquipmentActionTypes.REJECT_EQUIPMENT_ITEM_SUCCESS:
    case EquipmentActionTypes.CREATE_SENSOR_SUCCESS:
    case EquipmentActionTypes.CREATE_CAMERA_SUCCESS:
    case EquipmentActionTypes.LOAD_SENSOR_SUCCESS: {
      return {
        ...state,
        equipmentItems: UtilsService.arrayUniqueObjects([...state.equipmentItems, ...[action.payload.item]])
      };
    }

    default: {
      return state;
    }
  }
}
