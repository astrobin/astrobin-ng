// tslint:disable:max-classes-per-file

import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import { EquipmentItemBaseInterface } from "@features/equipment/interfaces/equipment-item-base.interface";
import { BrandInterface } from "@features/equipment/interfaces/brand.interface";

export enum EquipmentActionTypes {
  LOAD_BRAND = "[Equipment] Load brand",
  LOAD_BRAND_SUCCESS = "[Equipment] Load brand success",
  FIND_ALL = "[Equipment] Find all",
  FIND_ALL_SUCCESS = "[Equipment] Find all success"
}

export class LoadBrand implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.LOAD_BRAND;

  constructor(public payload: { id: BrandInterface["id"] }) {}
}

export class LoadBrandSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.LOAD_BRAND_SUCCESS;

  constructor(public payload: { brand: BrandInterface }) {}
}

export class FindAll implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FIND_ALL;

  constructor(public payload: { q: string }) {}
}

export class FindAllSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FIND_ALL_SUCCESS;

  constructor(public payload: { items: EquipmentItemBaseInterface[] }) {}
}

export type EquipmentActions = LoadBrand | LoadBrandSuccess | FindAll | FindAllSuccess;
