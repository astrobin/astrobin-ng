import { EquipmentActions } from "./equipment.actions";

export const equipmentFeatureKey = "equipment";

// tslint:disable-next-line:no-empty-interface
export interface EquipmentState {}

export const initialEquipmentState: EquipmentState = {};

export function reducer(state = initialEquipmentState, action: EquipmentActions): EquipmentState {
  return state;
}
