import { Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";

@Component({
  selector: "astrobin-marketplace-line-item-cards",
  templateUrl: "./marketplace-line-item-cards.component.html",
  styleUrls: ["./marketplace-line-item-cards.component.scss"]
})
export class MarketplaceLineItemCardsComponent extends BaseComponentDirective implements OnInit {
  @Input()
  listings: MarketplaceListingInterface[];

  constructor(public readonly store$: Store<State>) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
}
