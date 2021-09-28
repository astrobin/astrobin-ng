import { EquipmentActions, EquipmentActionTypes } from "./equipment.actions";
import { EquipmentItemBaseInterface } from "@features/equipment/interfaces/equipment-item-base.interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { BrandInterface } from "@features/equipment/interfaces/brand.interface";
import { EditProposalInterface } from "@features/equipment/interfaces/edit-proposal.interface";

export const equipmentFeatureKey = "equipment";

// tslint:disable-next-line:no-empty-interface
export interface EquipmentState {
  brands: BrandInterface[];
  equipmentItems: EquipmentItemBaseInterface[];
  editProposals: EditProposalInterface<EquipmentItemBaseInterface>[];
}

export const initialEquipmentState: EquipmentState = {
  brands: [],
  equipmentItems: [],
  editProposals: []
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

    case EquipmentActionTypes.LOAD_EQUIPMENT_ITEM_SUCCESS:
    case EquipmentActionTypes.APPROVE_EQUIPMENT_ITEM_SUCCESS:
    case EquipmentActionTypes.CREATE_SENSOR_SUCCESS:
    case EquipmentActionTypes.CREATE_CAMERA_SUCCESS:
    case EquipmentActionTypes.LOAD_SENSOR_SUCCESS: {
      return {
        ...state,
        equipmentItems: UtilsService.arrayUniqueObjects([...state.equipmentItems, ...[action.payload.item]])
      };
    }

    case EquipmentActionTypes.REJECT_EQUIPMENT_ITEM_SUCCESS: {
      return {
        ...state,
        equipmentItems: state.equipmentItems.filter(
          equipmentItem =>
            equipmentItem.id !== action.payload.item.id &&
            equipmentItem.brand !== action.payload.item.brand &&
            equipmentItem.name !== action.payload.item.name
        )
      };
    }

    case EquipmentActionTypes.CREATE_SENSOR_EDIT_PROPOSAL_SUCCESS:
    case EquipmentActionTypes.CREATE_CAMERA_EDIT_PROPOSAL_SUCCESS: {
      return {
        ...state,
        editProposals: UtilsService.arrayUniqueObjects([...state.editProposals, ...[action.payload.editProposal]]).sort(
          (
            a: EditProposalInterface<EquipmentItemBaseInterface>,
            b: EditProposalInterface<EquipmentItemBaseInterface>
          ) => {
            if (a.editProposalCreated < b.editProposalCreated) {
              return -1;
            }

            if (a.editProposalCreated > b.editProposalCreated) {
              return 1;
            }

            return 0;
          }
        )
      };
    }

    case EquipmentActionTypes.FIND_EQUIPMENT_ITEM_EDIT_PROPOSALS_SUCCESS: {
      return {
        ...state,
        editProposals: UtilsService.arrayUniqueObjects([
          ...state.editProposals,
          ...action.payload.editProposals.results
        ])
      };
    }

    default: {
      return state;
    }
  }
}
