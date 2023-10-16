import { UserInterface } from "@shared/interfaces/user.interface";
import { MarketplaceListingLineItemInterface } from "@features/equipment/types/marketplace-listing-line-item.interface";

export interface MarketplaceListingLineItemImageInterface {
  id: number;
  user: UserInterface["id"];
  lineItem: MarketplaceListingLineItemInterface["id"];
  imageFile: string;
  w: number;
  h: number;
  created: string;
}
