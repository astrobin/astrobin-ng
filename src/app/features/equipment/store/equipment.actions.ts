/* eslint-disable max-classes-per-file */

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
import { EquipmentItemMostOftenUsedWith } from "@features/equipment/types/equipment-item-most-often-used-with-data.interface";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import {
  AllEquipmentItemsOptionsInterface,
  EquipmentItemsSortOrder
} from "@features/equipment/services/equipment-api.service";
import { ContributorInterface } from "@features/equipment/types/contributor.interface";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { MarketplacePrivateConversationInterface } from "@features/equipment/types/marketplace-private-conversation.interface";
import { MarketplaceListingQueryOptionsInterface } from "@features/equipment/types/marketplace-listing-query-options.interface";
import { MarketplaceOfferInterface } from "@features/equipment/types/marketplace-offer.interface";
import { MarketplaceFeedbackInterface } from "@features/equipment/types/marketplace-feedback.interface";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";

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
  LOAD_EQUIPMENT_ITEM_FAILURE = "[Equipment] Load equipment item failure",
  FIND_ALL_EQUIPMENT_ITEMS = "[Equipment] Find all equipment items",
  FIND_ALL_EQUIPMENT_ITEMS_SUCCESS = "[Equipment] Find all equipment success",
  FIND_RECENTLY_USED_EQUIPMENT_ITEMS = "[Equipment] Find recently used equipment items",
  FIND_RECENTLY_USED_EQUIPMENT_ITEMS_SUCCESS = "[Equipment] Find recently used equipment items success",
  FIND_SIMILAR_IN_BRAND = "[Equipment] Find similar in brand",
  FIND_SIMILAR_IN_BRAND_SUCCESS = "[Equipment] Find similar in brand success",
  GET_ALL_IN_BRAND = "[Equipment] Get all in brand",
  GET_ALL_IN_BRAND_SUCCESS = "[Equipment] Get all in brand success",
  GET_OTHERS_IN_BRAND = "[Equipment] Get others in brand",
  GET_OTHERS_IN_BRAND_SUCCESS = "[Equipment] Get others in brand success",
  APPROVE_EQUIPMENT_ITEM = "[Equipment] Unapprove item",
  APPROVE_EQUIPMENT_ITEM_SUCCESS = "[Equipment] Unapprove item success",
  UNAPPROVE_EQUIPMENT_ITEM = "[Equipment] Approve item",
  UNAPPROVE_EQUIPMENT_ITEM_SUCCESS = "[Equipment] Approve item success",
  FREEZE_EQUIPMENT_ITEM_AS_AMBIGUOUS = "[Equipment] Freeze item as ambiguous",
  FREEZE_EQUIPMENT_ITEM_AS_AMBIGUOUS_SUCCESS = "[Equipment] Freeze item as ambiguous success",
  UNFREEZE_EQUIPMENT_ITEM_AS_AMBIGUOUS = "[Equipment] Unfreeze item as ambiguous",
  UNFREEZE_EQUIPMENT_ITEM_AS_AMBIGUOUS_SUCCESS = "[Equipment] Unfreeze item as ambiguous success",
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
  GET_CONTRIBUTORS = "[Equipment] Get contributors",
  GET_CONTRIBUTORS_SUCCESS = "[Equipment] Get contributors success",
  ASSIGN_ITEM = "[Equipment] Assign item",
  ASSIGN_ITEM_SUCCESS = "[Equipment] Assign item success",
  ASSIGN_EDIT_PROPOSAL = "[Equipment] Assign edit proposal",
  ASSIGN_EDIT_PROPOSAL_SUCCESS = "[Equipment] Assign edit proposal success",

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
  ITEM_BROWSER_SET = "[Equipment] Item browser set",
  ITEM_BROWSER_EXIT_FULLSCREEN = "[Equipment] Item browser exit fullscreen",

  // Marketplace

  CLEAR_MARKETPLACE_LISTINGS = "[Equipment] Clear marketplace listings",
  LOAD_MARKETPLACE_LISTINGS = "[Equipment] Load marketplace listings",
  LOAD_MARKETPLACE_LISTINGS_SUCCESS = "[Equipment] Load marketplace listings success",
  LOAD_MARKETPLACE_LISTINGS_FAILURE = "[Equipment] Load marketplace listing failure",

  CREATE_MARKETPLACE_LISTING = "[Equipment] Create marketplace listing",
  CREATE_MARKETPLACE_LISTING_SUCCESS = "[Equipment] Create marketplace listing success",
  CREATE_MARKETPLACE_LISTING_FAILURE = "[Equipment] Create marketplace listing failure",

  LOAD_MARKETPLACE_LISTING = "[Equipment] Load marketplace listing",
  LOAD_MARKETPLACE_LISTING_SUCCESS = "[Equipment] Load marketplace listing success",
  LOAD_MARKETPLACE_LISTING_FAILURE = "[Equipment] Load marketplace listing failure",

  DELETE_MARKETPLACE_LISTING = "[Equipment] Delete marketplace listing",
  DELETE_MARKETPLACE_LISTING_SUCCESS = "[Equipment] Delete marketplace listing success",
  DELETE_MARKETPLACE_LISTING_FAILURE = "[Equipment] Delete marketplace listing failure",

  UPDATE_MARKETPLACE_LISTING = "[Equipment] Update marketplace listing",
  UPDATE_MARKETPLACE_LISTING_SUCCESS = "[Equipment] Update marketplace listing success",
  UPDATE_MARKETPLACE_LISTING_FAILURE = "[Equipment] Update marketplace listing failure",

  APPROVE_MARKETPLACE_LISTING = "[Equipment] Approve marketplace listing",
  APPROVE_MARKETPLACE_LISTING_SUCCESS = "[Equipment] Approve marketplace listing success",
  APPROVE_MARKETPLACE_LISTING_FAILURE = "[Equipment] Approve marketplace listing failure",

  RENEW_MARKETPLACE_LISTING = "[Equipment] Renew marketplace listing",
  RENEW_MARKETPLACE_LISTING_SUCCESS = "[Equipment] Renew marketplace listing success",
  RENEW_MARKETPLACE_LISTING_FAILURE = "[Equipment] Renew marketplace listing failure",

  MARK_MARKETPLACE_LINE_ITEM_AS_SOLD = "[Equipment] Mark marketplace line item as sold",
  MARK_MARKETPLACE_LINE_ITEM_AS_SOLD_SUCCESS = "[Equipment] Mark marketplace line item as sold success",
  MARK_MARKETPLACE_LINE_ITEM_AS_SOLD_FAILURE = "[Equipment] Mark marketplace line item as sold failure",

  LOAD_MARKETPLACE_PRIVATE_CONVERSATIONS = "[Equipment] Load marketplace private conversations",
  LOAD_MARKETPLACE_PRIVATE_CONVERSATIONS_SUCCESS = "[Equipment] Load marketplace private conversations success",
  LOAD_MARKETPLACE_PRIVATE_CONVERSATIONS_FAILURE = "[Equipment] Load marketplace private conversations failure",

  CREATE_MARKETPLACE_PRIVATE_CONVERSATION = "[Equipment] Create marketplace private conversation",
  CREATE_MARKETPLACE_PRIVATE_CONVERSATION_SUCCESS = "[Equipment] Create marketplace private conversation success",
  CREATE_MARKETPLACE_PRIVATE_CONVERSATION_FAILURE = "[Equipment] Create marketplace private conversation failure",

  UPDATE_MARKETPLACE_PRIVATE_CONVERSATION = "[Equipment] Update marketplace private conversation",
  UPDATE_MARKETPLACE_PRIVATE_CONVERSATION_SUCCESS = "[Equipment] Update marketplace private conversation success",
  UPDATE_MARKETPLACE_PRIVATE_CONVERSATION_FAILURE = "[Equipment] Update marketplace private conversation failure",

  DELETE_MARKETPLACE_PRIVATE_CONVERSATION = "[Equipment] Delete marketplace private conversation",
  DELETE_MARKETPLACE_PRIVATE_CONVERSATION_SUCCESS = "[Equipment] Delete marketplace private conversation success",
  DELETE_MARKETPLACE_PRIVATE_CONVERSATION_FAILURE = "[Equipment] Delete marketplace private conversation failure",

  CREATE_MARKETPLACE_OFFER = "[Equipment] Create marketplace offer",
  CREATE_MARKETPLACE_OFFER_SUCCESS = "[Equipment] Create marketplace offer success",
  CREATE_MARKETPLACE_OFFER_FAILURE = "[Equipment] Create marketplace offer failure",
  UPDATE_MARKETPLACE_OFFER = "[Equipment] Update marketplace offer",
  UPDATE_MARKETPLACE_OFFER_SUCCESS = "[Equipment] Update marketplace offer success",
  UPDATE_MARKETPLACE_OFFER_FAILURE = "[Equipment] Update marketplace offer failure",
  REJECT_MARKETPLACE_OFFER = "[Equipment] Reject marketplace offer",
  REJECT_MARKETPLACE_OFFER_SUCCESS = "[Equipment] Reject marketplace offer success",
  REJECT_MARKETPLACE_OFFER_FAILURE = "[Equipment] Reject marketplace offer failure",
  RETRACT_MARKETPLACE_OFFER = "[Equipment] Retract marketplace offer",
  RETRACT_MARKETPLACE_OFFER_SUCCESS = "[Equipment] Retract marketplace offer success",
  RETRACT_MARKETPLACE_OFFER_FAILURE = "[Equipment] Retract marketplace offer failure",
  ACCEPT_MARKETPLACE_OFFER = "[Equipment] Accept marketplace offer",
  ACCEPT_MARKETPLACE_OFFER_SUCCESS = "[Equipment] Accept marketplace offer success",
  ACCEPT_MARKETPLACE_OFFER_FAILURE = "[Equipment] Accept marketplace offer failure",

  CREATE_MARKETPLACE_FEEDBACK = "[Equipment] Create marketplace feedback",
  CREATE_MARKETPLACE_FEEDBACK_SUCCESS = "[Equipment] Create marketplace feedback success",
  CREATE_MARKETPLACE_FEEDBACK_FAILURE = "[Equipment] Create marketplace feedback failure",
  GET_MARKETPLACE_FEEDBACK = "[Equipment] Get marketplace feedback",
  GET_MARKETPLACE_FEEDBACK_SUCCESS = "[Equipment] Get marketplace feedback success",
  GET_MARKETPLACE_FEEDBACK_FAILURE = "[Equipment] Get marketplace feedback failure",
}

