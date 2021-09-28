import { UserInterface } from "@shared/interfaces/user.interface";
import { BrandInterface } from "@features/equipment/interfaces/brand.interface";

// TODO: complete
export enum EquipmentItemType {
  SENSOR = "SENSOR",
  CAMERA = "CAMERA",
  TELESCOPE = "TELESCOPE",
  MOUNT = "MOUNT",
  FILTER = "FILTER",
  ACCESSORY = "ACCESSORY",
  SOFTWARE = "SOFTWARE"
}

export enum EquipmentItemReviewerDecision {
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED"
}

export enum EquipmentItemReviewerRejectionReason {
  TYPO = "TYPO",
  WRONG_BRAND = "WRONG_BRAND",
  INACCURATE_DATA = "INACCURATE_DATA",
  INSUFFICIENT_DATA = "INSUFFICIENT_DATA",
  OTHER = "OTHER"
}

export interface EquipmentItemBaseInterface {
  id: number;
  deleted?: string;
  created: string;
  updated: string;
  createdBy: UserInterface["id"];
  reviewedBy?: UserInterface["id"];
  reviewedTimestamp?: string;
  reviewerDecision?: EquipmentItemReviewerDecision;
  reviewerRejectionReason?: EquipmentItemReviewerRejectionReason;
  reviewerComment?: string;
  brand: BrandInterface["id"];
  name: string;
  image?: string | File[];
}
