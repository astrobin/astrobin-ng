import { UserInterface } from "@shared/interfaces/user.interface";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";

export interface MarketplaceImageInterface {
  id: number;
  user: UserInterface["id"];
  lineItem: MarketplaceLineItemInterface["id"];
  imageFile: string;
  w: number;
  h: number;
  created: string;
}