/**********************************************************************************************************************
 * Brands
 *********************************************************************************************************************/

export class GetAllBrands implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.GET_ALL_BRANDS;

  constructor(public payload: { page: number; sort: EquipmentItemsSortOrder }) {
  }
}

export class GetAllBrandsSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.GET_ALL_BRANDS_SUCCESS;

  constructor(
    public payload: { response: PaginatedApiResultInterface<BrandInterface>; sort: EquipmentItemsSortOrder }
  ) {
  }
}

export class LoadBrand implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.LOAD_BRAND;

  constructor(public payload: { id: BrandInterface["id"] }) {
  }
}

export class LoadBrandSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.LOAD_BRAND_SUCCESS;

  constructor(public payload: { brand: BrandInterface }) {
  }
}

export class CreateBrand implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_BRAND;

  constructor(public payload: { brand: Omit<BrandInterface, "id"> }) {
  }
}

export class CreateBrandSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_BRAND_SUCCESS;

  constructor(public payload: { brand: BrandInterface }) {
  }
}

export class FindAllBrands implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FIND_ALL_BRANDS;

  constructor(public payload: { q: string }) {
  }
}

export class FindAllBrandsSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FIND_ALL_BRANDS_SUCCESS;

  constructor(public payload: { brands: BrandInterface[] }) {
  }
}

