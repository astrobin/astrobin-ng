import { Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { EquipmentMarketplaceService } from "@features/equipment/services/equipment-marketplace.service";

@Component({
  selector: "astrobin-marketplace-listing-cards",
  templateUrl: "./marketplace-listing-cards.component.html",
  styleUrls: ["./marketplace-listing-cards.component.scss"]
})
export class MarketplaceListingCardsComponent extends BaseComponentDirective implements OnInit {
  @Input()
  listings: MarketplaceListingInterface[];

  constructor(
    public readonly store$: Store<State>,
    public readonly equipmentMarketplaceService: EquipmentMarketplaceService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
}
