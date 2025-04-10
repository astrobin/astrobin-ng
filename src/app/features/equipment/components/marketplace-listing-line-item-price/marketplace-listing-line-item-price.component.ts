import { OnInit, Component, Input } from "@angular/core";
import { MainState } from "@app/store/state";
import { UserInterface } from "@core/interfaces/user.interface";
import { distinctUntilChangedObj } from "@core/services/utils/utils.service";
import { LoadUser } from "@features/account/store/auth.actions";
import { selectUser } from "@features/account/store/auth.selectors";
import { selectMarketplaceListing } from "@features/equipment/store/equipment.selectors";
import {
  MarketplaceLineItemInterface,
  MarketplaceShippingCostType
} from "@features/equipment/types/marketplace-line-item.interface";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { filter, take, takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-marketplace-listing-line-item-price",
  templateUrl: "./marketplace-listing-line-item-price.component.html",
  styleUrls: ["./marketplace-listing-line-item-price.component.scss"]
})
export class MarketplaceListingLineItemPriceComponent extends BaseComponentDirective implements OnInit {
  readonly MarketplaceShippingCostType = MarketplaceShippingCostType;

  @Input()
  listing: MarketplaceListingInterface;

  @Input()
  lineItem: MarketplaceLineItemInterface;

  soldToUser: UserInterface;
  reservedToUser: UserInterface;

  constructor(public readonly store$: Store<MainState>, public readonly translateService: TranslateService) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.store$
      .select(selectMarketplaceListing, { id: this.listing.id })
      .pipe(
        filter(listing => !!listing),
        distinctUntilChangedObj(),
        takeUntil(this.destroyed$)
      )
      .subscribe(listingFormStore => {
        this.listing.lineItems.forEach((lineItem: MarketplaceLineItemInterface) => {
          const lineItemFromStore = listingFormStore.lineItems.find(item => item.id === lineItem.id);

          if (lineItemFromStore.soldTo) {
            this.loadUser(lineItemFromStore.soldTo, user => (this.soldToUser = user));
          } else if (lineItemFromStore.reservedTo) {
            this.loadUser(lineItemFromStore.reservedTo, user => (this.reservedToUser = user));
          }
        });
      });
  }

  private loadUser(userId: UserInterface["id"], callback: (user: UserInterface) => void): void {
    this.store$.dispatch(new LoadUser({ id: userId }));
    this.store$
      .select(selectUser, userId)
      .pipe(
        filter(user => !!user),
        take(1)
      )
      .subscribe(user => {
        callback(user);
      });
  }
}
