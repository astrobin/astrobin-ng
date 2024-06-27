import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MarketplaceOfferInterface } from "@features/equipment/types/marketplace-offer.interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { filter, map, take, takeUntil } from "rxjs/operators";
import { LoadUser } from "@features/account/store/auth.actions";
import {
  selectMarketplaceListing,
  selectMarketplacePrivateConversations
} from "@features/equipment/store/equipment.selectors";
import { State } from "@app/store/state";
import { select, Store } from "@ngrx/store";
import { UtilsService } from "@shared/services/utils/utils.service";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { EquipmentMarketplaceService } from "@features/equipment/services/equipment-marketplace.service";
import { Actions, ofType } from "@ngrx/effects";
import {
  AcceptMarketplaceOffer,
  AcceptMarketplaceOfferFailure,
  AcceptMarketplaceOfferSuccess,
  CreateMarketplacePrivateConversation,
  CreateMarketplacePrivateConversationSuccess,
  EquipmentActionTypes,
  RejectMarketplaceOffer,
  RejectMarketplaceOfferFailure,
  RejectMarketplaceOfferSuccess
} from "@features/equipment/store/equipment.actions";
import { TranslateService } from "@ngx-translate/core";
import { LoadingService } from "@shared/services/loading.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { MarketplacePrivateConversationInterface } from "@features/equipment/types/marketplace-private-conversation.interface";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { MarketplaceOfferModalComponent } from "@features/equipment/components/marketplace-offer-modal/marketplace-offer-modal.component";
import { MarketplaceOfferStatus } from "@features/equipment/types/marketplace-offer-status.type";
import { MarketplaceMasterOfferInterface } from "@features/equipment/types/marketplace-master-offer.interface";
import { selectUser } from "@features/account/store/auth.selectors";
import { Subscription } from "rxjs";
import { MarketplaceAcceptRejectRetractOfferModalComponent } from "@features/equipment/components/marketplace-accept-reject-retract-offer-modal/marketplace-accept-reject-retract-offer-modal.component";

interface OfferGroup {
  [key: MarketplaceMasterOfferInterface["id"]]: (MarketplaceOfferInterface & {
    userObj: UserInterface,
    lineItemObj: MarketplaceLineItemInterface
  })[];
}

@Component({
  selector: "astrobin-marketplace-offer-summary",
  templateUrl: "./marketplace-offer-summary.component.html",
  styleUrls: ["./marketplace-offer-summary.component.scss"]
})
export class MarketplaceOfferSummaryComponent extends BaseComponentDirective implements OnChanges {
  readonly MarketplaceOfferStatus = MarketplaceOfferStatus;

  @Input()
  listing: MarketplaceListingInterface;

  @Output()
  startPrivateConversation: EventEmitter<MarketplacePrivateConversationInterface> =
    new EventEmitter<MarketplacePrivateConversationInterface>();

  pendingOfferGroup: OfferGroup = {};
  acceptedOfferGroup: OfferGroup = {};
  rejectedOfferGroup: OfferGroup = {};
  retractedOfferGroup: OfferGroup = {};

  showRejectedAndRetractedOffers = false;

  loadingOffers = true;

