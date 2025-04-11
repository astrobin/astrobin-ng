import { AfterViewInit, OnInit, Component, Input } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MainState } from "@app/store/state";
import { UserInterface } from "@core/interfaces/user.interface";
import { EquipmentMarketplaceService } from "@core/services/equipment-marketplace.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { selectUser } from "@features/account/store/auth.selectors";
import { MarketplaceFeedbackModalComponent } from "@features/equipment/components/marketplace-feedback-modal/marketplace-feedback-modal.component";
import { selectMarketplaceListing } from "@features/equipment/store/equipment.selectors";
import { MarketplaceFeedbackTargetType } from "@features/equipment/types/marketplace-feedback.interface";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Observable } from "rxjs";
import { map, take, takeUntil } from "rxjs/operators";

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

  showLeaveFeedbackButton: boolean;
  alreadyHasFeedbackFromCurrentUser: boolean;
  stars: number[] = [0, 0, 0, 0, 0]; // 0: empty, 1: half, 2: full

  constructor(
    public readonly store$: Store<MainState>,
    public readonly marketplaceService: EquipmentMarketplaceService,
    public readonly modalService: NgbModal,
    public readonly activatedRoute: ActivatedRoute,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translateService: TranslateService,
    public readonly equipmentMarketplaceService: EquipmentMarketplaceService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.store$
      .select(selectMarketplaceListing, { id: this.listing.id })
      .pipe(takeUntil(this.destroyed$))
      .subscribe(listing => {
        this.listing = { ...listing };
        this.updateState();
      });

    this.store$
      .select(selectUser, this.user.id)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(user => {
        this.user = user;
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
    this.calculateStarRating();

    this.allowLeavingFeedback().subscribe(allow => {
      this.showLeaveFeedbackButton = allow;
    });

    this.alreadyHasFeedbackFromCurrentUser = this.alreadyHasFeedback();
  }

  alreadyHasFeedback(): boolean {
    // Consider that:
    // - if the current user is the owner of the listing, then the feedback items coming form the API are only the ones
    //   that the current user has received, or that users with accepted offers have received.
    // - if the current user is a buyer, then the feedback items coming from the API are only the ones that the user has
    //   received.
    return (
      !!this.listing?.feedbacks &&
      this.listing.feedbacks.some(feedback => {
        return feedback.recipient === this.user.id;
      })
    );
  }

  allowLeavingFeedback(): Observable<boolean> {
    return this.currentUser$.pipe(
      take(1),
      map(currentUser => {
        return this.equipmentMarketplaceService.allowLeavingFeedbackToListing(
          this.listing,
          currentUser?.id,
          this.user.id
        );
      })
    );
  }

  calculateStarRating(): void {
    const feedbackPercentage = this.user.marketplaceFeedback;
    const fullStars = Math.floor(feedbackPercentage / 20);
    const halfStar = feedbackPercentage % 20 >= 10 ? 1 : 0;

    for (let i = 0; i < fullStars; i++) {
      this.stars[i] = 2;
    }

    if (halfStar && fullStars < 5) {
      this.stars[fullStars] = 1;
    }
  }

  showFeedbackModal(): void {
    this.allowLeavingFeedback().subscribe(allow => {
      if (allow) {
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
          componentInstance.user = this.user;
          componentInstance.targetType = targetType;
        });
      } else {
        this.popNotificationsService.error(
          this.translateService.instant("You can't leave feedback for this user on this page.")
        );
      }
    });
  }
}
