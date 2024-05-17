import { UserInterface } from "@shared/interfaces/user.interface";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";


export enum MarketplaceFeedbackValue {
  NEGATIVE = "NEGATIVE",
  NEUTRAL = "NEUTRAL",
  POSITIVE = "POSITIVE",
}

export enum MarketplaceFeedbackCategory {
  COMMUNICATION = "COMMUNICATION",
  SPEED = "SPEED",
  ACCURACY = "ACCURACY",
  PACKAGING = "PACKAGING",
}

export enum MarketplaceFeedbackTargetType {
  SELLER = "SELLER",
  BUYER = "BUYER"
}

export interface MarketplaceFeedbackInterface {
  id?: number;
  user?: UserInterface["id"];
  lineItem?: MarketplaceLineItemInterface["id"];
  created?: string;
  value: MarketplaceFeedbackValue;
  category: MarketplaceFeedbackCategory;
  targetType?: MarketplaceFeedbackTargetType;
}