/**********************************************************************************************************************
 * Generic equipment items
 *********************************************************************************************************************/

export class LoadEquipmentItem implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.LOAD_EQUIPMENT_ITEM;

  constructor(
    public payload: {
      id: EquipmentItemBaseInterface["id"];
      type: EquipmentItemType;
      allowUnapproved?: boolean;
      allowDIY?: boolean;
      item?: EquipmentItem; // The dispatcher already has the item and just wants it added to the store.
    }
  ) {
  }
}

export class LoadEquipmentItemSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.LOAD_EQUIPMENT_ITEM_SUCCESS;

  constructor(public payload: { item: EquipmentItemBaseInterface }) {
  }
}

export class LoadEquipmentItemFailure implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.LOAD_EQUIPMENT_ITEM_FAILURE;

  constructor(
    public payload: {
      id: EquipmentItemBaseInterface["id"];
      klass: EquipmentItemBaseInterface["klass"];
    }
  ) {
  }
}

export class FindAllEquipmentItems implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FIND_ALL_EQUIPMENT_ITEMS;

  constructor(
    public payload: {
      type: EquipmentItemType;
      options?: AllEquipmentItemsOptionsInterface;
    }
  ) {
  }
}

export class FindAllEquipmentItemsSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FIND_ALL_EQUIPMENT_ITEMS_SUCCESS;

  constructor(public payload: { items: EquipmentItemBaseInterface[] }) {
  }
}

export class FindRecentlyUsedEquipmentItems implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FIND_RECENTLY_USED_EQUIPMENT_ITEMS;

  constructor(
    public payload: {
      type: EquipmentItemType;
      usageType: EquipmentItemUsageType | null;
      includeFrozen?: boolean;
      query?: string;
    }
  ) {
  }
}

export class FindRecentlyUsedEquipmentItemsSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FIND_RECENTLY_USED_EQUIPMENT_ITEMS_SUCCESS;

  constructor(
    public payload: {
      type: EquipmentItemType;
      usageType: EquipmentItemUsageType | null;
      items: EquipmentItemBaseInterface[];
    }
  ) {
  }
}

export class FindSimilarInBrand implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FIND_SIMILAR_IN_BRAND;

  constructor(public payload: { brand: BrandInterface["id"]; q: string; type: EquipmentItemType }) {
  }
}

export class FindSimilarInBrandSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FIND_SIMILAR_IN_BRAND_SUCCESS;

  constructor(public payload: { items: EquipmentItemBaseInterface[] }) {
  }
}

export class GetAllInBrand implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.GET_ALL_IN_BRAND;

  constructor(public payload: { brand: BrandInterface["id"]; type: EquipmentItemType; page: number }) {
  }
}

export class GetAllInBrandSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.GET_ALL_IN_BRAND_SUCCESS;

  constructor(public payload: { response: PaginatedApiResultInterface<EquipmentItem> }) {
  }
}

export class GetOthersInBrand implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.GET_OTHERS_IN_BRAND;

  constructor(public payload: { brand: BrandInterface["id"]; type: EquipmentItemType; name: string }) {
  }
}

export class GetOthersInBrandSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.GET_OTHERS_IN_BRAND_SUCCESS;

  constructor(public payload: { items: EquipmentItemBaseInterface[] }) {
  }
}

export class ApproveEquipmentItem implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.APPROVE_EQUIPMENT_ITEM;

  constructor(public payload: { item: EquipmentItemBaseInterface; comment: string }) {
  }
}

export class ApproveEquipmentItemSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.APPROVE_EQUIPMENT_ITEM_SUCCESS;

  constructor(public payload: { item: EquipmentItemBaseInterface }) {
  }
}

export class UnapproveEquipmentItem implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.UNAPPROVE_EQUIPMENT_ITEM;

  constructor(public payload: { item: EquipmentItemBaseInterface }) {
  }
}

export class UnapproveEquipmentItemSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.UNAPPROVE_EQUIPMENT_ITEM_SUCCESS;

  constructor(public payload: { item: EquipmentItemBaseInterface }) {
  }
}

export class FreezeEquipmentItemAsAmbiguous implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FREEZE_EQUIPMENT_ITEM_AS_AMBIGUOUS;

  constructor(public payload: { item: EquipmentItemBaseInterface }) {
  }
}

export class FreezeEquipmentItemAsAmbiguousSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FREEZE_EQUIPMENT_ITEM_AS_AMBIGUOUS_SUCCESS;

  constructor(public payload: { item: EquipmentItemBaseInterface }) {
  }
}

export class UnfreezeEquipmentItemAsAmbiguous implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.UNFREEZE_EQUIPMENT_ITEM_AS_AMBIGUOUS;

  constructor(public payload: { item: EquipmentItemBaseInterface }) {
  }
}

export class UnfreezeEquipmentItemAsAmbiguousSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.UNFREEZE_EQUIPMENT_ITEM_AS_AMBIGUOUS_SUCCESS;

  constructor(public payload: { item: EquipmentItemBaseInterface }) {
  }
}

export class RejectEquipmentItem implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.REJECT_EQUIPMENT_ITEM;

  constructor(
    public payload: {
      item: EquipmentItemBaseInterface;
      reason: EquipmentItemReviewerRejectionReason;
      comment: string | null;
      duplicateOf: EquipmentItemBaseInterface["id"] | null;
      duplicateOfKlass: EquipmentItemType | null;
      duplicateOfUsageType: EquipmentItemUsageType | null;
    }
  ) {
  }
}

