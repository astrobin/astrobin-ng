import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import {
  MarketplaceOfferInterface,
  MarketplaceOfferStatus
} from "@features/equipment/types/marketplace-offer.interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { filter, map, switchMap, take, takeUntil } from "rxjs/operators";
import { LoadUser } from "@features/account/store/auth.actions";
import { selectUser } from "@features/account/store/auth.selectors";
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
import { forkJoin } from "rxjs";
import { Actions, ofType } from "@ngrx/effects";
import {
  AcceptMarketplaceOffer,
  AcceptMarketplaceOfferFailure,
  AcceptMarketplaceOfferSuccess,
  CreateMarketplacePrivateConversation,
  CreateMarketplacePrivateConversationSuccess,
  DeleteMarketplaceOffer,
  DeleteMarketplaceOfferFailure,
  DeleteMarketplaceOfferSuccess,
  EquipmentActionTypes
} from "@features/equipment/store/equipment.actions";
import { TranslateService } from "@ngx-translate/core";
import { LoadingService } from "@shared/services/loading.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { MarketplacePrivateConversationInterface } from "@features/equipment/types/marketplace-private-conversation.interface";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";

interface UserOfferGroup {
  user: UserInterface;
  userId: UserInterface["id"];
  userDisplayName: string;
  status: MarketplaceOfferStatus;
  offersByLineItem: { [lineItemId: number]: MarketplaceOfferInterface[] };
  lineItemsWithoutOffers: MarketplaceLineItemInterface[];
}

@Component({
  selector: "astrobin-marketplace-offer-summary",
  templateUrl: "./marketplace-offer-summary.component.html",
  styleUrls: ["./marketplace-offer-summary.component.scss"]
})
export class MarketplaceOfferSummaryComponent extends BaseComponentDirective implements OnInit {
  readonly MarketplaceOfferStatus = MarketplaceOfferStatus;

  @Input()
  listing: MarketplaceListingInterface;

  @Input()
  offersGroupedByUser: UserOfferGroup[];

  @Output()
  startPrivateConversation: EventEmitter<MarketplacePrivateConversationInterface> =
    new EventEmitter<MarketplacePrivateConversationInterface>();

  loadingOffers = true;

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

  ngOnInit() {
    super.ngOnInit();

    this.store$.select(selectMarketplaceListing, { id: this.listing.id }).pipe(
      filter(listing => !!listing),
      takeUntil(this.destroyed$)
    ).subscribe(listing => {
      this.listing = listing;
      this.loadOffersGroupedByUser();
    });

    this.loadOffersGroupedByUser();
  }

  loadOffersGroupedByUser() {
    this.offersGroupedByUser = [];

    if (!this.listing.lineItems.some(lineItem => lineItem.offers.length)) {
      this.loadingOffers = false;
      return;
    }

    this.listing.lineItems.forEach(lineItem => {
      lineItem.offers.forEach(offer => {
        const userId = offer.user;

        this.store$.dispatch(new LoadUser({ id: userId }));

        this.store$
          .select(selectUser, userId)
          .pipe(
            filter(user => !!user),
            take(1)
          )
          .subscribe(user => {
            let userGroup = this.offersGroupedByUser.find(group => group.userId === userId);

            if (!userGroup) {
              userGroup = {
                user,
                userId,
                userDisplayName: offer.userDisplayName,
                status: MarketplaceOfferStatus.PENDING,
                offersByLineItem: {},
                lineItemsWithoutOffers: []
              };
              this.offersGroupedByUser.push(userGroup);
              this.loadingOffers = false;
            }

            if (!userGroup.offersByLineItem[lineItem.id]) {
              userGroup.offersByLineItem[lineItem.id] = [];
            }

            if (!userGroup.offersByLineItem[lineItem.id].length) {
              userGroup.offersByLineItem[lineItem.id].push(offer);
            }

            if (
              lineItem.offers
                .filter(offer => offer.user === userId)
                .every(offer => offer.status === MarketplaceOfferStatus.ACCEPTED)
            ) {
              userGroup.status = MarketplaceOfferStatus.ACCEPTED;
            }

            userGroup.lineItemsWithoutOffers = this.listing.lineItems.filter(
              lineItem => !Object.keys(userGroup.offersByLineItem).includes(lineItem.id.toString())
            );
          });
      });
    });
  }

  getLineItem(id: MarketplaceLineItemInterface["id"]): MarketplaceLineItemInterface {
    return this.listing.lineItems.find(lineItem => lineItem.id === id);
  }

