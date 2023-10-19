import { Component, Input } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MarketplaceListingLineItemInterface } from "@features/equipment/types/marketplace-listing-line-item.interface";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { UtilsService } from "@shared/services/utils/utils.service";

@Component({
  selector: "astrobin-marketplace-listing-line-item-images",
  templateUrl: "./marketplace-listing-line-item-images.component.html",
  styleUrls: ["./marketplace-listing-line-item-images.component.scss"]
})
export class MarketplaceListingLineItemImagesComponent extends BaseComponentDirective {
  readonly UtilsService = UtilsService;
  @Input()
  images: MarketplaceListingLineItemInterface["images"];

  constructor(public readonly store$: Store<State>) {
    super(store$);
  }
}
