import { UserInterface } from "@shared/interfaces/user.interface";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";


export enum MarketplaceFeedbackValue {
  NEGATIVE = "NEGATIVE",
  NEUTRAL = "NEUTRAL",
  POSITIVE = "POSITIVE",
}

export enum MarketplaceFeedbackTargetType {
  SELLER = "SELLER",
  BUYER = "BUYER"
}

export interface MarketplaceFeedbackInterface {
  id?: number;
  user?: UserInterface["id"];
  recipient?: UserInterface["id"];
  listing?: MarketplaceListingInterface["id"];
  created?: string;
  communicationValue: MarketplaceFeedbackValue;
  speedValue: MarketplaceFeedbackValue;
  accuracyValue: MarketplaceFeedbackValue;
  packagingValue: MarketplaceFeedbackValue;
  message?: string;
  targetType?: MarketplaceFeedbackTargetType;
  marketplaceFeedbackCount?: number;
  marketplaceFeedback?: number;
}