export class RejectEquipmentItemSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.REJECT_EQUIPMENT_ITEM_SUCCESS;

  constructor(public payload: { item: EquipmentItemBaseInterface }) {
  }
}

export class FindEquipmentItemEditProposals implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FIND_EQUIPMENT_ITEM_EDIT_PROPOSALS;

  constructor(public payload: { item: EquipmentItemBaseInterface }) {
  }
}

export class FindEquipmentItemEditProposalsSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FIND_EQUIPMENT_ITEM_EDIT_PROPOSALS_SUCCESS;

  constructor(
    public payload: { editProposals: PaginatedApiResultInterface<EditProposalInterface<EquipmentItemBaseInterface>> }
  ) {
  }
}

export class ApproveEquipmentItemEditProposal implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.APPROVE_EQUIPMENT_ITEM_EDIT_PROPOSAL;

  constructor(public payload: { editProposal: EditProposalInterface<EquipmentItemBaseInterface>; comment: string }) {
  }
}

export class ApproveEquipmentItemEditProposalSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.APPROVE_EQUIPMENT_ITEM_EDIT_PROPOSAL_SUCCESS;

  constructor(public payload: { editProposal: EditProposalInterface<EquipmentItemBaseInterface> }) {
  }
}

export class RejectEquipmentItemEditProposal implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.REJECT_EQUIPMENT_ITEM_EDIT_PROPOSAL;

  constructor(public payload: { editProposal: EditProposalInterface<EquipmentItemBaseInterface>; comment: string }) {
  }
}

export class RejectEquipmentItemEditProposalSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.REJECT_EQUIPMENT_ITEM_EDIT_PROPOSAL_SUCCESS;

  constructor(public payload: { editProposal: EditProposalInterface<EquipmentItemBaseInterface> }) {
  }
}

export class GetMostOftenUsedWith implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.GET_MOST_OFTEN_USED_WITH;

  constructor(public payload: { itemType: EquipmentItemType; itemId: EquipmentItemBaseInterface["id"] }) {
  }
}

export class GetMostOftenUsedWithSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.GET_MOST_OFTEN_USED_WITH_SUCCESS;

  constructor(
    public payload: {
      itemType: EquipmentItemType;
      itemId: EquipmentItemBaseInterface["id"];
      data: EquipmentItemMostOftenUsedWith;
    }
  ) {
  }
}

export class GetContributors implements Action {
  readonly type = EquipmentActionTypes.GET_CONTRIBUTORS;
}

export class GetContributorsSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.GET_CONTRIBUTORS_SUCCESS;

  constructor(public payload: { contributors: ContributorInterface[] }) {
  }
}

export class AssignItem implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.ASSIGN_ITEM;

  constructor(
    public payload: { itemType: EquipmentItemType; itemId: EquipmentItem["id"]; assignee: UserInterface["id"] | null }
  ) {
  }
}

export class AssignItemSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.ASSIGN_ITEM_SUCCESS;

  constructor(public payload: { item: EquipmentItem }) {
  }
}

export class AssignEditProposal implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.ASSIGN_EDIT_PROPOSAL;

  constructor(
    public payload: {
      itemType: EquipmentItemType;
      editProposalId: EditProposalInterface<EquipmentItem>["id"];
      assignee: UserInterface["id"] | null;
    }
  ) {
  }
}

export class AssignEditProposalSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.ASSIGN_EDIT_PROPOSAL_SUCCESS;

  constructor(public payload: { editProposal: EditProposalInterface<EquipmentItem> }) {
  }
}

/**********************************************************************************************************************
 * Equipment presets
 *********************************************************************************************************************/

export class FindEquipmentPresets implements Action {
  readonly type = EquipmentActionTypes.FIND_EQUIPMENT_PRESETS;
}

export class FindEquipmentPresetsSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FIND_EQUIPMENT_PRESETS_SUCCESS;

  constructor(public payload: { presets: EquipmentPresetInterface[] }) {
  }
}

export class CreateEquipmentPreset implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_EQUIPMENT_PRESET;

  constructor(public payload: { preset: EquipmentPresetInterface }) {
  }
}

export class CreateEquipmentPresetSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_EQUIPMENT_PRESET_SUCCESS;

  constructor(public payload: { preset: EquipmentPresetInterface }) {
  }
}

export class UpdateEquipmentPreset implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.UPDATE_EQUIPMENT_PRESET;

  constructor(public payload: { preset: EquipmentPresetInterface }) {
  }
}

export class UpdateEquipmentPresetSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.UPDATE_EQUIPMENT_PRESET_SUCCESS;

  constructor(public payload: { preset: EquipmentPresetInterface }) {
  }
}

export class DeleteEquipmentPreset implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.DELETE_EQUIPMENT_PRESET;

  constructor(public payload: { id: EquipmentPresetInterface["id"] }) {
  }
}

export class DeleteEquipmentPresetSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.DELETE_EQUIPMENT_PRESET_SUCCESS;

  constructor(public payload: { id: EquipmentPresetInterface["id"] }) {
  }
}

/**********************************************************************************************************************
 * Sensors
 *********************************************************************************************************************/

export class CreateSensor implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_SENSOR;

  constructor(public payload: { sensor: Omit<SensorInterface, "id"> }) {
  }
}

export class CreateSensorSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_SENSOR_SUCCESS;

  constructor(public payload: EquipmentItemCreationSuccessPayloadInterface) {
  }
}

export class CreateSensorEditProposal implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_SENSOR_EDIT_PROPOSAL;

  constructor(public payload: { sensor: Omit<EditProposalInterface<SensorInterface>, "id"> }) {
  }
}

export class CreateSensorEditProposalSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_SENSOR_EDIT_PROPOSAL_SUCCESS;

  constructor(public payload: { editProposal: EditProposalInterface<SensorInterface> }) {
  }
}

