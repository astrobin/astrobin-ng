import { AfterViewInit, Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { UserInterface } from "@shared/interfaces/user.interface";
import { EquipmentMarketplaceService } from "@features/equipment/services/equipment-marketplace.service";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { take, takeUntil } from "rxjs/operators";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { MarketplaceFeedbackModalComponent } from "@features/equipment/components/marketplace-feedback-modal/marketplace-feedback-modal.component";
import { selectMarketplaceListing } from "@features/equipment/store/equipment.selectors";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "astrobin-marketplace-feedback-widget",
  templateUrl: "./marketplace-feedback-widget.component.html",
  styleUrls: ["./marketplace-feedback-widget.component.scss"]
})
export class MarketplaceFeedbackWidgetComponent extends BaseComponentDirective implements OnInit, AfterViewInit {
  @Input()
  user: UserInterface;

  @Input()
  listing: MarketplaceListingInterface;

  currentUserIsBuyer: boolean;
  hasFeedback: boolean;

  constructor(
    public readonly store$: Store<State>,
    public readonly marketplaceService: EquipmentMarketplaceService,
    public readonly modalService: NgbModal,
    public readonly activatedRoute: ActivatedRoute
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.updateState();

    this.store$.select(selectMarketplaceListing, { id: this.listing.id }).pipe(takeUntil(this.destroyed$)).subscribe(listing => {
      this.listing = listing;
      this.updateState();
    });
  }

  ngAfterViewInit(): void {
    const fragment = this.activatedRoute.snapshot.fragment;

    if (fragment === "feedback") {
      this.showFeedbackModal();
    }
  }

  updateState(): void {
    this.currentUser$
      .pipe(take(1))
      .subscribe(user => {
        this.currentUserIsBuyer = this.marketplaceService.userIsBuyer(user, this.listing);
        this.listing.lineItems.forEach(lineItem => {
          lineItem.feedbacks.forEach(feedback => {
            if (feedback.user === user.id) {
              this.hasFeedback = true;
            }
          });
        });
      });
  }

  showFeedbackModal(): void {
    const modalRef = this.modalService.open(MarketplaceFeedbackModalComponent, { size: "xl" });
    const componentInstance: MarketplaceFeedbackModalComponent = modalRef.componentInstance;
    componentInstance.listing = this.listing;
    componentInstance.user = this.user;
  }
}
