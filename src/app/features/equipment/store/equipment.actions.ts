// tslint:disable:max-classes-per-file

import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import {
  EquipmentItemBaseInterface,
  EquipmentItemReviewerRejectionReason,
  EquipmentItemType
} from "@features/equipment/types/equipment-item-base.interface";
import { BrandInterface } from "@features/equipment/types/brand.interface";
import { SensorInterface } from "@features/equipment/types/sensor.interface";
import { CameraInterface } from "@features/equipment/types/camera.interface";
import { EditProposalInterface } from "@features/equipment/types/edit-proposal.interface";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { TelescopeInterface } from "@features/equipment/types/telescope.interface";
import { MountInterface } from "@features/equipment/types/mount.interface";
import { FilterInterface } from "@features/equipment/types/filter.interface";
import { AccessoryInterface } from "@features/equipment/types/accessory.interface";

export interface EquipmentItemCreationSuccessPayloadInterface {
  item: EquipmentItemBaseInterface;
}

export enum EquipmentActionTypes {
  // Brands

  LOAD_BRAND = "[Equipment] Load brand",
  LOAD_BRAND_SUCCESS = "[Equipment] Load brand success",
  CREATE_BRAND = "[Equipment] Create brand",
  CREATE_BRAND_SUCCESS = "[Equipment] Create brand success",
  FIND_ALL_BRANDS = "[Equipment] Find all brands",
  FIND_ALL_BRANDS_SUCCESS = "[Equipment] Find all brands success",

  // Generic equipment items

  LOAD_EQUIPMENT_ITEM = "[Equipment] Load equipment item",
  LOAD_EQUIPMENT_ITEM_SUCCESS = "[Equipment] Load equipment item success",
  FIND_ALL_EQUIPMENT_ITEMS = "[Equipment] Find all equipment items",
  FIND_ALL_EQUIPMENT_ITEMS_SUCCESS = "[Equipment] Find all equipment success",
  FIND_SIMILAR_IN_BRAND = "[Equipment] Find similar in brand",
  FIND_SIMILAR_IN_BRAND_SUCCESS = "[Equipment] Find similar in brand success",
  GET_OTHERS_IN_BRAND = "[Equipment] Get others in brand",
  GET_OTHERS_IN_BRAND_SUCCESS = "[Equipment] Get others in brand success",
  APPROVE_EQUIPMENT_ITEM = "[Equipment] Approve item",
  APPROVE_EQUIPMENT_ITEM_SUCCESS = "[Equipment] Approve item success",
  REJECT_EQUIPMENT_ITEM = "[Equipment] Reject item",
  REJECT_EQUIPMENT_ITEM_SUCCESS = "[Equipment] Reject item success",
  FIND_EQUIPMENT_ITEM_EDIT_PROPOSALS = "[Equipment] Find equipment item edit proposals",
  FIND_EQUIPMENT_ITEM_EDIT_PROPOSALS_SUCCESS = "[Equipment] Find equipment item edit proposals success",
  APPROVE_EQUIPMENT_ITEM_EDIT_PROPOSAL = "[Equipment] Approve edit proposal",
  APPROVE_EQUIPMENT_ITEM_EDIT_PROPOSAL_SUCCESS = "[Equipment] Approve edit proposal success",
  REJECT_EQUIPMENT_ITEM_EDIT_PROPOSAL = "[Equipment] Reject edit proposal",
  REJECT_EQUIPMENT_ITEM_EDIT_PROPOSAL_SUCCESS = "[Equipment] Reject edit proposal success",

  // Sensors

  CREATE_SENSOR = "[Equipment] Create sensor",
  CREATE_SENSOR_SUCCESS = "[Equipment] Create sensor success",
  CREATE_SENSOR_EDIT_PROPOSAL = "[Equipment] Create sensor edit proposal",
  CREATE_SENSOR_EDIT_PROPOSAL_SUCCESS = "[Equipment] Create sensor edit proposal success",
  LOAD_SENSOR = "[Equipment] Load sensor",
  LOAD_SENSOR_SUCCESS = "[Equipment] Load sensor success",

  // Cameras

  CREATE_CAMERA = "[Equipment] Create camera",
  CREATE_CAMERA_SUCCESS = "[Equipment] Create camera success",
  CREATE_CAMERA_EDIT_PROPOSAL = "[Equipment] Create camera edit proposal",
  CREATE_CAMERA_EDIT_PROPOSAL_SUCCESS = "[Equipment] Create camera edit request proposal",

  // Telescopes

