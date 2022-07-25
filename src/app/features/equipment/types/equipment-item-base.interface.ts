import { UserInterface } from "@shared/interfaces/user.interface";
import { BrandInterface } from "@features/equipment/types/brand.interface";
import { ForumInterface } from "@shared/interfaces/forums/forum.interface";

export enum EquipmentItemType {
  SENSOR = "SENSOR",
  CAMERA = "CAMERA",
  TELESCOPE = "TELESCOPE",
  MOUNT = "MOUNT",
  FILTER = "FILTER",
  ACCESSORY = "ACCESSORY",
  SOFTWARE = "SOFTWARE"
}

export enum EquipmentItemUsageType {
  IMAGING = "IMAGING",
  GUIDING = "GUIDING"
}

export enum EquipmentItemReviewerDecision {
  APPROVED = "APPROVED",
  REJECTED = "REJECTED"
}

export enum EquipmentItemReviewerRejectionReason {
  TYPO = "TYPO",
  WRONG_BRAND = "WRONG_BRAND",
  INACCURATE_DATA = "INACCURATE_DATA",
  INSUFFICIENT_DATA = "INSUFFICIENT_DATA",
  DUPLICATE = "DUPLICATE",
  OTHER = "OTHER"
}

export interface EquipmentItemBaseInterface {
  id: number;
  deleted?: string;
  created: string;
  updated: string;
  lastAddedOrRemovedFromImage: string;
  klass: EquipmentItemType;
  createdBy: UserInterface["id"];
  assignee: UserInterface["id"] | null;
  reviewedBy?: UserInterface["id"];
  reviewedTimestamp?: string;
  reviewerDecision?: EquipmentItemReviewerDecision;
  reviewerRejectionReason?: EquipmentItemReviewerRejectionReason;
  reviewerComment?: string;
  diy?: boolean;
  brand: BrandInterface["id"];
  brandName: BrandInterface["name"];
  name: string;
  variantOf: number | null;
  variants: EquipmentItemBaseInterface[];
  website: string;
  image?: string | File[];
  communityNotes: string | null;
  frozenAsAmbiguous: boolean | null;
  forum: ForumInterface["id"] | null;
  userCount: number | null;
  imageCount: number | null;
}
