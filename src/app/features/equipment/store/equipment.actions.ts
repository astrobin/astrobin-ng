// tslint:disable:max-classes-per-file

import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import {
  EquipmentItemBaseInterface,
  EquipmentItemReviewerRejectionReason,
  EquipmentItemType,
  EquipmentItemUsageType
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
import { SoftwareInterface } from "@features/equipment/types/software.interface";
import { Action } from "@ngrx/store";
import { EquipmentPresetInterface } from "@features/equipment/types/equipment-preset.interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { EquipmentItemMostOftenUsedWith } from "@features/equipment/types/equipment-item-most-often-used-with-data.interface";
import { ExplorerPageSortOrder } from "@features/equipment/pages/explorer-base/explorer-base.component";

export interface EquipmentItemCreationSuccessPayloadInterface {
  item: EquipmentItemBaseInterface;
}

export enum EquipmentActionTypes {
  // Brands

  GET_ALL_BRANDS = "[Equipment] Get all brands",
  GET_ALL_BRANDS_SUCCESS = "[Equipment] Get all brands success",
  LOAD_BRAND = "[Equipment] Load brand",
  LOAD_BRAND_SUCCESS = "[Equipment] Load brand success",
  CREATE_BRAND = "[Equipment] Create brand",
  CREATE_BRAND_SUCCESS = "[Equipment] Create brand success",
  FIND_ALL_BRANDS = "[Equipment] Find all brands",
  FIND_ALL_BRANDS_SUCCESS = "[Equipment] Find all brands success",
  GET_USERS_USING_BRAND = "[Equipment] Get users using brand",
  GET_USERS_USING_BRAND_SUCCESS = "[Equipment] Get users using brand success",
  GET_IMAGES_USING_BRAND = "[Equipment] Get images using brand",
  GET_IMAGES_USING_BRAND_SUCCESS = "[Equipment] Get images using brand success",
  // Generic equipment items

  LOAD_EQUIPMENT_ITEM = "[Equipment] Load equipment item",
  LOAD_EQUIPMENT_ITEM_SUCCESS = "[Equipment] Load equipment item success",
  FIND_ALL_EQUIPMENT_ITEMS = "[Equipment] Find all equipment items",
  FIND_ALL_EQUIPMENT_ITEMS_SUCCESS = "[Equipment] Find all equipment success",
  FIND_RECENTLY_USED_EQUIPMENT_ITEMS = "[Equipment] Find recentrly used equipment items",
  FIND_RECENTLY_USED_EQUIPMENT_ITEMS_SUCCESS = "[Equipment] Find recentrly used equipment items success",
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
  GET_USERS_USING_ITEM = "[Equipment] Get users using item",
  GET_USERS_USING_ITEM_SUCCESS = "[Equipment] Get users using item success",
  GET_IMAGES_USING_ITEM = "[Equipment] Get images using item",
  GET_IMAGES_USING_ITEM_SUCCESS = "[Equipment] Get images using item success",
  GET_MOST_OFTEN_USED_WITH = "[Equipment] Get most often used with",
  GET_MOST_OFTEN_USED_WITH_SUCCESS = "[Equipment] Get most often used with success",

  // Equipment presets

  FIND_EQUIPMENT_PRESETS = "[Equipment] Find equipment presets",
  FIND_EQUIPMENT_PRESETS_SUCCESS = "[Equipment] Find equipment presets success",
  CREATE_EQUIPMENT_PRESET = "[Equipment] Create equipment preset",
  CREATE_EQUIPMENT_PRESET_SUCCESS = "[Equipment] Create equipment preset success",
  UPDATE_EQUIPMENT_PRESET = "[Equipment] Update equipment preset",
  UPDATE_EQUIPMENT_PRESET_SUCCESS = "[Equipment] Update equipment preset success",
  DELETE_EQUIPMENT_PRESET = "[Equipment] Delete equipment preset",
  DELETE_EQUIPMENT_PRESET_SUCCESS = "[Equipment] Delete equipment preset success",

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
  FIND_CAMERA_VARIANTS = "[Equipment] Find camera variants",
  FIND_CAMERA_VARIANTS_SUCCESS = "[Equipment] Find camera variants success",

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
  CREATE_ACCESSORY_EDIT_PROPOSAL_SUCCESS = "[Equipment] Create accessory edit request proposal",

  // Software

  CREATE_SOFTWARE = "[Equipment] Create software",
  CREATE_SOFTWARE_SUCCESS = "[Equipment] Create software success",
  CREATE_SOFTWARE_EDIT_PROPOSAL = "[Equipment] Create software edit proposal",
  CREATE_SOFTWARE_EDIT_PROPOSAL_SUCCESS = "[Equipment] Create software edit request proposal",

  // Item browser
  ITEM_BROWSER_ADD = "[Equipment] Item browser add",
  ITEM_BROWSER_SET = "[Equipment] Item browser set"
}

/**********************************************************************************************************************
 * Brands
 *********************************************************************************************************************/

export class GetAllBrands implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.GET_ALL_BRANDS;

  constructor(public payload: { page: number; sort: ExplorerPageSortOrder }) {}
}

