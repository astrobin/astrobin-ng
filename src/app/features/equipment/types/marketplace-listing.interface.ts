import { UserInterface } from "@shared/interfaces/user.interface";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";
import { MarketplaceFeedbackInterface } from "@features/equipment/types/marketplace-feedback.interface";

export enum MarketplaceListingType {
  FOR_SALE = "FOR_SALE",
  WANTED = "WANTED",
}

export enum MarketplaceListingShippingMethod {
  STANDARD_MAIL = "STANDARD_MAIL",
  COURIER = "COURIER",
  ELECTRONIC = "ELECTRONIC",
  OTHER = "OTHER",
}

export enum MarketplaceListingExpiration {
  ONE_WEEK = "ONE_WEEK",
  TWO_WEEKS = "TWO_WEEKS",
  ONE_MONTH = "ONE_MONTH",
}

export interface MarketplaceListingInterface {
  id?: number;
  hash?: string;
  listingType: MarketplaceListingType;
  user?: UserInterface["id"];
  userDisplayName?: UserInterface["displayName"];
  created: string;
  updated: string;
  firstApproved?: string | null;
  approved?: string | null;
  approvedBy?: UserInterface["id"];
  expiration: string;
  title: string | null;
  description: string | null;
  deliveryByBuyerPickUp: boolean;
  deliveryBySellerDelivery: boolean;
  deliveryByShipping: boolean;
  shippingMethod: MarketplaceListingShippingMethod | null;
  latitude: number | null;
  longitude: number | null;
  country: string | null;
  city: string | null;
  lineItems?: MarketplaceLineItemInterface[];
  followerCount?: number;
  viewCount?: number;
  hitcountPk?: number;
  slug?: string;
  feedbacks?: MarketplaceFeedbackInterface[];
  // Whether the current user is following this listing
  followed?: boolean;
}
