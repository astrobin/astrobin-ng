import type { UserInterface } from "@core/interfaces/user.interface";
import type { BrandInterface } from "@features/equipment/types/brand.interface";
import type { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import type { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import type { StockStatus } from "@features/equipment/types/stock-status.type";

export enum EquipmentItemListingType {
  SELLS = "SELLS",
  PAIRS_WELL = "PAIRS_WELL"
}

export interface EquipmentRetailerInterface {
  id: number;
  created: string;
  updated: string;
  name: string;
  website: string;
  logo: string;
  countries: string;
  createdBy: UserInterface["id"] | null;
}

export interface EquipmentBrandListingInterface {
  id: number;
  created: string;
  updated: string;
  url: string;
  urlDe: string | null;
  createdBy: UserInterface["id"] | null;
  brand: BrandInterface;
  retailer: EquipmentRetailerInterface;
}

export interface EquipmentItemListingInterface {
  id: number;
  created: string;
  updated: string;
  listingType: EquipmentItemListingType;
  url: string;
  urlDe: string | null;
  imageUrl: string | null;
  createdBy: UserInterface["id"] | null;
  itemType: EquipmentItemType;
  item: EquipmentItem["id"];
  itemFullName: string;
  name: string;
  retailer: EquipmentRetailerInterface;
  stockStatus?: StockStatus;
  stockAmount?: number;
}

export interface EquipmentListingsInterface {
  brandListings: EquipmentBrandListingInterface[];
  itemListings: EquipmentItemListingInterface[];
  allowFullRetailerIntegration: boolean;
}
