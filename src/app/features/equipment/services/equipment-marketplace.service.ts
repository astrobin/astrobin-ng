import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { Observable, switchMap } from "rxjs";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { LoadContentTypeById } from "@app/store/actions/content-type.actions";
import { selectContentTypeById } from "@app/store/selectors/app/content-type.selectors";
import { filter, take } from "rxjs/operators";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { LoadEquipmentItem } from "@features/equipment/store/equipment.actions";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { selectUser } from "@features/account/store/auth.selectors";
import { LoadUser } from "@features/account/store/auth.actions";
import { MarketplaceOfferInterface } from "@features/equipment/types/marketplace-offer.interface";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
  providedIn: "root"
})
export class EquipmentMarketplaceService extends BaseService {
  constructor(
    public readonly store$: Store<State>,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService
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
      "This operation cannot be performed. Perhaps the buyer already retracted the offer. Please refresh the page."
    );
  }

  offerErrorMessageForBuyer(): string {
    return this.translateService.instant(
      "This operation cannot be performed. Perhaps the seller already rejected the offer. Please refresh the page."
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

  // This method assumes that `previousListing` has lineItem IDs/ It's used to compare an existing listing to a listing

  userHasFeedback(user: UserInterface): boolean {
    return (
      user.marketplaceCommunicationFeedback !== null &&
      user.marketplaceAccuracyFeedback !== null &&
      user.marketplaceSpeedFeedback !== null &&
      user.marketplacePackagingFeedback !== null
    );
  }

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
}
