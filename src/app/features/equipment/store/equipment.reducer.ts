import { EquipmentActions, EquipmentActionTypes } from "./equipment.actions";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { BrandInterface } from "@features/equipment/types/brand.interface";
import { EditProposalInterface } from "@features/equipment/types/edit-proposal.interface";
import { arrayUniqueEquipmentItems, getEquipmentItemType } from "@features/equipment/store/equipment.selectors";
import { CameraInterface } from "@features/equipment/types/camera.interface";

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
        brands: UtilsService.arrayUniqueObjects([...state.brands, ...[action.payload.brand]], "id")
      };
    }

    case EquipmentActionTypes.FIND_ALL_BRANDS_SUCCESS: {
      return {
        ...state,
        brands: UtilsService.arrayUniqueObjects([...state.brands, ...action.payload.brands], "id")
      };
    }

    case EquipmentActionTypes.FIND_ALL_EQUIPMENT_ITEMS_SUCCESS:
    case EquipmentActionTypes.FIND_SIMILAR_IN_BRAND_SUCCESS:
    case EquipmentActionTypes.GET_OTHERS_IN_BRAND_SUCCESS: {
      return {
        ...state,
        equipmentItems: arrayUniqueEquipmentItems([...state.equipmentItems, ...action.payload.items])
      };
    }

    case EquipmentActionTypes.LOAD_EQUIPMENT_ITEM_SUCCESS:
    case EquipmentActionTypes.APPROVE_EQUIPMENT_ITEM_SUCCESS:
    case EquipmentActionTypes.CREATE_SENSOR_SUCCESS:
    case EquipmentActionTypes.CREATE_CAMERA_SUCCESS:
    case EquipmentActionTypes.CREATE_TELESCOPE_SUCCESS:
    case EquipmentActionTypes.CREATE_MOUNT_SUCCESS:
    case EquipmentActionTypes.CREATE_FILTER_SUCCESS:
    case EquipmentActionTypes.CREATE_ACCESSORY_SUCCESS:
    case EquipmentActionTypes.CREATE_SOFTWARE_SUCCESS:
    case EquipmentActionTypes.LOAD_SENSOR_SUCCESS: {
      return {
        ...state,
        equipmentItems: arrayUniqueEquipmentItems([...state.equipmentItems, ...[action.payload.item]])
      };
    }

    case EquipmentActionTypes.REJECT_EQUIPMENT_ITEM_SUCCESS: {
      const rejectedItem = action.payload.item;
      let equipmentItems = arrayUniqueEquipmentItems([...state.equipmentItems, ...[rejectedItem]]);

      if (rejectedItem.klass === EquipmentItemType.SENSOR) {
        // Update cameras that used to have this sensors.
        equipmentItems = equipmentItems.map(equipmentItem => {
          if (
            equipmentItem.klass === EquipmentItemType.CAMERA &&
            (equipmentItem as CameraInterface).sensor === rejectedItem.id
          ) {
            (equipmentItem as CameraInterface).sensor = null;
          }

          return equipmentItem;
        });
      }

      return {
        ...state,
        equipmentItems
      };
    }

    case EquipmentActionTypes.CREATE_SENSOR_EDIT_PROPOSAL_SUCCESS:
    case EquipmentActionTypes.CREATE_CAMERA_EDIT_PROPOSAL_SUCCESS:
    case EquipmentActionTypes.CREATE_TELESCOPE_EDIT_PROPOSAL_SUCCESS:
    case EquipmentActionTypes.CREATE_MOUNT_EDIT_PROPOSAL_SUCCESS:
    case EquipmentActionTypes.CREATE_FILTER_EDIT_PROPOSAL_SUCCESS:
    case EquipmentActionTypes.CREATE_ACCESSORY_EDIT_PROPOSAL_SUCCESS:
    case EquipmentActionTypes.CREATE_SOFTWARE_EDIT_PROPOSAL_SUCCESS:
    case EquipmentActionTypes.REJECT_EQUIPMENT_ITEM_EDIT_PROPOSAL_SUCCESS: {
      return {
        ...state,
        editProposals: (arrayUniqueEquipmentItems([
          ...state.editProposals,
          ...[action.payload.editProposal]
        ]) as EditProposalInterface<EquipmentItemBaseInterface>[]).sort(
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

    case EquipmentActionTypes.APPROVE_EQUIPMENT_ITEM_EDIT_PROPOSAL_SUCCESS: {
      return {
        ...state,
        equipmentItems: state.equipmentItems.filter(item => {
          return (
            item.id !== action.payload.editProposal.editProposalTarget &&
            getEquipmentItemType(item) !== getEquipmentItemType(action.payload.editProposal)
          );
        }),
        editProposals: (arrayUniqueEquipmentItems([
          ...state.editProposals,
          ...[action.payload.editProposal]
        ]) as EditProposalInterface<EquipmentItemBaseInterface>[]).sort(
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
        editProposals: UtilsService.arrayUniqueObjects(
          [...state.editProposals, ...action.payload.editProposals.results],
          "id"
        )
      };
    }

    default: {
      return state;
    }
  }
}
