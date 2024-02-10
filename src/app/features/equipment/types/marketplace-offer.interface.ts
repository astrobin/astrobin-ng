import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";

export interface MarketplaceOfferInterface {
  id?: number;
  listing: MarketplaceListingInterface["id"];
  lineItem: MarketplaceLineItemInterface["id"];
  user?: UserInterface["id"];
  created?: string;
  updated?: string;
  amount?: number;
}
