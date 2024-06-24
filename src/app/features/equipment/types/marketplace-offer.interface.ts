import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";
import { MarketplaceMasterOfferInterface } from "@features/equipment/types/marketplace-master-offer.interface";
import { MarketplaceOfferStatus } from "@features/equipment/types/marketplace-offer-status.type";

export interface MarketplaceOfferInterface {
  id?: number;
  listing: MarketplaceListingInterface["id"];
  lineItem: MarketplaceLineItemInterface["id"];
  linetItemDisplayName?: string;
  user?: UserInterface["id"];
  username?: string;
  userDisplayName?: string;
  created?: string;
  updated?: string;
  amount?: number;
  status?: MarketplaceOfferStatus;
  masterOffer?: MarketplaceMasterOfferInterface["id"];
  masterOfferUuid?: string;
}
