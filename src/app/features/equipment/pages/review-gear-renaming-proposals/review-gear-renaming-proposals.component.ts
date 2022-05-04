import { Component, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { HttpClient } from "@angular/common/http";
import { environment } from "@env/environment";
import { ActivatedRoute } from "@angular/router";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { LoadingService } from "@shared/services/loading.service";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { RejectReviewGearRenamingProposalsModalComponent } from "@features/equipment/components/reject-review-gear-renaming-proposals-modal/reject-review-gear-renaming-proposals-modal.component";
import { take } from "rxjs/operators";

export enum GearRenamingProposalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  AUTO_APPROVED = "AUTO_APPROVED",
  REJECTED = "REJECTED"
}

export interface GearRenamingProposal {
  id: number;
  oldMake: string;
  newMake: string;
  oldName: string;
  newName: string;
  status: GearRenamingProposalStatus;
  rejectReason: string;
  modified: boolean;
}

export type GearRenamingProposalItemType = "camera";

@Component({
  selector: "astrobin-review-gear-renaming-proposals",
  templateUrl: "./review-gear-renaming-proposals.component.html",
  styleUrls: ["./review-gear-renaming-proposals.component.scss"]
})
export class ReviewGearRenamingProposalsComponent extends BaseComponentDirective implements OnInit {
  GearRenamingProposalStatus = GearRenamingProposalStatus;

  baseUrl = `${environment.classicApiUrl}/api/v2/astrobin`;
  itemType: GearRenamingProposalItemType;
  proposals: GearRenamingProposal[] = [];

  constructor(
    public readonly store$: Store<State>,
    public readonly activatedRoute: ActivatedRoute,
    public readonly http: HttpClient,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly loadingService: LoadingService,
    public readonly modalService: NgbModal
  ) {
    super(store$);
  }

  ngOnInit(): void {
    this.itemType = this.activatedRoute.snapshot.paramMap.get("itemType") as GearRenamingProposalItemType;
    this.getProposals();
  }

  getProposals() {
    this.loadingService.setLoading(true);
    this.http
      .get<GearRenamingProposal[]>(`${this.baseUrl}/${this.itemType}-rename-proposal/?status=PENDING`)
      .subscribe(proposals => {
        this.loadingService.setLoading(false);
        this.proposals = proposals;
      });
  }

  approve($event, proposal: GearRenamingProposal) {
    $event.preventDefault();
    this.loadingService.setLoading(true);
    this.http
      .put<GearRenamingProposal>(`${this.baseUrl}/${this.itemType}-rename-proposal/${proposal.id}/approve/`, {})
      .subscribe(() => {
        this.loadingService.setLoading(false);
        proposal.status = GearRenamingProposalStatus.APPROVED;
        this._checkIfAllDone();
      });
  }

  reject($event, proposal: GearRenamingProposal) {
    $event.preventDefault();

    const modal: NgbModalRef = this.modalService.open(RejectReviewGearRenamingProposalsModalComponent);

    modal.closed.pipe(take(1)).subscribe(rejectReason => {
      if (!!rejectReason) {
        this.loadingService.setLoading(true);
        this.http
          .put<GearRenamingProposal>(`${this.baseUrl}/${this.itemType}-rename-proposal/${proposal.id}/reject/`, {
            rejectReason
          })
          .subscribe(() => {
            this.loadingService.setLoading(false);
            proposal.status = GearRenamingProposalStatus.REJECTED;
            proposal.rejectReason = rejectReason;
            this._checkIfAllDone();
          });
      }
    });
  }

  private _checkIfAllDone() {
    const pending = this.proposals.filter(proposal => proposal.status === GearRenamingProposalStatus.PENDING);
    if (pending.length === 0) {
      this.popNotificationsService.success("Great, thank you for your feedback! Feel free to leave this page now.");
    }
  }
}
