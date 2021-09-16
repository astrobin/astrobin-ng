import { EquipmentItemBaseInterface } from "@features/equipment/interfaces/equipment-item-base.interface";
import { UserInterface } from "@shared/interfaces/user.interface";

export enum EditProposalReviewStatus {
  ACCEPTED = "ACCEPTED",
  REJECTEd = "REJECTED"
}

export interface EditProposalChange {
  propertyName: string;
  before: any;
  after: any;
}

export interface EditProposalInterface<T extends EquipmentItemBaseInterface> extends EquipmentItemBaseInterface {
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
  editProposalReviewStatus?: EditProposalReviewStatus;
}
