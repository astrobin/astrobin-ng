import type { ContentTypeInterface } from "@core/interfaces/content-type.interface";
import type { UserInterface } from "@core/interfaces/user.interface";
import type { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import type { MarketplaceImageInterface } from "@features/equipment/types/marketplace-image.interface";
import type { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import type { MarketplaceOfferInterface } from "@features/equipment/types/marketplace-offer.interface";

export enum MarketplaceListingCondition {
  UNOPENED = "UNOPENED",
  NEW = "NEW",
  USED = "USED",
  DAMAGED_OR_DEFECTIVE = "DAMAGED_OR_DEFECTIVE",
  OTHER = "OTHER"
}

export enum MarketplaceLineItemFindItemMode {
  USER = "USER",
  ALL = "ALL",
  PLAIN = "PLAIN"
}

export enum MarketplaceShippingCostType {
  NO_SHIPPING = "NO_SHIPPING",
  COVERED_BY_SELLER = "COVERED_BY_SELLER",
  FIXED = "FIXED",
  TO_BE_AGREED = "TO_BE_AGREED"
}

export interface MarketplaceLineItemInterface {
  id?: number;
  hash?: string;
  user?: UserInterface["id"];
  listing?: MarketplaceListingInterface["id"];
  listingHash?: MarketplaceListingInterface["hash"];
  created: string;
  updated: string;
  sold: string | null;
  soldTo: UserInterface["id"] | null;
  reserved: string | null;
  reservedTo: UserInterface["id"] | null;
  price: number;
  currency: string;
  condition: MarketplaceListingCondition;
  yearOfPurchase: number | null;
  shippingCostType: MarketplaceShippingCostType | null;
  shippingCost: number | null;
  description: string | null;
  findItemMode?: MarketplaceLineItemFindItemMode;
  itemObjectId: number;
  itemContentType: ContentTypeInterface["id"];
  itemContentTypeSelector?: EquipmentItemType; // Only needed for the form.
  itemPlainText?: string;
  itemName?: string;
  images?: MarketplaceImageInterface[] | { file: File; url: string }[];
  totalImageCount?: number;
  sellerImageCount?: number;
  itemKlass?: EquipmentItemType;
  username?: string;
  firstAddedToAnImage?: string;
  slug?: string;
  offers?: MarketplaceOfferInterface[];
}
