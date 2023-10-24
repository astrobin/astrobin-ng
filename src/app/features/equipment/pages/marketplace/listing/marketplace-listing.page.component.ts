import { Component, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { ActivatedRoute } from "@angular/router";
import { LoadMarketplaceListing } from "@features/equipment/store/equipment.actions";
import { selectMarketplaceListing } from "@features/equipment/store/equipment.selectors";
import { Observable } from "rxjs";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";

@Component({
  selector: "astrobin-marketplace-listing-page",
  templateUrl: "./marketplace-listing.page.component.html",
  styleUrls: ["./marketplace-listing.page.component.scss"]
})
export class MarketplaceListingPageComponent extends BaseComponentDirective implements OnInit {
  title: string;
  listing$: Observable<MarketplaceListingInterface>;

  constructor(
    public readonly store$: Store<State>,
    public readonly activatedRoute: ActivatedRoute
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this._getListingFromRoute();
  }

  private _getListingFromRoute() {
    this.activatedRoute.paramMap.subscribe(params => {
      const id = +params.get("listingId");
      if (!!id) {
        this.listing$ = this.store$.select(selectMarketplaceListing(id));
        this.store$.dispatch(new LoadMarketplaceListing({ id }));
      }
    });
  }
}
