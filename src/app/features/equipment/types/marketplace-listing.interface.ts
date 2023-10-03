import { UserInterface } from "@shared/interfaces/user.interface";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";

export enum MarketplaceListingCondition {
  UNOPENED = "UNOPENED",
  NEW = "NEW",
  USER = "USED",
  DAMAGED_OR_DEFECTIVE = "DAMAGED_OR_DEFECTIVE",
  OTHER = "OTHER",
}

export enum MarketplaceListingShippingMethod {
  STANDARD_MAIL = "STANDARD_MAIL",
  COURIER = "COURIER",
  ELECTRONIC = "ELECTRONIC",
  OTHER = "OTHER",
}

export interface MarketplaceListingInterface {
  id: number;
  user: UserInterface["id"];
  created: string;
  updated: string;
  expiration: string;
  sold: string | null;
  soldTo: UserInterface["id"] | null;
  reserved: string | null;
  reservedTo: UserInterface["id"] | null;
  price: number;
  currency: string;
  condition: MarketplaceListingCondition;
  yearOfPurchase: number | null;
  deliveryByBuyerPickup: boolean;
  deliveryBySellerDelivery: boolean;
  deliveryByShipping: boolean;
  shippingMethod: MarketplaceListingShippingMethod | null;
  shippingCost: number | null;
  latitude: number | null;
  longitude: number | null;
  country: string | null;
  itemContentType: ContentTypeInterface["id"];
  itemObjectId: number;
}
