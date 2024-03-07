import { Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { LoadUser } from "@features/account/store/auth.actions";
import { selectUser } from "@features/account/store/auth.selectors";
import { LoadMarketplaceListings } from "@features/equipment/store/equipment.actions";
import { filter, map, take, takeUntil, tap } from "rxjs/operators";
import { selectMarketplaceListings } from "@features/equipment/store/equipment.selectors";
import { LoadingService } from "@shared/services/loading.service";

@Component({
  selector: "astrobin-marketplace-more-from-user",
  templateUrl: "./marketplace-more-from-user.component.html",
  styleUrls: ["./marketplace-more-from-user.component.scss"]
})
export class MarketplaceMoreFromUserComponent extends BaseComponentDirective implements OnInit {
  @Input()
  listing: MarketplaceListingInterface;

  otherListings: MarketplaceListingInterface[];

  constructor(public readonly store$: Store<State>, public readonly loadingService: LoadingService) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();

    this.store$.dispatch(new LoadUser({ id: this.listing.user }));

    this.store$.select(selectUser, this.listing.user).pipe(
      filter(user => !!user),
      take(1)
    ).subscribe(user => {
      this.store$.dispatch(new LoadMarketplaceListings({ options: { user: user.id, page: 1 } }));
    });

    this.store$.select(selectMarketplaceListings).pipe(
      takeUntil(this.destroyed$),
      filter(listings => !!listings),
      map(listings => listings.filter(listing => listing.user === this.listing.user && listing.lineItems.length > 0)),
      tap(() => this.loadingService.setLoading(false))
    ).subscribe(listings => {
      this.otherListings = listings.filter(listing => listing.id !== this.listing.id);
    });
  }
}
