import { UserInterface } from "@shared/interfaces/user.interface";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";


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
  user?: UserInterface["id"];
  created: string;
  updated: string;
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
  bundleSaleOnly: boolean;
  followerCount?: number;
  viewCount?: number;
  hitcountPk?: number;
  slug?: string;
}
