// tslint:disable:max-classes-per-file

import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import { EquipmentItemBaseInterface } from "@features/equipment/interfaces/equipment-item-base.interface";

export enum EquipmentActionTypes {
  FIND_ALL = "[Equipment] Find all",
  FIND_ALL_SUCCESS = "[Equipment] Find all success"
}

export class FindAll implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FIND_ALL;

  constructor(public payload: { q: string }) {}
}

export class FindAllSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FIND_ALL_SUCCESS;

  constructor(public payload: { items: EquipmentItemBaseInterface[] }) {}
}

export type EquipmentActions = FindAll | FindAllSuccess;