export class LoadSensor implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.LOAD_SENSOR;

  constructor(public payload: { id: SensorInterface["id"] }) {
  }
}

export class LoadSensorSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.LOAD_SENSOR_SUCCESS;

  constructor(public payload: { item: SensorInterface }) {
  }
}

/**********************************************************************************************************************
 * Cameras
 *********************************************************************************************************************/

export class CreateCamera implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_CAMERA;

  constructor(public payload: { camera: Omit<CameraInterface, "id"> }) {
  }
}

export class CreateCameraSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_CAMERA_SUCCESS;

  constructor(public payload: EquipmentItemCreationSuccessPayloadInterface) {
  }
}

export class CreateCameraEditProposal implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_CAMERA_EDIT_PROPOSAL;

  constructor(public payload: { camera: Omit<EditProposalInterface<CameraInterface>, "id"> }) {
  }
}

export class CreateCameraEditProposalSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_CAMERA_EDIT_PROPOSAL_SUCCESS;

  constructor(public payload: { editProposal: EditProposalInterface<CameraInterface> }) {
  }
}

export class FindCameraVariants implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FIND_CAMERA_VARIANTS;

  constructor(public payload: { id: CameraInterface["id"] }) {
  }
}

export class FindCameraVariantsSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.FIND_CAMERA_VARIANTS_SUCCESS;

  constructor(public payload: { cameraVariants: CameraInterface[] }) {
  }
}

/**********************************************************************************************************************
 * Telescopes
 *********************************************************************************************************************/

export class CreateTelescope implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_TELESCOPE;

  constructor(public payload: { telescope: Omit<TelescopeInterface, "id"> }) {
  }
}

export class CreateTelescopeSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_TELESCOPE_SUCCESS;

  constructor(public payload: EquipmentItemCreationSuccessPayloadInterface) {
  }
}

export class CreateTelescopeEditProposal implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_TELESCOPE_EDIT_PROPOSAL;

  constructor(public payload: { telescope: Omit<EditProposalInterface<TelescopeInterface>, "id"> }) {
  }
}

export class CreateTelescopeEditProposalSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_TELESCOPE_EDIT_PROPOSAL_SUCCESS;

  constructor(public payload: { editProposal: EditProposalInterface<TelescopeInterface> }) {
  }
}

/**********************************************************************************************************************
 * Mounts
 *********************************************************************************************************************/

export class CreateMount implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_MOUNT;

  constructor(public payload: { mount: Omit<MountInterface, "id"> }) {
  }
}

export class CreateMountSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_MOUNT_SUCCESS;

  constructor(public payload: EquipmentItemCreationSuccessPayloadInterface) {
  }
}

export class CreateMountEditProposal implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_MOUNT_EDIT_PROPOSAL;

  constructor(public payload: { mount: Omit<EditProposalInterface<MountInterface>, "id"> }) {
  }
}

export class CreateMountEditProposalSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_MOUNT_EDIT_PROPOSAL_SUCCESS;

  constructor(public payload: { editProposal: EditProposalInterface<MountInterface> }) {
  }
}

/**********************************************************************************************************************
 * Filters
 *********************************************************************************************************************/

export class CreateFilter implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_FILTER;

  constructor(public payload: { filter: Omit<FilterInterface, "id"> }) {
  }
}

export class CreateFilterSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_FILTER_SUCCESS;

  constructor(public payload: EquipmentItemCreationSuccessPayloadInterface) {
  }
}

export class CreateFilterEditProposal implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_FILTER_EDIT_PROPOSAL;

  constructor(public payload: { filter: Omit<EditProposalInterface<FilterInterface>, "id"> }) {
  }
}

export class CreateFilterEditProposalSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_FILTER_EDIT_PROPOSAL_SUCCESS;

  constructor(public payload: { editProposal: EditProposalInterface<FilterInterface> }) {
  }
}

/**********************************************************************************************************************
 * Accessories
 *********************************************************************************************************************/

export class CreateAccessory implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_ACCESSORY;

  constructor(public payload: { accessory: Omit<AccessoryInterface, "id"> }) {
  }
}

export class CreateAccessorySuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_ACCESSORY_SUCCESS;

  constructor(public payload: EquipmentItemCreationSuccessPayloadInterface) {
  }
}

export class CreateAccessoryEditProposal implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_ACCESSORY_EDIT_PROPOSAL;

  constructor(public payload: { accessory: Omit<EditProposalInterface<AccessoryInterface>, "id"> }) {
  }
}

export class CreateAccessoryEditProposalSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_ACCESSORY_EDIT_PROPOSAL_SUCCESS;

  constructor(public payload: { editProposal: EditProposalInterface<AccessoryInterface> }) {
  }
}

/**********************************************************************************************************************
 * Software
 *********************************************************************************************************************/

export class CreateSoftware implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_SOFTWARE;

  constructor(public payload: { software: Omit<SoftwareInterface, "id"> }) {
  }
}

export class CreateSoftwareSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_SOFTWARE_SUCCESS;

  constructor(public payload: EquipmentItemCreationSuccessPayloadInterface) {
  }
}

export class CreateSoftwareEditProposal implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_SOFTWARE_EDIT_PROPOSAL;

  constructor(public payload: { software: Omit<EditProposalInterface<SoftwareInterface>, "id"> }) {
  }
}

export class CreateSoftwareEditProposalSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_SOFTWARE_EDIT_PROPOSAL_SUCCESS;

  constructor(public payload: { editProposal: EditProposalInterface<SoftwareInterface> }) {
  }
}

/**********************************************************************************************************************
 * Item browser
 *********************************************************************************************************************/

export class ItemBrowserAdd implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.ITEM_BROWSER_ADD;

  constructor(
    public payload: { type: EquipmentItemType; usageType: EquipmentItemUsageType; item: EquipmentItemBaseInterface }
  ) {
  }
}

