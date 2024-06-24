import { Component, Input, OnInit } from "@angular/core";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { TranslateService } from "@ngx-translate/core";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { selectMarketplaceListing } from "@features/equipment/store/equipment.selectors";
import { filter, take, takeUntil } from "rxjs/operators";
import { distinctUntilChangedObj } from "@shared/services/utils/utils.service";
import { UserInterface } from "@shared/interfaces/user.interface";
import { selectUser } from "@features/account/store/auth.selectors";
import { LoadUser } from "@features/account/store/auth.actions";

@Component({
  selector: "astrobin-marketplace-listing-line-item-price",
  templateUrl: "./marketplace-listing-line-item-price.component.html",
  styleUrls: ["./marketplace-listing-line-item-price.component.scss"]
})
export class MarketplaceListingLineItemPriceComponent extends BaseComponentDirective implements OnInit {
  @Input()
  listing: MarketplaceListingInterface;

  @Input()
  lineItem: MarketplaceLineItemInterface;

  soldToUser: UserInterface;
  reservedToUser: UserInterface;

  constructor(
    public readonly store$: Store<State>,
    public readonly translateService: TranslateService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.store$.select(selectMarketplaceListing, { id: this.listing.id }).pipe(
      filter(listing => !!listing),
      distinctUntilChangedObj(),
      takeUntil(this.destroyed$)
    ).subscribe(listing => {
      this.listing = { ...listing };

      this.lineItem = listing.lineItems.find(lineItem => lineItem.id === this.lineItem.id);

      if (this.lineItem.soldTo) {
        this.loadUser(this.lineItem.soldTo, user => this.soldToUser = user);
      } else if (this.lineItem.reservedTo) {
        this.loadUser(this.lineItem.reservedTo, user => this.reservedToUser = user);
      }
    });
  }

  private loadUser(userId: UserInterface["id"], callback: (user: UserInterface) => void): void {
    this.store$.dispatch(new LoadUser({ id: userId }));
    this.store$.select(selectUser, userId).pipe(
      filter(user => !!user),
      take(1)
    ).subscribe(user => {
      callback(user);
    });
  }
}
