import type { OnInit } from "@angular/core";
import { Component, Input } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { LoadContentType } from "@app/store/actions/content-type.actions";
import { selectContentType } from "@app/store/selectors/app/content-type.selectors";
import type { MainState } from "@app/store/state";
import type { ContentTypeInterface } from "@core/interfaces/content-type.interface";
import type { UserInterface } from "@core/interfaces/user.interface";
import { EquipmentMarketplaceService } from "@core/services/equipment-marketplace.service";
import { LoadUser } from "@features/account/store/auth.actions";
import { selectUser } from "@features/account/store/auth.selectors";
import { MarketplaceFeedbackModalComponent } from "@features/equipment/components/marketplace-feedback-modal/marketplace-feedback-modal.component";
import { LoadMarketplaceListing } from "@features/equipment/store/equipment.actions";
import { selectMarketplaceListing } from "@features/equipment/store/equipment.selectors";
import {
  MarketplaceFeedbackInterface,
  MarketplaceFeedbackTargetType
} from "@features/equipment/types/marketplace-feedback.interface";
import type { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { NestedCommentsAutoStartTopLevelStrategy } from "@shared/components/misc/nested-comments/nested-comments.component";
import { NestedCommentsModalComponent } from "@shared/components/misc/nested-comments-modal/nested-comments-modal.component";
import { filter, take, takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-marketplace-feedback",
  templateUrl: "./marketplace-feedback.component.html",
  styleUrls: ["./marketplace-feedback.component.scss"]
})
export class MarketplaceFeedbackComponent extends BaseComponentDirective implements OnInit {
  readonly TargetType = MarketplaceFeedbackTargetType;

  @Input()
  feedback: MarketplaceFeedbackInterface;

  recipient: UserInterface;
  listing: MarketplaceListingInterface;
  contentType: ContentTypeInterface;

  constructor(
    public readonly store$: Store<MainState>,
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

    this.store$.dispatch(new LoadUser({ id: this.feedback.recipient }));
    this.store$.dispatch(new LoadMarketplaceListing({ id: this.feedback.listing }));
    this.store$.dispatch(new LoadContentType(contentTypePayload));

    this.store$
      .select(selectUser, this.feedback.recipient)
      .pipe(
        filter(user => !!user),
        takeUntil(this.destroyed$)
      )
      .subscribe(user => {
        this.recipient = user;
      });

    this.store$
      .select(selectMarketplaceListing, { id: this.feedback.listing })
      .pipe(
        filter(listing => !!listing),
        takeUntil(this.destroyed$)
      )
      .subscribe(listing => {
        this.listing = { ...listing };
        const feedback = listing.feedbacks.find(f => f.id === this.feedback.id);
        if (feedback) {
          this.feedback = { ...feedback };
        }
      });

    this.store$
      .select(selectContentType, contentTypePayload)
      .pipe(
        filter(contentType => !!contentType),
        take(1)
      )
      .subscribe(contentType => {
        this.contentType = contentType;

        const fragment = this.route.snapshot.fragment;
        if (fragment && fragment[0] === "c") {
          this.openCommentsModal();
        }
      });
  }

  openFeedbackModal(event: Event) {
    event.preventDefault();

    this.currentUser$.pipe(take(1)).subscribe(currentUser => {
      const targetType =
        currentUser.id === this.listing.user
          ? MarketplaceFeedbackTargetType.BUYER
          : MarketplaceFeedbackTargetType.SELLER;

      const modalRef = this.modalService.open(MarketplaceFeedbackModalComponent, {
        size: targetType === MarketplaceFeedbackTargetType.SELLER ? "xl" : "lg"
      });
      const componentInstance: MarketplaceFeedbackModalComponent = modalRef.componentInstance;

      componentInstance.listing = this.listing;
      componentInstance.user = this.recipient;
      componentInstance.targetType = targetType;
    });
  }

  openCommentsModal(event?: Event) {
    if (event) {
      event.preventDefault();
    }

    this.currentUser$.pipe(take(1)).subscribe(user => {
      NestedCommentsModalComponent.open(this.modalService, {
        contentType: this.contentType,
        objectId: this.feedback.id,
        allowSelfReply: false,
        showReplyButton: false,
        showTopLevelButton: false,
        topLevelFormHeight: 150,
        topLevelFormPlacement: "BOTTOM",
        autoStartTopLevelStrategy:
          user.id === this.feedback.recipient || user.id === this.feedback.user
            ? NestedCommentsAutoStartTopLevelStrategy.ALWAYS
            : null
      });
    });
  }
}
