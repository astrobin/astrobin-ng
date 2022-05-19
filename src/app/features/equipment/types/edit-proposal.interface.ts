import { EquipmentItemBaseInterface } from "@features/equipment/types/equipment-item-base.interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import { Observable } from "rxjs";

export enum EditProposalReviewStatus {
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  SUPERSEDED = "SUPERSEDED"
}

export interface EditProposalChange {
  propertyName: string;
  before: string | number | null | Observable<string | number | null>;
  after: string | number | null | Observable<string | number | null>;
}

export interface EditProposalInterface<T extends EquipmentItemBaseInterface> extends EquipmentItemBaseInterface {
  editProposalOriginalProperties: string;
  editProposalTarget: T["id"];
  editProposalBy?: UserInterface["id"];
  editProposalCreated: string;
  editProposalUpdated: string;
  editProposalIp?: string;
  editProposalComment?: string;
  editProposalReviewedBy?: UserInterface["id"];
  editProposalReviewTimestamp?: string;
  editProposalReviewIp?: string;
  editProposalReviewComment?: string;
  editProposalReviewStatus?: EditProposalReviewStatus | null;

  // Any property of interfaces extending EquipmentItemBaseInterface.
  [property: string]: any;
}
