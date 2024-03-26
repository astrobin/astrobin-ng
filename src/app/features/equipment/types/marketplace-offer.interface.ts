import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";

export enum MarketplaceOfferStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED"
}

export interface MarketplaceOfferInterface {
  id?: number;
  listing: MarketplaceListingInterface["id"];
  lineItem: MarketplaceLineItemInterface["id"];
  linetItemDisplayName?: string;
  user?: UserInterface["id"];
  userDisplayName?: string;
  created?: string;
  updated?: string;
  amount?: number;
  status?: MarketplaceOfferStatus;
}