  private _listingUpdatedSubscription: Subscription;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly utilsService: UtilsService,
    public readonly translateService: TranslateService,
    public readonly modalService: NgbModal,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly equipmentMarketplaceService: EquipmentMarketplaceService,
    public readonly classicRoutesService: ClassicRoutesService
  ) {
    super(store$);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this._listingUpdatedSubscription) {
      this._listingUpdatedSubscription.unsubscribe();
    }

    this._listingUpdatedSubscription = this.store$
      .select(selectMarketplaceListing, { id: this.listing.id })
      .pipe(
        filter(listing => !!listing),
        takeUntil(this.destroyed$)
      )
      .subscribe(listing => {
        this.listing = { ...listing };
        this.loadOffersGroupedByUser();
      });
  }

  loadOffersGroupedByUser() {
    this.pendingOfferGroup = {};
    this.acceptedOfferGroup = {};
    this.rejectedOfferGroup = {};
    this.retractedOfferGroup = {};

    if (!this.listing.lineItems.some(lineItem => lineItem.offers.length)) {
      this.loadingOffers = false;
      return;
    }

    this.listing.lineItems.forEach(lineItem => {
      lineItem.offers.forEach(offer => {
        this.store$
          .select(selectUser, offer.user)
          .pipe(
            filter(user => !!user),
            take(1)
          )
          .subscribe(user => {
            for (const group of [
              "pendingOfferGroup",
              "acceptedOfferGroup",
              "rejectedOfferGroup",
              "retractedOfferGroup"
            ]) {
              this[group][offer.masterOffer] = this[group][offer.masterOffer] || [];
            }

            if (offer.status === MarketplaceOfferStatus.PENDING) {
              this.pendingOfferGroup = {
                ...this.pendingOfferGroup,
                [offer.masterOffer]: [
                  ...this.pendingOfferGroup[offer.masterOffer],
                  { ...offer, userObj: user, lineItemObj: lineItem }
                ]
              };
            } else if (offer.status === MarketplaceOfferStatus.ACCEPTED) {
              this.acceptedOfferGroup = {
                ...this.acceptedOfferGroup,
                [offer.masterOffer]: [
                  ...this.acceptedOfferGroup[offer.masterOffer],
                  { ...offer, userObj: user, lineItemObj: lineItem }
                ]
              };
            } else if (offer.status === MarketplaceOfferStatus.REJECTED) {
              this.rejectedOfferGroup = {
                ...this.rejectedOfferGroup,
                [offer.masterOffer]: [
                  ...this.rejectedOfferGroup[offer.masterOffer],
                  { ...offer, userObj: user, lineItemObj: lineItem }
                ]
              };
            } else if (offer.status === MarketplaceOfferStatus.RETRACTED) {
              this.retractedOfferGroup = {
                ...this.retractedOfferGroup,
                [offer.masterOffer]: [
                  ...this.retractedOfferGroup[offer.masterOffer],
                  { ...offer, userObj: user, lineItemObj: lineItem }
                ]
              };
            }

            this.loadingOffers = false;
          });

        this.store$.dispatch(new LoadUser({ id: offer.user }));
      });
    });
  }

  getLineItem(id: MarketplaceLineItemInterface["id"]): MarketplaceLineItemInterface {
    return this.listing.lineItems.find(lineItem => lineItem.id === id);
  }

  onAcceptOfferClicked(event: Event, offers: (MarketplaceOfferInterface & {
    userObj: UserInterface,
    lineItemObj: MarketplaceLineItemInterface
  })[]) {
    const modalRef: NgbModalRef = this.modalService.open(MarketplaceAcceptRejectRetractOfferModalComponent);
    const componentInstance: ConfirmationDialogComponent = modalRef.componentInstance;

    componentInstance.message = this.translateService.instant(
      "Accepting this offer will mark the affected line items as reserved, and it constitutes a binding agreement " +
      "with the buyer. Failure to deliver the equipment as described may result in negative feedback and " +
      "possible disciplinary action. Are you sure you want to proceed?"
    );

    modalRef.closed.subscribe(message => {
      this.loadingService.setLoading(true);

      const processOffersSequentially = (index: number) => {
        if (index >= offers.length) {
          this.loadingService.setLoading(false);
          return;
        }
        const offer = offers[index];
        this.store$.dispatch(new AcceptMarketplaceOffer({ offer, message }));

        this.actions$
          .pipe(
            ofType(
              EquipmentActionTypes.ACCEPT_MARKETPLACE_OFFER_SUCCESS,
              EquipmentActionTypes.ACCEPT_MARKETPLACE_OFFER_FAILURE
            ),
            filter(
              (action: AcceptMarketplaceOfferSuccess | AcceptMarketplaceOfferFailure) =>
                action.payload.offer.id === offer.id
            ),
            take(1)
          )
          .subscribe({
            next: action => {
              if (action.type === EquipmentActionTypes.ACCEPT_MARKETPLACE_OFFER_SUCCESS) {
                this.store$
                  .select(selectMarketplaceListing, { id: this.listing.id })
                  .pipe(take(1))
                  .subscribe(() => {
                    if (index === offers.length - 1) {
                      this.popNotificationsService.success(
                        this.translateService.instant(
                          "The offer has been accepted. The buyer will be notified."
                        ) +
                        " " +
                        this.translateService.instant(
                          "Please use the 'Exchange payment/delivery info' to coordinate with the buyer."
                        )
                      );
                    }
                  });
              } else {
                this.popNotificationsService.error(this.equipmentMarketplaceService.offerErrorMessageForSeller());
              }
            },
            complete: () => processOffersSequentially(index + 1)
          });
      };

      processOffersSequentially(0);
    });
  }

  onRejectOfferClicked(event: Event, offers: (MarketplaceOfferInterface & {
    userObj: UserInterface,
    lineItemObj: MarketplaceLineItemInterface
  })[]) {
    const modalRef: NgbModalRef = this.modalService.open(MarketplaceAcceptRejectRetractOfferModalComponent);
    const componentInstance: ConfirmationDialogComponent = modalRef.componentInstance;

    componentInstance.title = this.translateService.instant("Reject offer");

    if (offers[0].status === MarketplaceOfferStatus.ACCEPTED) {
      componentInstance.message = this.translateService.instant(
        "Careful! If you reject an offer that you already accepted, and have not reached a mutual " +
        "agreement with the buyer concerning this, you may risk disciplinary action. Offers are considered binding " +
        "agreements between buyers and sellers. Are you sure you want to retract your offer?"
      );
    } else {
      componentInstance.showMessage = false;
    }

    modalRef.closed.subscribe(message => {
      this.loadingService.setLoading(true);

      const processOffersSequentially = (index: number) => {
        if (index >= offers.length) {
          this.loadingService.setLoading(false);
          return;
        }
        const offer = offers[index];
        this.store$.dispatch(new RejectMarketplaceOffer({ offer, message }));

        this.actions$
          .pipe(
            ofType(
              EquipmentActionTypes.REJECT_MARKETPLACE_OFFER_SUCCESS,
              EquipmentActionTypes.REJECT_MARKETPLACE_OFFER_FAILURE
            ),
            filter(
              (action: RejectMarketplaceOfferSuccess | RejectMarketplaceOfferFailure) =>
                action.payload.offer.id === offer.id
            ),
            take(1)
          )
          .subscribe({
            next: action => {
              if (action.type === EquipmentActionTypes.REJECT_MARKETPLACE_OFFER_SUCCESS) {
                if (index === offers.length - 1) {
                  this.popNotificationsService.success(this.translateService.instant("Offer rejected successfully."));
                }
              } else {
                this.popNotificationsService.error(this.equipmentMarketplaceService.offerErrorMessageForSeller());
              }
            },
            complete: () => processOffersSequentially(index + 1)
          });
      };

      processOffersSequentially(0);
    });
  }

  onModifyOfferClicked(event: Event, offers: (MarketplaceOfferInterface & {
    userObj: UserInterface,
    lineItemObj: MarketplaceLineItemInterface
  })[]) {
    event.preventDefault();

    const modalRef: NgbModalRef = this.modalService.open(MarketplaceOfferModalComponent, { size: "xl" });
    const component = modalRef.componentInstance;

    component.listing = this.listing;
    component.offers = offers;
  }

  onRetractOfferClicked(event: Event, offers: (MarketplaceOfferInterface & {
    userObj: UserInterface,
    lineItemObj: MarketplaceLineItemInterface
  })[]) {
    this.equipmentMarketplaceService.retractOffer(this.listing, offers);
  }

  onMessageProspectBuyerClicked(event: Event, userId: UserInterface["id"]) {
    event.preventDefault();

    this.loadingService.setLoading(true);

    this.store$
      .pipe(select(selectMarketplacePrivateConversations(this.listing.id, userId)), take(1))
      .subscribe(privateConversations => {
        privateConversations = privateConversations.filter(
          privateConversation => privateConversation.user === userId
        );

        if (privateConversations.length === 0) {
          this.actions$
            .pipe(
              ofType(EquipmentActionTypes.CREATE_MARKETPLACE_PRIVATE_CONVERSATION_SUCCESS),
              filter(
                (action: CreateMarketplacePrivateConversationSuccess) =>
                  action.payload.privateConversation.listing === this.listing.id &&
                  action.payload.privateConversation.user === userId
              ),
              map((action: CreateMarketplacePrivateConversationSuccess) => action.payload.privateConversation),
              take(1)
            )
            .subscribe(privateConversation => {
              this.startPrivateConversation.emit(privateConversation);
            });

          this.store$.dispatch(new CreateMarketplacePrivateConversation({ listingId: this.listing.id, userId }));
        } else {
          this.startPrivateConversation.emit(privateConversations[0]);
        }
      });

    this.store$.dispatch(new LoadUser({ id: userId }));
  }

  offerGroupHasOffers(offerGroup: OfferGroup): boolean {
    let hasOffers = false;

    for (const offers of Object.values(offerGroup)) {
      if (offers.length > 0) {
        hasOffers = true;
        break;
      }
    }

    return hasOffers;
  }
}