export class ItemBrowserSet implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.ITEM_BROWSER_SET;

  constructor(
    public payload: { type: EquipmentItemType; usageType?: EquipmentItemUsageType; items: EquipmentItemBaseInterface[] }
  ) {
  }
}

export class ItemBrowserExitFullscreen implements Action {
  readonly type = EquipmentActionTypes.ITEM_BROWSER_EXIT_FULLSCREEN;
}

/**********************************************************************************************************************
 * Marketplace
 *********************************************************************************************************************/

export class ClearMarketplaceListings implements Action {
  readonly type = EquipmentActionTypes.CLEAR_MARKETPLACE_LISTINGS;
}

export class LoadMarketplaceListings implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.LOAD_MARKETPLACE_LISTINGS;

  constructor(
    public payload: {
      options?: MarketplaceListingQueryOptionsInterface;
    }
  ) {
  }
}

export class LoadMarketplaceListingsSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.LOAD_MARKETPLACE_LISTINGS_SUCCESS;

  constructor(public payload: { listings: PaginatedApiResultInterface<MarketplaceListingInterface> }) {
  }
}

export class LoadMarketplaceListingsFailure implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.LOAD_MARKETPLACE_LISTINGS_FAILURE;

  constructor(public payload: { error: string }) {
  }
}

export class CreateMarketplaceListing implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_MARKETPLACE_LISTING;

  constructor(public payload: { listing: Omit<MarketplaceListingInterface, "id"> }) {
  }
}

export class CreateMarketplaceListingSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_MARKETPLACE_LISTING_SUCCESS;

  constructor(public payload: { listing: MarketplaceListingInterface }) {
  }
}

export class CreateMarketplaceListingFailure implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_MARKETPLACE_LISTING_FAILURE;

  constructor(public payload: { error: string }) {
  }
}

export class LoadMarketplaceListing implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.LOAD_MARKETPLACE_LISTING;

  constructor(
    public payload: {
      id?: MarketplaceListingInterface["id"];
      hash?: MarketplaceListingInterface["hash"];
    }
  ) {
  }
}

export class LoadMarketplaceListingSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.LOAD_MARKETPLACE_LISTING_SUCCESS;

  constructor(public payload: { listing: MarketplaceListingInterface }) {
  }
}

export class LoadMarketplaceListingFailure implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.LOAD_MARKETPLACE_LISTING_FAILURE;

  constructor(public payload: { error: string }) {
  }
}

export class DeleteMarketplaceListing implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.DELETE_MARKETPLACE_LISTING;

  constructor(public payload: { listing: MarketplaceListingInterface }) {
  }
}

export class DeleteMarketplaceListingSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.DELETE_MARKETPLACE_LISTING_SUCCESS;

  constructor(public payload: { id: MarketplaceListingInterface["id"] }) {
  }
}

export class DeleteMarketplaceListingFailure implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.DELETE_MARKETPLACE_LISTING_FAILURE;

  constructor(public payload: { error: string }) {
  }
}

export class UpdateMarketplaceListing implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.UPDATE_MARKETPLACE_LISTING;

  constructor(public payload: { listing: MarketplaceListingInterface }) {
  }
}

export class UpdateMarketplaceListingSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.UPDATE_MARKETPLACE_LISTING_SUCCESS;

  constructor(public payload: { listing: MarketplaceListingInterface }) {
  }
}

export class UpdateMarketplaceListingFailure implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.UPDATE_MARKETPLACE_LISTING_FAILURE;

  constructor(public payload: { error: string }) {
  }
}

export class ApproveMarketplaceListing implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.APPROVE_MARKETPLACE_LISTING;

  constructor(public payload: { listing: MarketplaceListingInterface }) {
  }
}

export class ApproveMarketplaceListingSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.APPROVE_MARKETPLACE_LISTING_SUCCESS;

  constructor(public payload: { listing: MarketplaceListingInterface }) {
  }
}

export class ApproveMarketplaceListingFailure implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.APPROVE_MARKETPLACE_LISTING_FAILURE;

  constructor(public payload: { listing: MarketplaceListingInterface, error: string }) {
  }
}

export class RenewMarketplaceListing implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.RENEW_MARKETPLACE_LISTING;

  constructor(public payload: { listing: MarketplaceListingInterface }) {
  }
}

export class RenewMarketplaceListingSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.RENEW_MARKETPLACE_LISTING_SUCCESS;

  constructor(public payload: { listing: MarketplaceListingInterface }) {
  }
}

export class RenewMarketplaceListingFailure implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.RENEW_MARKETPLACE_LISTING_FAILURE;

  constructor(public payload: { listing: MarketplaceListingInterface, error: string }) {
  }
}

export class MarkMarketplaceLineItemAsSold implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.MARK_MARKETPLACE_LINE_ITEM_AS_SOLD;

  constructor(public payload: { lineItem: MarketplaceLineItemInterface, soldTo: UserInterface["id"] }) {
  }
}

export class MarkMarketplaceLineItemAsSoldSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.MARK_MARKETPLACE_LINE_ITEM_AS_SOLD_SUCCESS;

  constructor(public payload: { lineItem: MarketplaceLineItemInterface }) {
  }
}

export class MarkMarketplaceLineItemAsSoldFailure implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.MARK_MARKETPLACE_LINE_ITEM_AS_SOLD_FAILURE;

  constructor(public payload: { lineItem: MarketplaceLineItemInterface; soldTo: UserInterface["id"]; error: string }) {
  }
}

export class LoadMarketplacePrivateConversations implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.LOAD_MARKETPLACE_PRIVATE_CONVERSATIONS;

  constructor(public payload: { listingId: MarketplaceListingInterface["id"] }) {
  }
}

export class LoadMarketplacePrivateConversationsSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.LOAD_MARKETPLACE_PRIVATE_CONVERSATIONS_SUCCESS;

  constructor(
    public payload: {
      listingId: MarketplaceListingInterface["id"];
      privateConversations: MarketplacePrivateConversationInterface[];
    }
  ) {
  }
}

export class LoadMarketplacePrivateConversationsFailure implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.LOAD_MARKETPLACE_PRIVATE_CONVERSATIONS_FAILURE;

  constructor(public payload: { listingId: MarketplaceListingInterface["id"]; error: string }) {
  }
}

export class CreateMarketplacePrivateConversation implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_MARKETPLACE_PRIVATE_CONVERSATION;

  constructor(public payload: {
    listingId: MarketplaceListingInterface["id"];
    userId?: UserInterface["id"];
  }) {
  }
}

export class CreateMarketplacePrivateConversationSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_MARKETPLACE_PRIVATE_CONVERSATION_SUCCESS;

  constructor(public payload: { privateConversation: MarketplacePrivateConversationInterface }) {
  }
}

export class CreateMarketplacePrivateConversationFailure implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_MARKETPLACE_PRIVATE_CONVERSATION_FAILURE;

  constructor(
    public payload: {
      listingId: MarketplaceListingInterface["id"];
      userId?: UserInterface["id"];
      error: string;
    }
  ) {
  }
}

export class UpdateMarketplacePrivateConversation implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.UPDATE_MARKETPLACE_PRIVATE_CONVERSATION;

  constructor(public payload: { privateConversation: MarketplacePrivateConversationInterface }) {
  }
}

export class UpdateMarketplacePrivateConversationSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.UPDATE_MARKETPLACE_PRIVATE_CONVERSATION_SUCCESS;

  constructor(public payload: { privateConversation: MarketplacePrivateConversationInterface }) {
  }
}

export class UpdateMarketplacePrivateConversationFailure implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.UPDATE_MARKETPLACE_PRIVATE_CONVERSATION_FAILURE;

  constructor(
    public payload: {
      privateConversation: MarketplacePrivateConversationInterface;
      error: string;
    }
  ) {
  }
}

export class DeleteMarketplacePrivateConversation implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.DELETE_MARKETPLACE_PRIVATE_CONVERSATION;

  constructor(public payload: { privateConversation: MarketplacePrivateConversationInterface }) {
  }
}

export class DeleteMarketplacePrivateConversationSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.DELETE_MARKETPLACE_PRIVATE_CONVERSATION_SUCCESS;

  constructor(
    public payload: {
      id: MarketplacePrivateConversationInterface["id"];
      userId: UserInterface["id"];
      listingId: MarketplaceListingInterface["id"];
    }
  ) {
  }
}

export class DeleteMarketplacePrivateConversationFailure implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.DELETE_MARKETPLACE_PRIVATE_CONVERSATION_FAILURE;

  constructor(
    public payload: { userId: UserInterface["id"]; listingId: MarketplaceListingInterface["id"]; error: string }
  ) {
  }
}

export class CreateMarketplaceOffer implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_MARKETPLACE_OFFER;

  constructor(public payload: { offer: MarketplaceOfferInterface }) {
  }
}

export class CreateMarketplaceOfferSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_MARKETPLACE_OFFER_SUCCESS;

  constructor(public payload: { offer: MarketplaceOfferInterface }) {
  }
}

export class CreateMarketplaceOfferFailure implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_MARKETPLACE_OFFER_FAILURE;

  constructor(public payload: { offer: MarketplaceOfferInterface; error: string }) {
  }
}

export class UpdateMarketplaceOffer implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.UPDATE_MARKETPLACE_OFFER;

  constructor(public payload: { offer: MarketplaceOfferInterface }) {
  }
}

export class UpdateMarketplaceOfferSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.UPDATE_MARKETPLACE_OFFER_SUCCESS;

  constructor(public payload: { offer: MarketplaceOfferInterface }) {
  }
}

export class UpdateMarketplaceOfferFailure implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.UPDATE_MARKETPLACE_OFFER_FAILURE;

  constructor(public payload: { offer: MarketplaceOfferInterface; error: string }) {
  }
}

export class RejectMarketplaceOffer implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.REJECT_MARKETPLACE_OFFER;

  constructor(public payload: { offer: MarketplaceOfferInterface }) {
  }
}

export class RejectMarketplaceOfferSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.REJECT_MARKETPLACE_OFFER_SUCCESS;

  constructor(public payload: { offer: MarketplaceOfferInterface }) {
  }
}

export class RejectMarketplaceOfferFailure implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.REJECT_MARKETPLACE_OFFER_FAILURE;

  constructor(public payload: { offer: MarketplaceOfferInterface; error: string }) {
  }
}

export class RetractMarketplaceOffer implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.RETRACT_MARKETPLACE_OFFER;

  constructor(public payload: { offer: MarketplaceOfferInterface }) {
  }
}

export class RetractMarketplaceOfferSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.RETRACT_MARKETPLACE_OFFER_SUCCESS;

  constructor(public payload: { offer: MarketplaceOfferInterface }) {
  }
}

export class RetractMarketplaceOfferFailure implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.RETRACT_MARKETPLACE_OFFER_FAILURE;

  constructor(public payload: { offer: MarketplaceOfferInterface; error: string }) {
  }
}

export class AcceptMarketplaceOffer implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.ACCEPT_MARKETPLACE_OFFER;

  constructor(public payload: { offer: MarketplaceOfferInterface }) {
  }
}

export class AcceptMarketplaceOfferSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.ACCEPT_MARKETPLACE_OFFER_SUCCESS;

  constructor(public payload: { offer: MarketplaceOfferInterface }) {
  }
}