export class GetAllBrandsSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.GET_ALL_BRANDS_SUCCESS;

  constructor(public payload: { response: PaginatedApiResultInterface<BrandInterface>; sort: ExplorerPageSortOrder }) {}
}

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

export class GetUsersUsingBrand implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.GET_USERS_USING_BRAND;

  constructor(public payload: { brandId: BrandInterface["id"] }) {}
}

export class GetUsersUsingBrandSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.GET_USERS_USING_BRAND_SUCCESS;

  constructor(public payload: { brandId: BrandInterface["id"]; users: UserInterface[] }) {}
}

export class GetImagesUsingBrand implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.GET_IMAGES_USING_BRAND;

  constructor(public payload: { brandId: BrandInterface["id"] }) {}
}

export class GetImagesUsingBrandSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.GET_IMAGES_USING_BRAND_SUCCESS;

  constructor(public payload: { brandId: BrandInterface["id"]; images: ImageInterface[] }) {}
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

export class FindRecentlyUsedEquipmentItems implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FIND_RECENTLY_USED_EQUIPMENT_ITEMS;

  constructor(public payload: { type: EquipmentItemType; usageType: EquipmentItemUsageType | null }) {}
}

export class FindRecentlyUsedEquipmentItemsSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FIND_RECENTLY_USED_EQUIPMENT_ITEMS_SUCCESS;

  constructor(
    public payload: {
      type: EquipmentItemType;
      usageType: EquipmentItemUsageType | null;
      items: EquipmentItemBaseInterface[];
    }
  ) {}
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

  constructor(
    public payload: { brand: BrandInterface["id"]; type: EquipmentItemType; item: EquipmentItemBaseInterface["id"] }
  ) {}
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
    public payload: {
      item: EquipmentItemBaseInterface;
      reason: EquipmentItemReviewerRejectionReason;
      comment: string | null;
      duplicateOf: EquipmentItemBaseInterface["id"] | null;
    }
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

export class GetUsersUsingItem implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.GET_USERS_USING_ITEM;

  constructor(public payload: { itemType: EquipmentItemType; itemId: EquipmentItemBaseInterface["id"] }) {}
}

export class GetUsersUsingItemSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.GET_USERS_USING_ITEM_SUCCESS;

  constructor(
    public payload: { itemType: EquipmentItemType; itemId: EquipmentItemBaseInterface["id"]; users: UserInterface[] }
  ) {}
}

export class GetImagesUsingItem implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.GET_IMAGES_USING_ITEM;

  constructor(public payload: { itemType: EquipmentItemType; itemId: EquipmentItemBaseInterface["id"] }) {}
}

export class GetImagesUsingItemSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.GET_IMAGES_USING_ITEM_SUCCESS;

  constructor(
    public payload: { itemType: EquipmentItemType; itemId: EquipmentItemBaseInterface["id"]; images: ImageInterface[] }
  ) {}
}

export class GetMostOftenUsedWith implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.GET_MOST_OFTEN_USED_WITH;

  constructor(public payload: { itemType: EquipmentItemType; itemId: EquipmentItemBaseInterface["id"] }) {}
}

export class GetMostOftenUsedWithSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.GET_MOST_OFTEN_USED_WITH_SUCCESS;

  constructor(
    public payload: {
      itemType: EquipmentItemType;
      itemId: EquipmentItemBaseInterface["id"];
      data: EquipmentItemMostOftenUsedWith;
    }
  ) {}
}

/**********************************************************************************************************************
 * Equipment presets
 *********************************************************************************************************************/

export class FindEquipmentPresets implements Action {
  readonly type = EquipmentActionTypes.FIND_EQUIPMENT_PRESETS;
}

export class FindEquipmentPresetsSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FIND_EQUIPMENT_PRESETS_SUCCESS;

  constructor(public payload: { presets: EquipmentPresetInterface[] }) {}
}

