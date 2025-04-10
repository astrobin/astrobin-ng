import type { OnInit } from "@angular/core";
import { Component, Input } from "@angular/core";
import type { MainState } from "@app/store/state";
import { EquipmentMarketplaceService } from "@core/services/equipment-marketplace.service";
import type { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-marketplace-listing-cards",
  templateUrl: "./marketplace-listing-cards.component.html",
  styleUrls: ["./marketplace-listing-cards.component.scss"]
})
export class MarketplaceListingCardsComponent extends BaseComponentDirective implements OnInit {
  @Input()
  listings: MarketplaceListingInterface[];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly equipmentMarketplaceService: EquipmentMarketplaceService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }
}