export class AcceptMarketplaceOfferFailure implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.ACCEPT_MARKETPLACE_OFFER_FAILURE;

  constructor(public payload: { offer: MarketplaceOfferInterface; error: string }) {
  }
}

export class CreateMarketplaceFeedback implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_MARKETPLACE_FEEDBACK;

  constructor(public payload: { feedback: MarketplaceFeedbackInterface }) {
  }
}

export class CreateMarketplaceFeedbackSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_MARKETPLACE_FEEDBACK_SUCCESS;

  constructor(public payload: { feedback: MarketplaceFeedbackInterface }) {
  }
}

export class CreateMarketplaceFeedbackFailure implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.CREATE_MARKETPLACE_FEEDBACK_FAILURE;

  constructor(public payload: { feedback: MarketplaceFeedbackInterface; error: string }) {
  }
}

export class GetMarketplaceFeedback implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.GET_MARKETPLACE_FEEDBACK;

  constructor(public payload: { listing: MarketplaceListingInterface }) {
  }
}

export class GetMarketplaceFeedbackSuccess implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.GET_MARKETPLACE_FEEDBACK_SUCCESS;

  constructor(public payload: { feedback: MarketplaceFeedbackInterface[] }) {
  }
}

export class GetMarketplaceFeedbackFailure implements PayloadActionInterface {
  readonly type = EquipmentActionTypes.GET_MARKETPLACE_FEEDBACK_FAILURE;

  constructor(public payload: { listing: MarketplaceListingInterface; error: string }) {
  }
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

  // Generic equipment items
  | LoadEquipmentItem
  | LoadEquipmentItemSuccess
  | FindAllEquipmentItems
  | FindAllEquipmentItemsSuccess
  | FindRecentlyUsedEquipmentItems
  | FindRecentlyUsedEquipmentItemsSuccess
  | FindSimilarInBrand
  | FindSimilarInBrandSuccess
  | GetAllInBrand
  | GetAllInBrandSuccess
  | GetOthersInBrand
  | GetOthersInBrandSuccess
  | ApproveEquipmentItem
  | ApproveEquipmentItemSuccess
  | UnapproveEquipmentItem
  | UnapproveEquipmentItemSuccess
  | FreezeEquipmentItemAsAmbiguous
  | FreezeEquipmentItemAsAmbiguousSuccess
  | UnfreezeEquipmentItemAsAmbiguous
  | UnfreezeEquipmentItemAsAmbiguousSuccess
  | RejectEquipmentItem
  | RejectEquipmentItemSuccess
  | FindEquipmentItemEditProposals
  | FindEquipmentItemEditProposalsSuccess
  | ApproveEquipmentItemEditProposal
  | ApproveEquipmentItemEditProposalSuccess
  | RejectEquipmentItemEditProposal
  | RejectEquipmentItemEditProposalSuccess
  | GetMostOftenUsedWith
  | GetMostOftenUsedWithSuccess
  | GetContributors
  | GetContributorsSuccess
  | AssignItem
  | AssignItemSuccess
  | AssignEditProposal
  | AssignEditProposalSuccess

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
  | ItemBrowserSet
  | ItemBrowserExitFullscreen

  // Marketplace
  | LoadMarketplaceListings
  | LoadMarketplaceListingsSuccess
  | LoadMarketplaceListingsFailure
  | CreateMarketplaceListing
  | CreateMarketplaceListingSuccess
  | CreateMarketplaceListingFailure
  | LoadMarketplaceListing
  | LoadMarketplaceListingSuccess
  | LoadMarketplaceListingFailure
  | DeleteMarketplaceListing
  | DeleteMarketplaceListingSuccess
  | DeleteMarketplaceListingFailure
  | UpdateMarketplaceListing
  | UpdateMarketplaceListingSuccess
  | UpdateMarketplaceListingFailure
  | LoadMarketplacePrivateConversations
  | LoadMarketplacePrivateConversationsSuccess
  | LoadMarketplacePrivateConversationsFailure
  | CreateMarketplacePrivateConversation
  | CreateMarketplacePrivateConversationSuccess
  | CreateMarketplacePrivateConversationFailure
  | UpdateMarketplacePrivateConversation
  | UpdateMarketplacePrivateConversationSuccess
  | UpdateMarketplacePrivateConversationFailure
  | DeleteMarketplacePrivateConversation
  | DeleteMarketplacePrivateConversationSuccess
  | DeleteMarketplacePrivateConversationFailure
  | CreateMarketplaceOffer
  | CreateMarketplaceOfferSuccess
  | CreateMarketplaceOfferFailure
  | UpdateMarketplaceOffer
  | UpdateMarketplaceOfferSuccess
  | UpdateMarketplaceOfferFailure
  | ApproveMarketplaceListing
  | ApproveMarketplaceListingSuccess
  | ApproveMarketplaceListingFailure
  | RenewMarketplaceListing
  | RenewMarketplaceListingSuccess
  | RenewMarketplaceListingFailure
  | MarkMarketplaceLineItemAsSold
  | MarkMarketplaceLineItemAsSoldSuccess
  | MarkMarketplaceLineItemAsSoldFailure
  | RejectMarketplaceOffer
  | RejectMarketplaceOfferSuccess
  | RejectMarketplaceOfferFailure
  | RetractMarketplaceOffer
  | RetractMarketplaceOfferSuccess
  | RetractMarketplaceOfferFailure
  | AcceptMarketplaceOffer
  | AcceptMarketplaceOfferSuccess
  | AcceptMarketplaceOfferFailure
  | CreateMarketplaceFeedback
  | CreateMarketplaceFeedbackSuccess
  | CreateMarketplaceFeedbackFailure
  | GetMarketplaceFeedback
  | GetMarketplaceFeedbackSuccess
  | GetMarketplaceFeedbackFailure;
