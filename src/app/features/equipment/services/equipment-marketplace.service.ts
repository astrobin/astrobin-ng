import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { merge, Observable, switchMap } from "rxjs";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { LoadContentTypeById } from "@app/store/actions/content-type.actions";
import { selectContentTypeById } from "@app/store/selectors/app/content-type.selectors";
import { filter, take } from "rxjs/operators";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import {
  CreateMarketplaceOffer,
  CreateMarketplaceOfferFailure,
  CreateMarketplaceOfferSuccess,
  EquipmentActionTypes,
  LoadEquipmentItem,
  RejectMarketplaceOffer,
  RejectMarketplaceOfferFailure,
  RejectMarketplaceOfferSuccess,
  RetractMarketplaceOffer,
  RetractMarketplaceOfferFailure,
  RetractMarketplaceOfferSuccess,
  UpdateMarketplaceOffer,
  UpdateMarketplaceOfferFailure,
  UpdateMarketplaceOfferSuccess
} from "@features/equipment/store/equipment.actions";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import {
  MarketplaceListingInterface,
  MarketplaceListingType
} from "@features/equipment/types/marketplace-listing.interface";
import { selectCurrentUser, selectUser } from "@features/account/store/auth.selectors";
import { LoadUser } from "@features/account/store/auth.actions";
import { MarketplaceOfferInterface } from "@features/equipment/types/marketplace-offer.interface";
import { TranslateService } from "@ngx-translate/core";
import { NgbActiveModal, NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { Actions, ofType } from "@ngrx/effects";
import { MarketplaceOfferStatus } from "@features/equipment/types/marketplace-offer-status.type";
import { SubscriptionRequiredModalComponent } from "@shared/components/misc/subscription-required-modal/subscription-required-modal.component";
import { SimplifiedSubscriptionName } from "@shared/types/subscription-name.type";
import { UserSubscriptionService } from "@shared/services/user-subscription/user-subscription.service";
import { Router } from "@angular/router";
import { MarketplaceFeedbackValue } from "@features/equipment/types/marketplace-feedback.interface";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { MarketplaceAcceptRejectRetractOfferModalComponent } from "@features/equipment/components/marketplace-accept-reject-retract-offer-modal/marketplace-accept-reject-retract-offer-modal.component";

@Injectable({
  providedIn: "root"
})
export class EquipmentMarketplaceService extends BaseService {
  selectRegionTooltipAlreadyShown = false;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly modalService: NgbModal,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly router: Router
  ) {
    super(loadingService);
  }

  static offersByUser(userId: UserInterface["id"], listing: MarketplaceListingInterface): MarketplaceOfferInterface[] {
    return listing.lineItems.reduce((acc, lineItem) => {
      const userOffers = lineItem.offers.filter(offer => offer.user === userId);
      return acc.concat(userOffers);
    }, []);
  }

  humanizeListingType(type: MarketplaceListingType): string {
    switch (type) {
      case MarketplaceListingType.FOR_SALE:
        return this.translateService.instant("For sale");
      case MarketplaceListingType.WANTED:
        return this.translateService.instant("Wanted");
      default:
        return this.translateService.instant("Unknown");
    }
  }

  humanizeOfferStatus(status: MarketplaceOfferStatus): string {
    switch (status) {
      case MarketplaceOfferStatus.ACCEPTED:
        return this.translateService.instant("Accepted");
      case MarketplaceOfferStatus.REJECTED:
        return this.translateService.instant("Rejected");
      case MarketplaceOfferStatus.RETRACTED:
        return this.translateService.instant("Retracted");
      case MarketplaceOfferStatus.PENDING:
        return this.translateService.instant("Pending");
      default:
        return this.translateService.instant("Unknown");
    }
  }

  humanizeFeedbackValue(value: MarketplaceFeedbackValue): string {
    switch (value) {
      case MarketplaceFeedbackValue.POSITIVE:
        return this.translateService.instant("Positive");
      case MarketplaceFeedbackValue.NEUTRAL:
        return this.translateService.instant("Neutral");
      case MarketplaceFeedbackValue.NEGATIVE:
        return this.translateService.instant("Negative");
      default:
        return this.translateService.instant("Unknown");
    }
  }

  iconizeFeedbackValue(value: MarketplaceFeedbackValue): IconProp {
    switch (value) {
      case MarketplaceFeedbackValue.POSITIVE:
        return "smile";
      case MarketplaceFeedbackValue.NEUTRAL:
        return "meh";
      case MarketplaceFeedbackValue.NEGATIVE:
        return "frown";
      default:
        return "question";
    }
  }

  offerErrorMessageForSeller(): string {
    return this.translateService.instant(
      "This operation cannot be performed. Perhaps the buyer retracted the offer, or the line item is sold."
    );
  }

  offerErrorMessageForBuyer(): string {
    return this.translateService.instant(
      "This operation cannot be performed. Perhaps the seller rejected the offer, or the line item is sold."
    );
  }

  getLineItemEquipmentItem$(lineItem: MarketplaceLineItemInterface): Observable<EquipmentItem> {
    const contentTypePayload = { id: lineItem.itemContentType };

    this.store$.dispatch(new LoadContentTypeById(contentTypePayload));

    return this.store$.select(selectContentTypeById, contentTypePayload).pipe(
      filter(contentType => !!contentType),
      take(1),
      switchMap((contentType: ContentTypeInterface) => {
        const payload = {
          id: lineItem.itemObjectId,
          type: EquipmentItemType[contentType.model.toUpperCase()],
          allowUnapproved: true,
          allowDIY: true
        };

        this.store$.dispatch(new LoadEquipmentItem(payload));
        return this.store$.select(selectEquipmentItem, payload);
      })
    );
  }

  getListingUser$(listing: MarketplaceListingInterface): Observable<UserInterface> {
    this.store$.dispatch(new LoadUser({ id: listing.user }));
    return this.store$.select(selectUser, listing.user);
  }

  userHasFeedback(user: UserInterface): boolean {
    return user.marketplaceFeedbackCount > 0;
  }

  allowLeavingFeedbackToLineItem(
    lineItem: MarketplaceLineItemInterface,
    currentUserId: UserInterface["id"],
    targetUserId: UserInterface["id"]
  ): boolean {
    if (currentUserId === targetUserId) {
      return false;
    }

    if (currentUserId === lineItem.user) {
      // The current user is the seller, and the user in this component has some accepted or retracted offers
      return lineItem.offers.some(offer =>
        offer.user === targetUserId && (
          offer.status === MarketplaceOfferStatus.ACCEPTED ||
          offer.status === MarketplaceOfferStatus.RETRACTED
        ));
    }

    // The current user is not the seller, so they can leave feedback if they have accepted or rejected offers.
    return lineItem.offers.some(offer =>
      offer.user === currentUserId && (
        offer.status === MarketplaceOfferStatus.ACCEPTED ||
        offer.status === MarketplaceOfferStatus.REJECTED
      ));
  }

  allowLeavingFeedbackToListing(
    listing: MarketplaceListingInterface,
    currentUserId: UserInterface["id"],
    targetUserId: UserInterface["id"]
  ): boolean {
    if (currentUserId === null || currentUserId === undefined) {
      return false;
    }

    if (currentUserId === targetUserId) {
      return false;
    }

    if (currentUserId === listing.user) {
      return listing.lineItems.some(lineItem =>
        this.allowLeavingFeedbackToLineItem(lineItem, currentUserId, targetUserId)
      );
    }

    return listing.lineItems.some(lineItem =>
      this.allowLeavingFeedbackToLineItem(lineItem, currentUserId, targetUserId)
    );
  }

  // Returns whether the user is the buyer of any line item in the listing.
  userIsBuyer(userId: UserInterface["id"], listing: MarketplaceListingInterface): boolean {
    return listing.lineItems.some(lineItem => lineItem.soldTo === userId);
  }

  // This method assumes that `previousListing` has lineItem IDs/ It's used to compare an existing listing to a listing
  // that's being updated. It returns an array of changed, added, and removed line items.
  compareLineItems(
    updatedListing: MarketplaceListingInterface,
    previousListing: MarketplaceListingInterface
  ): [MarketplaceLineItemInterface[], MarketplaceLineItemInterface[], MarketplaceLineItemInterface[]] {
    function getLineItemsMap(listing: MarketplaceListingInterface): Map<number, MarketplaceLineItemInterface> {
      return new Map<number, MarketplaceLineItemInterface>(
        listing.lineItems?.filter(item => item.id != null).map(item => [item.id!, item]) ?? []
      );
    }

    const updatedLineItemsMap = getLineItemsMap(updatedListing);
    const previousLineItemsMap = getLineItemsMap(previousListing);

    let preservedLineItems: MarketplaceLineItemInterface[] = [];
    let addedLineItems: MarketplaceLineItemInterface[] = [];
    let removedLineItems: MarketplaceLineItemInterface[] = [];

    // Check for changed and added line items
    updatedLineItemsMap.forEach((item, id) => {
      if (!previousLineItemsMap.has(id)) {
        addedLineItems.push(item);
      }

      if (item.id && previousLineItemsMap.has(id)) {
        preservedLineItems.push(item);
      }
    });

    // Check for added line items without an id (they wouldn't be in the Map)
    updatedListing.lineItems
      ?.filter(item => !item.id)
      .forEach(item => {
        addedLineItems.push(item);
      });

    // Check for removed line items
    previousLineItemsMap.forEach((item, id) => {
      if (!updatedLineItemsMap.has(id)) {
        removedLineItems.push(previousLineItemsMap.get(id)!);
      }
    });

    return [preservedLineItems, addedLineItems, removedLineItems];
  }

  listingSold(listing: MarketplaceListingInterface): boolean {
    return listing.lineItems.every(lineItem => !!lineItem.sold);
  }

  listingReserved(listing: MarketplaceListingInterface): boolean {
    return listing.lineItems.every(lineItem => !!lineItem.reserved);
  }

  listingReservedTo(listing: MarketplaceListingInterface, userId: UserInterface["id"]): boolean {
    return listing.lineItems.some(lineItem => lineItem.reservedTo === userId);
  }

  listingHasNonSoldNonReservedItems(listing: MarketplaceListingInterface): boolean {
    return listing.lineItems.some(lineItem => !lineItem.sold && !lineItem.reserved);
  }

  listingExpired(listing: MarketplaceListingInterface): boolean {
    return new Date(listing.expiration + "Z") < new Date();
  }

  listingHasOffers(listing: MarketplaceListingInterface): boolean {
    return listing.lineItems.some(lineItem => lineItem.offers.length > 0);
  }

  listingHasPendingOffers(listing: MarketplaceListingInterface): boolean {
    return listing.lineItems.some(
      lineItem =>
        lineItem.offers.filter(offer => !!offer && offer.status === MarketplaceOfferStatus.PENDING).length > 0
    );
  }

  listingHasAcceptedOffers(listing: MarketplaceListingInterface): boolean {
    return listing.lineItems.some(
      lineItem =>
        lineItem.offers.filter(offer => !!offer && offer.status === MarketplaceOfferStatus.ACCEPTED).length > 0
    );
  }

  listingHasOffersByUser(listing: MarketplaceListingInterface, user: UserInterface): boolean {
    return listing.lineItems.some(lineItem => lineItem.offers.some(offer => offer.user === user.id));
  }

  makeOffer(
    listing: MarketplaceListingInterface,
    offers: MarketplaceOfferInterface[],
    offerModalRef: NgbActiveModal
  ): void {
    this._performOfferAction(
      listing,
      offers,
      offerModalRef,
      CreateMarketplaceOffer,
      EquipmentActionTypes.CREATE_MARKETPLACE_OFFER_SUCCESS,
      EquipmentActionTypes.CREATE_MARKETPLACE_OFFER_FAILURE
    );
  }

  modifyOffer(
    listing: MarketplaceListingInterface,
    offers: MarketplaceOfferInterface[],
    offerModalRef: NgbActiveModal
  ): void {
    this._performOfferAction(
      listing,
      offers,
      offerModalRef,
      UpdateMarketplaceOffer,
      EquipmentActionTypes.UPDATE_MARKETPLACE_OFFER_SUCCESS,
      EquipmentActionTypes.UPDATE_MARKETPLACE_OFFER_FAILURE
    );
  }

  retractOffer(listing: MarketplaceListingInterface, offers: MarketplaceOfferInterface[]): void {
    if (this.listingHasOffers(listing)) {
      const modalRef: NgbModalRef = this.modalService.open(MarketplaceAcceptRejectRetractOfferModalComponent);
      const componentInstance = modalRef.componentInstance;

      if (
        listing.lineItems.some(lineItem =>
          lineItem.offers.some(offer => offer.status === MarketplaceOfferStatus.ACCEPTED)
        )
      ) {
        componentInstance.message = this.translateService.instant(
          "Careful! If you retract an offer that was accepted by the seller, and have not reached a mutual " +
          "agreement concerning this, you may risk disciplinary action. Offers are considered binding agreements " +
          "between buyers and sellers. Are you sure you want to retract your offer?"
        );
      }

      modalRef.closed.subscribe(message => {
        this._performOfferAction(
          listing,
          offers,
          null,
          RetractMarketplaceOffer,
          EquipmentActionTypes.RETRACT_MARKETPLACE_OFFER_SUCCESS,
          EquipmentActionTypes.RETRACT_MARKETPLACE_OFFER_FAILURE,
          message
        );
      });
    } else {
      this.popNotificationsService.error(this.translateService.instant("No offers to retract."));
    }
  }

  onCreateListingClicked(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    this.userSubscriptionService.canCreateMarketplaceListing$().subscribe(canCreate => {
      if (canCreate) {
        this.router.navigate(["/equipment/marketplace/create"]);
      } else {
        const modalRef: NgbModalRef = this.modalService.open(SubscriptionRequiredModalComponent);
        const componentInstance: SubscriptionRequiredModalComponent = modalRef.componentInstance;
        componentInstance.minimumSubscription = SimplifiedSubscriptionName.ASTROBIN_LITE;
      }
    });
  }

  onPostWantedClicked(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    this.userSubscriptionService.canCreateMarketplaceListing$().subscribe(canCreate => {
      if (canCreate) {
        this.router.navigate(["/equipment/marketplace/create"], { queryParams: { wanted: true } });
      } else {
        const modalRef: NgbModalRef = this.modalService.open(SubscriptionRequiredModalComponent);
        const componentInstance: SubscriptionRequiredModalComponent = modalRef.componentInstance;
        componentInstance.minimumSubscription = SimplifiedSubscriptionName.ASTROBIN_LITE;
      }
    });
  }

  private _performOfferAction(
    listing: MarketplaceListingInterface,
    offers: MarketplaceOfferInterface[],
    offerModalRef: NgbActiveModal,
    action:
      | typeof CreateMarketplaceOffer
      | typeof UpdateMarketplaceOffer
      | typeof RejectMarketplaceOffer
      | typeof RetractMarketplaceOffer,
    successActionType:
      | typeof EquipmentActionTypes.CREATE_MARKETPLACE_OFFER_SUCCESS
      | typeof EquipmentActionTypes.UPDATE_MARKETPLACE_OFFER_SUCCESS
      | typeof EquipmentActionTypes.REJECT_MARKETPLACE_OFFER_SUCCESS
      | typeof EquipmentActionTypes.RETRACT_MARKETPLACE_OFFER_SUCCESS,
    failureActionType:
      | typeof EquipmentActionTypes.CREATE_MARKETPLACE_OFFER_FAILURE
      | typeof EquipmentActionTypes.UPDATE_MARKETPLACE_OFFER_FAILURE
      | typeof EquipmentActionTypes.REJECT_MARKETPLACE_OFFER_FAILURE
      | typeof EquipmentActionTypes.RETRACT_MARKETPLACE_OFFER_FAILURE,
    message?: string
  ) {
    this.store$
      .select(selectCurrentUser)
      .pipe(take(1))
      .subscribe(currentUser => {
        const dispatchSequentially = (index: number) => {
          if (index >= offers.length) {
            this.loadingService.setLoading(false);
            return;
          }

          const offer = offers[index];
          const data = {
            offer
          };

          if (message) {
            data["message"] = message;
          }

          this.store$.dispatch(new action(data));

          const success$ = this.actions$.pipe(
            ofType(successActionType),
            filter(
              (
                action:
                  | CreateMarketplaceOfferSuccess
                  | UpdateMarketplaceOfferSuccess
                  | RejectMarketplaceOfferSuccess
                  | RetractMarketplaceOfferSuccess
              ) => action.payload.offer.masterOfferUuid === offer.masterOfferUuid
            ),
            take(1)
          );

          const failure$ = this.actions$.pipe(
            ofType(failureActionType),
            filter(
              (
                action:
                  | CreateMarketplaceOfferFailure
                  | UpdateMarketplaceOfferFailure
                  | RejectMarketplaceOfferFailure
                  | RetractMarketplaceOfferFailure
              ) => action.payload.offer.masterOfferUuid === offer.masterOfferUuid
            ),
            take(1)
          );

          merge(success$, failure$)
            .pipe(take(1))
            .subscribe({
              next: result => {
                if (result.type === successActionType) {
                  if (index === offers.length - 1) {
                    if (offerModalRef) {
                      offerModalRef.close(listing); // Only close if last action is successful
                    }

                    let message = this._getMessageForOfferActionType(action);
                    if (message) {
                      this.popNotificationsService.success(message);
                    }
                  }
                } else {
                  this.popNotificationsService.error(this.offerErrorMessageForBuyer());
                }
              },
              complete: () => {
                dispatchSequentially(index + 1);
              }
            });
        };

        dispatchSequentially(0);
        this.loadingService.setLoading(true);
      });
  }

  private _getMessageForOfferActionType(action: any): string {
    switch (action) {
      case CreateMarketplaceOffer:
        return this.translateService.instant("Your offer has been successfully submitted.");
      case UpdateMarketplaceOffer:
        return this.translateService.instant("Your offer has been successfully updated.");
      case RejectMarketplaceOffer:
        return this.translateService.instant("The offer has been successfully rejected.");
      case RetractMarketplaceOffer:
        return this.translateService.instant("Your offer has been successfully retracted.");
      default:
        return "";
    }
  }
}
