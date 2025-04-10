import type { UserInterface } from "@core/interfaces/user.interface";
import type { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import type { MarketplaceOfferStatus } from "@features/equipment/types/marketplace-offer-status.type";

export interface MarketplaceMasterOfferInterface {
  id?: number;
  listing: MarketplaceListingInterface["id"];
  user?: UserInterface["id"];
  username?: UserInterface["username"];
  userDisplayName?: string;
  created?: string;
  updated?: string;
  status?: MarketplaceOfferStatus;
  masterOfferUuid?: string;
}