  CREATE_TELESCOPE = "[Equipment] Create telescope",
  CREATE_TELESCOPE_SUCCESS = "[Equipment] Create telescope success",
  CREATE_TELESCOPE_EDIT_PROPOSAL = "[Equipment] Create telescope edit proposal",
  CREATE_TELESCOPE_EDIT_PROPOSAL_SUCCESS = "[Equipment] Create telescope edit request proposal",

  // Mounts

  CREATE_MOUNT = "[Equipment] Create mount",
  CREATE_MOUNT_SUCCESS = "[Equipment] Create mount success",
  CREATE_MOUNT_EDIT_PROPOSAL = "[Equipment] Create mount edit proposal",
  CREATE_MOUNT_EDIT_PROPOSAL_SUCCESS = "[Equipment] Create mount edit request proposal",

  // Filters

  CREATE_FILTER = "[Equipment] Create filter",
  CREATE_FILTER_SUCCESS = "[Equipment] Create filter success",
  CREATE_FILTER_EDIT_PROPOSAL = "[Equipment] Create filter edit proposal",
  CREATE_FILTER_EDIT_PROPOSAL_SUCCESS = "[Equipment] Create filter edit request proposal",

  // Accessories

  CREATE_ACCESSORY = "[Equipment] Create accessory",
  CREATE_ACCESSORY_SUCCESS = "[Equipment] Create accessory success",
  CREATE_ACCESSORY_EDIT_PROPOSAL = "[Equipment] Create accessory edit proposal",
  CREATE_ACCESSORY_EDIT_PROPOSAL_SUCCESS = "[Equipment] Create accessory edit request proposal"
}

/**********************************************************************************************************************
 * Brands
 *********************************************************************************************************************/

export class LoadBrand implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.LOAD_BRAND;

  constructor(public payload: { id: BrandInterface["id"] }) {}
}

export class LoadBrandSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.LOAD_BRAND_SUCCESS;

  constructor(public payload: { brand: BrandInterface }) {}
}

export class CreateBrand implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_BRAND;

  constructor(public payload: { brand: Omit<BrandInterface, "id"> }) {}
}

export class CreateBrandSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_BRAND_SUCCESS;

  constructor(public payload: { brand: BrandInterface }) {}
}

export class FindAllBrands implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FIND_ALL_BRANDS;

  constructor(public payload: { q: string }) {}
}

export class FindAllBrandsSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FIND_ALL_BRANDS_SUCCESS;

  constructor(public payload: { brands: BrandInterface[] }) {}
}

/**********************************************************************************************************************
 * Generic equipment items
 *********************************************************************************************************************/

export class LoadEquipmentItem implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.LOAD_EQUIPMENT_ITEM;

  constructor(public payload: { id: EquipmentItemBaseInterface["id"]; type: EquipmentItemType }) {}
}

export class LoadEquipmentItemSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.LOAD_EQUIPMENT_ITEM_SUCCESS;

  constructor(public payload: { item: EquipmentItemBaseInterface }) {}
}

export class FindAllEquipmentItems implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FIND_ALL_EQUIPMENT_ITEMS;

  constructor(public payload: { q: string; type: EquipmentItemType }) {}
}

export class FindAllEquipmentItemsSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FIND_ALL_EQUIPMENT_ITEMS_SUCCESS;

  constructor(public payload: { items: EquipmentItemBaseInterface[] }) {}
}

export class FindSimilarInBrand implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FIND_SIMILAR_IN_BRAND;

  constructor(public payload: { brand: BrandInterface["id"]; q: string; type: EquipmentItemType }) {}
}

export class FindSimilarInBrandSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FIND_SIMILAR_IN_BRAND_SUCCESS;

  constructor(public payload: { items: EquipmentItemBaseInterface[] }) {}
}

export class GetOthersInBrand implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.GET_OTHERS_IN_BRAND;

  constructor(public payload: { brand: BrandInterface["id"]; type: EquipmentItemType }) {}
}

export class GetOthersInBrandSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.GET_OTHERS_IN_BRAND_SUCCESS;

  constructor(public payload: { items: EquipmentItemBaseInterface[] }) {}
}

export class ApproveEquipmentItem implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.APPROVE_EQUIPMENT_ITEM;

  constructor(public payload: { item: EquipmentItemBaseInterface; comment: string }) {}
}

export class ApproveEquipmentItemSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.APPROVE_EQUIPMENT_ITEM_SUCCESS;

  constructor(public payload: { item: EquipmentItemBaseInterface }) {}
}