  onAcceptOfferClicked(event: Event, userId: UserInterface["id"]) {
    const modalRef: NgbModalRef = this.modalService.open(ConfirmationDialogComponent);
    const componentInstance: ConfirmationDialogComponent = modalRef.componentInstance;

    componentInstance.message = this.translateService.instant(
      "Accepting this offer will mark the affected line items as reserved, and it constitutes a binding agreement " +
      "with the buyer. Failure to deliver the equipment as described may result in negative feedback and " +
      "possible disciplinary action. Are you sure you want to proceed?"
    );

    modalRef.closed.subscribe(() => {
      const offers = EquipmentMarketplaceService.offersByUser(userId, this.listing);

      this.loadingService.setLoading(true);

      forkJoin(
        offers.map(offer =>
          this.actions$.pipe(
            ofType(EquipmentActionTypes.ACCEPT_MARKETPLACE_OFFER_FAILURE),
            filter((action: AcceptMarketplaceOfferFailure) => action.payload.offer.id === offer.id),
            take(1)
          )
        )
      ).subscribe(() => {
        this.popNotificationsService.error(this.equipmentMarketplaceService.offerErrorMessageForSeller());
        this.loadingService.setLoading(false);
      });

      forkJoin(
        offers.map(offer =>
          this.actions$.pipe(
            ofType(EquipmentActionTypes.ACCEPT_MARKETPLACE_OFFER_SUCCESS),
            filter((action: AcceptMarketplaceOfferSuccess) => action.payload.offer.id === offer.id),
            take(1),
            switchMap(() => this.store$.select(selectMarketplaceListing, { id: this.listing.id })),
            take(1)
          )
        )
      ).subscribe(() => {
        this.popNotificationsService.success(
          this.translateService.instant("The offer has been accepted. The buyer will be notified.")
        );
        this.loadingService.setLoading(false);
      });

      offers.forEach(offer => {
        this.store$.dispatch(new AcceptMarketplaceOffer({ offer }));
      });
    });
  }

  onRejectOfferClicked(event: Event, userGroup: UserOfferGroup) {
    this.currentUser$.pipe(take(1)).subscribe(currentUser => {
      const modalRef: NgbModalRef = this.modalService.open(ConfirmationDialogComponent);

      if (userGroup.status === MarketplaceOfferStatus.ACCEPTED) {
        const componentInstance: ConfirmationDialogComponent = modalRef.componentInstance;
        componentInstance.message = this.translateService.instant(
          "Careful! If you reject an offer that you already accepted, and have not reached a mutual " +
          "agreement with the buyer concerning this, you may risk disciplinary action. Offers are considered binding " +
          "agreements between buyers and sellers. Are you sure you want to retract your offer?"
        );
      }

      modalRef.closed.subscribe(() => {
        const offers = EquipmentMarketplaceService.offersByUser(userGroup.userId, this.listing);

        this.loadingService.setLoading(true);

        forkJoin(
          offers.map(offer =>
            this.actions$.pipe(
              ofType(EquipmentActionTypes.DELETE_MARKETPLACE_OFFER_FAILURE),
              filter((action: DeleteMarketplaceOfferFailure) => action.payload.offer.id === offer.id),
              take(1)
            )
          )
        ).subscribe(() => {
          this.popNotificationsService.error(this.equipmentMarketplaceService.offerErrorMessageForSeller());
          this.loadingService.setLoading(false);
        });

        forkJoin(
          offers.map(offer =>
            this.actions$.pipe(
              ofType(EquipmentActionTypes.DELETE_MARKETPLACE_OFFER_SUCCESS),
              filter((action: DeleteMarketplaceOfferSuccess) => action.payload.offer.id === offer.id),
              take(1)
            )
          )
        )
          .pipe(
            switchMap(() => this.store$.select(selectMarketplaceListing, { id: this.listing.id })),
            take(1)
          )
          .subscribe(() => {
            this.popNotificationsService.success(this.translateService.instant("Offer rejected successfully."));
            this.loadingService.setLoading(false);
          });

        offers.forEach(offer => {
          this.store$.dispatch(new DeleteMarketplaceOffer({ offer }));
        });
      });
    });
  }

  onRetractOfferClicked(event: Event, userGroup: UserOfferGroup) {
    this.equipmentMarketplaceService.retractOffer(
      this.listing,
      userGroup.user,
      null,
      null
    );
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
}
