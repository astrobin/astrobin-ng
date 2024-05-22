import { Component, Input, OnInit } from "@angular/core";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { TranslateService } from "@ngx-translate/core";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { selectMarketplaceListing } from "@features/equipment/store/equipment.selectors";
import { takeUntil } from "rxjs/operators";

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

  constructor(
    public readonly store$: Store<State>,
    public readonly translateService: TranslateService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.store$.select(selectMarketplaceListing, { id: this.listing.id }).pipe(
      takeUntil(this.destroyed$)
    ).subscribe(listing => {
      this.listing = {
        ...listing
      };
    });
  }
}
