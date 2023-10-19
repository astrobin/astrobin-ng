import { UserInterface } from "@shared/interfaces/user.interface";
import { MarketplaceListingLineItemInterface } from "@features/equipment/types/marketplace-listing-line-item.interface";


export enum MarketplaceListingShippingMethod {
  STANDARD_MAIL = "STANDARD_MAIL",
  COURIER = "COURIER",
  ELECTRONIC = "ELECTRONIC",
  OTHER = "OTHER",
}

export interface MarketplaceListingInterface {
  id?: number;
  user?: UserInterface["id"];
  created: string;
  updated: string;
  expiration: string;
  description: string | null;
  deliveryByBuyerPickup: boolean;
  deliveryBySellerDelivery: boolean;
  deliveryByShipping: boolean;
  shippingMethod: MarketplaceListingShippingMethod | null;
  latitude: number | null;
  longitude: number | null;
  country: string | null;
  lineItems: MarketplaceListingLineItemInterface[];
}
