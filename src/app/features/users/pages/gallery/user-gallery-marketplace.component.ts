import { ChangeDetectionStrategy, Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { UserInterface } from "@shared/interfaces/user.interface";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { LoadMarketplaceListings } from "@features/equipment/store/equipment.actions";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { Observable } from "rxjs";
import { selectMarketplaceListings } from "@features/equipment/store/equipment.selectors";
import { concatLatestFrom } from "@ngrx/effects";
import { map } from "rxjs/operators";

@Component({
  selector: "astrobin-user-gallery-marketplace",
  template: `
    <astrobin-marketplace-listing-cards [listings]="listings$ | async"></astrobin-marketplace-listing-cards>
  `,
  styleUrls: ["./user-gallery-marketplace.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserGalleryMarketplaceComponent extends BaseComponentDirective implements OnInit {
  @Input() user: UserInterface;

  protected listings$: Observable<MarketplaceListingInterface[]> =
    this.store$.select(selectMarketplaceListings).pipe(
      concatLatestFrom(() => this.currentUser$),
      map(([listings, currentUser]) =>
        !!listings ? listings.filter((listing: MarketplaceListingInterface) =>
          listing.lineItems.length > 0 && listing.user === this.user?.id) : null
      )
    );

  constructor(
    public readonly store$: Store<MainState>
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.store$.dispatch(new LoadMarketplaceListings({ options: { page: 1, user: this.user.id } }));
  }
}
