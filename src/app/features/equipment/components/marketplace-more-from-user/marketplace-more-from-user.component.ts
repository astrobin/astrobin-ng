import type { OnChanges } from "@angular/core";
import { Component, Input } from "@angular/core";
import type { MainState } from "@app/store/state";
import type { LoadingService } from "@core/services/loading.service";
import { LoadUser } from "@features/account/store/auth.actions";
import { selectUser } from "@features/account/store/auth.selectors";
import { LoadMarketplaceListings } from "@features/equipment/store/equipment.actions";
import { selectMarketplaceListings } from "@features/equipment/store/equipment.selectors";
import type { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import type { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { filter, map, take, takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-marketplace-more-from-user",
  templateUrl: "./marketplace-more-from-user.component.html",
  styleUrls: ["./marketplace-more-from-user.component.scss"]
})
export class MarketplaceMoreFromUserComponent extends BaseComponentDirective implements OnChanges {
  @Input()
  listing: MarketplaceListingInterface;

  otherListings: MarketplaceListingInterface[];

  constructor(public readonly store$: Store<MainState>, public readonly loadingService: LoadingService) {
    super(store$);
  }

  ngOnChanges() {
    this.store$
      .select(selectUser, this.listing.user)
      .pipe(
        filter(user => !!user),
        take(1)
      )
      .subscribe(user => {
        this.store$.dispatch(
          new LoadMarketplaceListings({ options: { user: user.id, page: 1, excludeListing: this.listing.hash } })
        );
      });

    this.store$
      .select(selectMarketplaceListings)
      .pipe(
        takeUntil(this.destroyed$),
        filter(listings => !!listings),
        map(listings => listings.filter(listing => listing.user === this.listing.user && listing.lineItems.length > 0))
      )
      .subscribe(listings => {
        this.otherListings = listings.filter(listing => listing.id !== this.listing.id);
      });

    this.store$.dispatch(new LoadUser({ id: this.listing.user }));
  }
}
