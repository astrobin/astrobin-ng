import { UserInterface } from "@shared/interfaces/user.interface";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";

export interface MarketplaceImageInterface {
  id?: number;
  hash?: string;
  user?: UserInterface["id"];
  lineItem: MarketplaceLineItemInterface["id"];
  imageFile: string;
  w: number;
  h: number;
  thumbnailFile: string;
  thumbnailW: number;
  thumbnailH: number;
  created: string;
}
