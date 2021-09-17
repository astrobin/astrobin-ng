import { EquipmentItemBaseInterface } from "@features/equipment/interfaces/equipment-item-base.interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import { Observable } from "rxjs";

export enum EditProposalReviewStatus {
  ACCEPTED = "ACCEPTED",
  REJECTEd = "REJECTED"
}

export interface EditProposalChange {
  propertyName: string;
  before: string | number | null | Observable<string | number | null>;
  after: string | number | null | Observable<string | number | null>;
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
