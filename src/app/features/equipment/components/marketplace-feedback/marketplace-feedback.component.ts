import { Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import {
  MarketplaceFeedbackInterface,
  MarketplaceFeedbackTargetType
} from "@features/equipment/types/marketplace-feedback.interface";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { EquipmentMarketplaceService } from "@features/equipment/services/equipment-marketplace.service";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { NestedCommentsModalComponent } from "@shared/components/misc/nested-comments-modal/nested-comments-modal.component";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { LoadContentType } from "@app/store/actions/content-type.actions";
import { selectContentType } from "@app/store/selectors/app/content-type.selectors";
import { filter, take } from "rxjs/operators";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "astrobin-marketplace-feedback",
  templateUrl: "./marketplace-feedback.component.html",
  styleUrls: ["./marketplace-feedback.component.scss"]
})
export class MarketplaceFeedbackComponent extends BaseComponentDirective implements OnInit {
  readonly TargetType = MarketplaceFeedbackTargetType;

  @Input()
  feedback: MarketplaceFeedbackInterface;

  contentType: ContentTypeInterface;

  constructor(
    public readonly store$: Store<State>,
    public readonly equipmentMarketplaceService: EquipmentMarketplaceService,
    public readonly modalService: NgbModal,
    public readonly route: ActivatedRoute
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();

    const contentTypePayload = {
      appLabel: "astrobin_apps_equipment",
      model: "equipmentitemmarketplacefeedback"
    };

    this.store$.dispatch(new LoadContentType(contentTypePayload));

    this.store$.select(selectContentType, contentTypePayload).pipe(
      filter(contentType => !!contentType),
      take(1)
    ).subscribe(contentType => {
      this.contentType = contentType;

      const fragment = this.route.snapshot.fragment;
      if (fragment && fragment[0] === "c") {
        this.openCommentsModal();
      }
    });
  }

  openCommentsModal() {
    this.currentUser$.pipe(take(1)).subscribe(user => {
      const modalRef: NgbModalRef = this.modalService.open(NestedCommentsModalComponent, {
        size: "lg",
        centered: true
      });
      const modalComponent: NestedCommentsModalComponent = modalRef.componentInstance;

      modalComponent.contentType = this.contentType;
      modalComponent.objectId = this.feedback.id;
      modalComponent.allowSelfReply = false;
      modalComponent.showReplyButton = user.id === this.feedback.recipient || user.id === this.feedback.user;
      modalComponent.showTopLevelButton = user.id === this.feedback.recipient || user.id === this.feedback.user;
      modalComponent.topLevelFormHeight = 150;
    });
  }
}