export class CreateEquipmentPreset implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_EQUIPMENT_PRESET;

  constructor(public payload: { preset: EquipmentPresetInterface }) {}
}

export class CreateEquipmentPresetSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_EQUIPMENT_PRESET_SUCCESS;

  constructor(public payload: { preset: EquipmentPresetInterface }) {}
}

export class UpdateEquipmentPreset implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.UPDATE_EQUIPMENT_PRESET;

  constructor(public payload: { preset: EquipmentPresetInterface }) {}
}

export class UpdateEquipmentPresetSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.UPDATE_EQUIPMENT_PRESET_SUCCESS;

  constructor(public payload: { preset: EquipmentPresetInterface }) {}
}

export class DeleteEquipmentPreset implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.DELETE_EQUIPMENT_PRESET;

  constructor(public payload: { id: EquipmentPresetInterface["id"] }) {}
}

export class DeleteEquipmentPresetSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.DELETE_EQUIPMENT_PRESET_SUCCESS;

  constructor(public payload: { id: EquipmentPresetInterface["id"] }) {}
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

  constructor(public payload: { camera: Omit<CameraInterface, "id"> }) {}
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

export class FindCameraVariants implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FIND_CAMERA_VARIANTS;

  constructor(public payload: { id: CameraInterface["id"] }) {}
}

export class FindCameraVariantsSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FIND_CAMERA_VARIANTS_SUCCESS;

  constructor(public payload: { cameraVariants: CameraInterface[] }) {}
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

/**********************************************************************************************************************
 * Software
 *********************************************************************************************************************/

export class CreateSoftware implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_SOFTWARE;

  constructor(public payload: { software: Omit<SoftwareInterface, "id"> }) {}
}

export class CreateSoftwareSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_SOFTWARE_SUCCESS;

  constructor(public payload: EquipmentItemCreationSuccessPayloadInterface) {}
}

export class CreateSoftwareEditProposal implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_SOFTWARE_EDIT_PROPOSAL;

  constructor(public payload: { software: Omit<EditProposalInterface<SoftwareInterface>, "id"> }) {}
}

export class CreateSoftwareEditProposalSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_SOFTWARE_EDIT_PROPOSAL_SUCCESS;

  constructor(public payload: { editProposal: EditProposalInterface<SoftwareInterface> }) {}
}

/**********************************************************************************************************************
 * Item browser
 *********************************************************************************************************************/

export class ItemBrowserAdd implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.ITEM_BROWSER_ADD;

  constructor(
    public payload: { type: EquipmentItemType; usageType: EquipmentItemUsageType; item: EquipmentItemBaseInterface }
  ) {}
}

export class ItemBrowserSet implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.ITEM_BROWSER_SET;

  constructor(
    public payload: { type: EquipmentItemType; usageType?: EquipmentItemUsageType; items: EquipmentItemBaseInterface[] }
  ) {}
}

export type EquipmentActions =
  // Brands
  | GetAllBrands
  | GetAllBrandsSuccess
  | LoadBrand
  | LoadBrandSuccess
  | CreateBrand
  | CreateBrandSuccess
  | FindAllBrands
  | FindAllBrandsSuccess
  | GetUsersUsingBrand
  | GetUsersUsingBrandSuccess
  | GetImagesUsingBrand
  | GetImagesUsingBrandSuccess

  // Generic equipment items
  | LoadEquipmentItem
  | LoadEquipmentItemSuccess
  | FindAllEquipmentItems
  | FindAllEquipmentItemsSuccess
  | FindRecentlyUsedEquipmentItems
  | FindRecentlyUsedEquipmentItemsSuccess
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
  | GetUsersUsingItem
  | GetUsersUsingItemSuccess
  | GetImagesUsingItem
  | GetImagesUsingItemSuccess
  | GetMostOftenUsedWith
  | GetMostOftenUsedWithSuccess

  // Equipment presets
  | FindEquipmentPresets
  | FindEquipmentPresetsSuccess
  | CreateEquipmentPreset
  | CreateEquipmentPresetSuccess
  | UpdateEquipmentPreset
  | UpdateEquipmentPresetSuccess
  | DeleteEquipmentPreset
  | DeleteEquipmentPresetSuccess

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
  | FindCameraVariants
  | FindCameraVariantsSuccess

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
  | CreateAccessoryEditProposalSuccess

  // Software
  | CreateSoftware
  | CreateSoftwareSuccess
  | CreateSoftwareEditProposal
  | CreateSoftwareEditProposalSuccess

  // Item browser
  | ItemBrowserAdd
  | ItemBrowserSet;