export class RejectEquipmentItem implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.REJECT_EQUIPMENT_ITEM;

  constructor(
    public payload: { item: EquipmentItemBaseInterface; reason: EquipmentItemReviewerRejectionReason; comment: string }
  ) {}
}

export class RejectEquipmentItemSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.REJECT_EQUIPMENT_ITEM_SUCCESS;

  constructor(public payload: { item: EquipmentItemBaseInterface }) {}
}

export class FindEquipmentItemEditProposals implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FIND_EQUIPMENT_ITEM_EDIT_PROPOSALS;

  constructor(public payload: { item: EquipmentItemBaseInterface }) {}
}

export class FindEquipmentItemEditProposalsSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FIND_EQUIPMENT_ITEM_EDIT_PROPOSALS_SUCCESS;

  constructor(
    public payload: { editProposals: PaginatedApiResultInterface<EditProposalInterface<EquipmentItemBaseInterface>> }
  ) {}
}

export class ApproveEquipmentItemEditProposal implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.APPROVE_EQUIPMENT_ITEM_EDIT_PROPOSAL;

  constructor(public payload: { editProposal: EditProposalInterface<EquipmentItemBaseInterface>; comment: string }) {}
}

export class ApproveEquipmentItemEditProposalSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.APPROVE_EQUIPMENT_ITEM_EDIT_PROPOSAL_SUCCESS;

  constructor(public payload: { editProposal: EditProposalInterface<EquipmentItemBaseInterface> }) {}
}

export class RejectEquipmentItemEditProposal implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.REJECT_EQUIPMENT_ITEM_EDIT_PROPOSAL;

  constructor(public payload: { editProposal: EditProposalInterface<EquipmentItemBaseInterface>; comment: string }) {}
}

export class RejectEquipmentItemEditProposalSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.REJECT_EQUIPMENT_ITEM_EDIT_PROPOSAL_SUCCESS;

  constructor(public payload: { editProposal: EditProposalInterface<EquipmentItemBaseInterface> }) {}
}

/**********************************************************************************************************************
 * Sensors
 *********************************************************************************************************************/

export class CreateSensor implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_SENSOR;

  constructor(public payload: { sensor: Omit<SensorInterface, "id"> }) {}
}

export class CreateSensorSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_SENSOR_SUCCESS;

  constructor(public payload: EquipmentItemCreationSuccessPayloadInterface) {}
}

export class CreateSensorEditProposal implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_SENSOR_EDIT_PROPOSAL;

  constructor(public payload: { sensor: Omit<EditProposalInterface<SensorInterface>, "id"> }) {}
}

export class CreateSensorEditProposalSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_SENSOR_EDIT_PROPOSAL_SUCCESS;

  constructor(public payload: { editProposal: EditProposalInterface<SensorInterface> }) {}
}

export class LoadSensor implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.LOAD_SENSOR;

  constructor(public payload: { id: SensorInterface["id"] }) {}
}

export class LoadSensorSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.LOAD_SENSOR_SUCCESS;

  constructor(public payload: { item: SensorInterface }) {}
}

/**********************************************************************************************************************
 * Cameras
 *********************************************************************************************************************/

export class CreateCamera implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_CAMERA;

  constructor(public payload: { camera: Omit<CameraInterface, "id">; createModifiedVariant?: boolean }) {}
}

export class CreateCameraSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_CAMERA_SUCCESS;

  constructor(public payload: EquipmentItemCreationSuccessPayloadInterface) {}
}

export class CreateCameraEditProposal implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_CAMERA_EDIT_PROPOSAL;

  constructor(public payload: { camera: Omit<EditProposalInterface<CameraInterface>, "id"> }) {}
}

export class CreateCameraEditProposalSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_CAMERA_EDIT_PROPOSAL_SUCCESS;

  constructor(public payload: { editProposal: EditProposalInterface<CameraInterface> }) {}
}

/**********************************************************************************************************************
 * Telescopes
 *********************************************************************************************************************/

export class CreateTelescope implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_TELESCOPE;

  constructor(public payload: { telescope: Omit<TelescopeInterface, "id"> }) {}
}

export class CreateTelescopeSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_TELESCOPE_SUCCESS;

  constructor(public payload: EquipmentItemCreationSuccessPayloadInterface) {}
}

export class CreateTelescopeEditProposal implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_TELESCOPE_EDIT_PROPOSAL;

  constructor(public payload: { telescope: Omit<EditProposalInterface<TelescopeInterface>, "id"> }) {}
}

export class CreateTelescopeEditProposalSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_TELESCOPE_EDIT_PROPOSAL_SUCCESS;

  constructor(public payload: { editProposal: EditProposalInterface<TelescopeInterface> }) {}
}

/**********************************************************************************************************************
 * Mounts
 *********************************************************************************************************************/

export class CreateMount implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_MOUNT;

  constructor(public payload: { mount: Omit<MountInterface, "id"> }) {}
}

export class CreateMountSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_MOUNT_SUCCESS;

  constructor(public payload: EquipmentItemCreationSuccessPayloadInterface) {}
}

export class CreateMountEditProposal implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_MOUNT_EDIT_PROPOSAL;

  constructor(public payload: { mount: Omit<EditProposalInterface<MountInterface>, "id"> }) {}
}

export class CreateMountEditProposalSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_MOUNT_EDIT_PROPOSAL_SUCCESS;

  constructor(public payload: { editProposal: EditProposalInterface<MountInterface> }) {}
}

/**********************************************************************************************************************
 * Filters
 *********************************************************************************************************************/

export class CreateFilter implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_FILTER;

  constructor(public payload: { filter: Omit<FilterInterface, "id"> }) {}
}

export class CreateFilterSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_FILTER_SUCCESS;

  constructor(public payload: EquipmentItemCreationSuccessPayloadInterface) {}
}

export class CreateFilterEditProposal implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_FILTER_EDIT_PROPOSAL;

  constructor(public payload: { filter: Omit<EditProposalInterface<FilterInterface>, "id"> }) {}
}

export class CreateFilterEditProposalSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_FILTER_EDIT_PROPOSAL_SUCCESS;

  constructor(public payload: { editProposal: EditProposalInterface<FilterInterface> }) {}
}

/**********************************************************************************************************************
 * Accessories
 *********************************************************************************************************************/

export class CreateAccessory implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_ACCESSORY;

  constructor(public payload: { accessory: Omit<AccessoryInterface, "id"> }) {}
}

export class CreateAccessorySuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_ACCESSORY_SUCCESS;

  constructor(public payload: EquipmentItemCreationSuccessPayloadInterface) {}
}

export class CreateAccessoryEditProposal implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_ACCESSORY_EDIT_PROPOSAL;

  constructor(public payload: { accessory: Omit<EditProposalInterface<AccessoryInterface>, "id"> }) {}
}

export class CreateAccessoryEditProposalSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_ACCESSORY_EDIT_PROPOSAL_SUCCESS;

  constructor(public payload: { editProposal: EditProposalInterface<AccessoryInterface> }) {}
}

export type EquipmentActions =
  // Brands
  | LoadBrand
  | LoadBrandSuccess
  | CreateBrand
  | CreateBrandSuccess
  | FindAllBrands
  | FindAllBrandsSuccess

  // Generic equipment items
  | LoadEquipmentItem
  | LoadEquipmentItemSuccess
  | FindAllEquipmentItems
  | FindAllEquipmentItemsSuccess
  | FindSimilarInBrand
  | FindSimilarInBrandSuccess
  | GetOthersInBrand
  | GetOthersInBrandSuccess
  | ApproveEquipmentItem
  | ApproveEquipmentItemSuccess
  | RejectEquipmentItem
  | RejectEquipmentItemSuccess
  | FindEquipmentItemEditProposals
  | FindEquipmentItemEditProposalsSuccess
  | ApproveEquipmentItemEditProposal
  | ApproveEquipmentItemEditProposalSuccess
  | RejectEquipmentItemEditProposal
  | RejectEquipmentItemEditProposalSuccess

  // Sensors
  | CreateSensor
  | CreateSensorSuccess
  | CreateSensorEditProposal
  | CreateSensorEditProposalSuccess
  | LoadSensor
  | LoadSensorSuccess

  // Cameras
  | CreateCamera
  | CreateCameraSuccess
  | CreateCameraEditProposal
  | CreateCameraEditProposalSuccess

  // Telescopes
  | CreateTelescope
  | CreateTelescopeSuccess
  | CreateTelescopeEditProposal
  | CreateTelescopeEditProposalSuccess

  // Mounts
  | CreateMount
  | CreateMountSuccess
  | CreateMountEditProposal
  | CreateMountEditProposalSuccess

  // Filters
  | CreateFilter
  | CreateFilterSuccess
  | CreateFilterEditProposal
  | CreateFilterEditProposalSuccess

  // Accessories
  | CreateAccessory
  | CreateAccessorySuccess
  | CreateAccessoryEditProposal
  | CreateAccessoryEditProposalSuccess;
