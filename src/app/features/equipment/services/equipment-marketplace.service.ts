import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { forkJoin, Observable, switchMap } from "rxjs";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { LoadContentTypeById } from "@app/store/actions/content-type.actions";
import { selectContentTypeById } from "@app/store/selectors/app/content-type.selectors";
import { filter, map, take } from "rxjs/operators";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { selectEquipmentItem, selectMarketplaceListing } from "@features/equipment/store/equipment.selectors";
import {
  CreateMarketplaceOffer,
  CreateMarketplaceOfferFailure,
  CreateMarketplaceOfferSuccess,
  DeleteMarketplaceOffer,
  DeleteMarketplaceOfferFailure,
  DeleteMarketplaceOfferSuccess,
  EquipmentActionTypes,
  LoadEquipmentItem,
  UpdateMarketplaceOffer,
  UpdateMarketplaceOfferFailure,
  UpdateMarketplaceOfferSuccess
} from "@features/equipment/store/equipment.actions";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { selectCurrentUser, selectUser } from "@features/account/store/auth.selectors";
import { LoadUser } from "@features/account/store/auth.actions";
import {
  MarketplaceOfferInterface,
  MarketplaceOfferStatus
} from "@features/equipment/types/marketplace-offer.interface";
import { TranslateService } from "@ngx-translate/core";
import { NgbActiveModal, NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { Actions, ofType } from "@ngrx/effects";
import { FormGroup } from "@angular/forms";

@Injectable({
  providedIn: "root"
})
export class EquipmentMarketplaceService extends BaseService {
  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly modalService: NgbModal,
    public readonly popNotificationsService: PopNotificationsService
  ) {
    super(loadingService);
  }

  static offersByUser(userId: UserInterface["id"], listing: MarketplaceListingInterface): MarketplaceOfferInterface[] {
    return listing.lineItems.reduce((acc, lineItem) => {
      const userOffers = lineItem.offers.filter(offer => offer.user === userId);
      return acc.concat(userOffers);
    }, []);
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
        }
      )
    );
  }

  getListingUser$(listing: MarketplaceListingInterface): Observable<UserInterface> {
    this.store$.dispatch(new LoadUser({ id: listing.user }));
    return this.store$.select(selectUser, listing.user);
  }

  userHasFeedback(user: UserInterface): boolean {
    return user.marketplaceFeedbackCount > 0;
  }

  // Returns whether the user is the buyer of any line item in the listing.
  userIsBuyer(user: UserInterface, listing: MarketplaceListingInterface): boolean {
    return listing.lineItems.some(lineItem => lineItem.soldTo === user.id);
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
    updatedListing.lineItems?.filter(item => !item.id).forEach(item => {
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

  listingExpired(listing: MarketplaceListingInterface): boolean {
    return new Date(listing.expiration + "Z") < new Date();
  }

  listingHasOffers(listing: MarketplaceListingInterface): boolean {
    return listing.lineItems.some(lineItem => lineItem.offers.length > 0);
  }

  listingHasPendingOffers(listing: MarketplaceListingInterface): boolean {
    return listing.lineItems.some(
      lineItem => lineItem.offers.filter(offer => offer.status === MarketplaceOfferStatus.PENDING).length > 0
    );
  }

  listingHasOffersByUser(listing: MarketplaceListingInterface, user: UserInterface): boolean {
    return listing.lineItems.some(lineItem => lineItem.offers.some(offer => offer.user === user.id));
  }

  makeOffer(listing: MarketplaceListingInterface, form: FormGroup, offerModalRef: NgbActiveModal): void {
    if (!this._checkOfferFormHasItems(listing, form)) {
      return;
    }

    if (this.listingHasOffers(listing)) {
      this._performOfferAction(
        listing,
        form,
        offerModalRef,
        UpdateMarketplaceOffer,
        EquipmentActionTypes.UPDATE_MARKETPLACE_OFFER_SUCCESS,
        EquipmentActionTypes.UPDATE_MARKETPLACE_OFFER_FAILURE
      );
    } else {
      this._performOfferAction(
        listing,
        form,
        offerModalRef,
        CreateMarketplaceOffer,
        EquipmentActionTypes.CREATE_MARKETPLACE_OFFER_SUCCESS,
        EquipmentActionTypes.CREATE_MARKETPLACE_OFFER_FAILURE
      );
    }
  }

  retractOffer(
    listing: MarketplaceListingInterface,
    user: UserInterface,
    form: FormGroup,
    offerModalRef: NgbActiveModal
  ): void {
    if (this.listingHasOffers(listing)) {
      const modalRef: NgbModalRef = this.modalService.open(ConfirmationDialogComponent);
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

      modalRef.closed.subscribe(() => {
        this._performOfferAction(
          listing,
          form,
          offerModalRef,
          DeleteMarketplaceOffer,
          EquipmentActionTypes.DELETE_MARKETPLACE_OFFER_SUCCESS,
          EquipmentActionTypes.DELETE_MARKETPLACE_OFFER_FAILURE
        );
      });
    } else {
      this.popNotificationsService.error(this.translateService.instant("No offers to retract."));
    }
  }

  public getOfferTotalAmount(listing: MarketplaceListingInterface, form: FormGroup): number {
    return listing.lineItems.reduce((total, lineItem) => {
      const id = lineItem.id;

      if (form.value[`checkbox-${id}`] || listing.bundleSaleOnly) {
        total += +form.value[`amount-${id}`] + (+form.value[`shippingCost-raw-${id}`] || 0);
      }

      return total;
    }, 0);
  }

  private _performOfferAction(
    listing: MarketplaceListingInterface,
    form: FormGroup,
    offerModalRef: NgbActiveModal,
    action: typeof CreateMarketplaceOffer | typeof UpdateMarketplaceOffer | typeof DeleteMarketplaceOffer,
    successActionType:
      | typeof EquipmentActionTypes.CREATE_MARKETPLACE_OFFER_SUCCESS
      | typeof EquipmentActionTypes.UPDATE_MARKETPLACE_OFFER_SUCCESS
      | typeof EquipmentActionTypes.DELETE_MARKETPLACE_OFFER_SUCCESS,
    failureActionType:
      | typeof EquipmentActionTypes.CREATE_MARKETPLACE_OFFER_FAILURE
      | typeof EquipmentActionTypes.UPDATE_MARKETPLACE_OFFER_FAILURE
      | typeof EquipmentActionTypes.DELETE_MARKETPLACE_OFFER_FAILURE
  ) {
    this.store$.select(selectCurrentUser).pipe(take(1)).subscribe(currentUser => {
      let lineItems = [];

      if (action === CreateMarketplaceOffer || action === UpdateMarketplaceOffer) {
        lineItems = listing.lineItems.filter(lineItem => {
          const amount = form.value[`amount-${lineItem.id}`];
          return !!amount;
        });
      } else if (action === DeleteMarketplaceOffer) {
        lineItems = listing.lineItems.filter(lineItem => {
          return !!lineItem.offers.some(offer => offer.user === currentUser.id);
        });
      }

      const successObservables$ = lineItems.map(lineItem =>
        this.actions$.pipe(
          ofType(successActionType),
          filter(
            (action: CreateMarketplaceOfferSuccess | UpdateMarketplaceOfferSuccess | DeleteMarketplaceOfferSuccess) =>
              action.payload.offer.lineItem === lineItem.id
          ),
          switchMap(() => this.store$.select(selectMarketplaceListing, { id: listing.id })),
          take(1)
        )
      );

      const failureObservables$ = lineItems.map(lineItem =>
        this.actions$.pipe(
          ofType(failureActionType),
          filter(
            (action: CreateMarketplaceOfferFailure | UpdateMarketplaceOfferFailure | DeleteMarketplaceOfferFailure) =>
              action.payload.offer.lineItem === lineItem.id
          ),
          take(1)
        )
      );

      forkJoin(successObservables$)
        .pipe(
          take(1),
          // It's only one listing so we can take the first result.
          map(result => result[0])
        )
        .subscribe(listing => {
          if (offerModalRef) {
            offerModalRef.close(listing);
          }
          this.loadingService.setLoading(false);

          let message: string;

          if (action === CreateMarketplaceOffer) {
            message = this.translateService.instant("Your offer has been successfully submitted.");
          } else if (action === UpdateMarketplaceOffer) {
            message = this.translateService.instant("Your offer has been successfully updated.");
          } else {
            message = this.translateService.instant("Your offer has been successfully retracted.");
          }

          this.popNotificationsService.success(message);
        });

      forkJoin(failureObservables$)
        .pipe(take(1))
        .subscribe(() => {
          this.loadingService.setLoading(false);
          this.popNotificationsService.error(this.offerErrorMessageForBuyer());
        });

      this.loadingService.setLoading(true);

      lineItems.forEach(lineItem => {
        const amount = form ? form.value[`amount-${lineItem.id}`] : null;
        const offer: MarketplaceOfferInterface = {
          listing: listing.id,
          lineItem: lineItem.id,
          id: lineItem.offers.find(offer => offer.user === currentUser.id)?.id,
          amount
        };

        this.store$.dispatch(new action({ offer }));
      });
    });
  }

  private _checkOfferFormHasItems(listing: MarketplaceListingInterface, form: FormGroup) {
    const total = this.getOfferTotalAmount(listing, form);

    if (total === 0) {
      this.popNotificationsService.error(this.translateService.instant("You cannot offer nothing, sorry."));
    }
    return total > 0;
  }
}
