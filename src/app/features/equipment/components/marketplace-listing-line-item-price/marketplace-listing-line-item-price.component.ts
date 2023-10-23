import { Component, Input } from "@angular/core";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { TranslateService } from "@ngx-translate/core";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";

@Component({
  selector: "astrobin-marketplace-listing-line-item-price",
  templateUrl: "./marketplace-listing-line-item-price.component.html",
  styleUrls: ["./marketplace-listing-line-item-price.component.scss"]
})
export class MarketplaceListingLineItemPriceComponent extends BaseComponentDirective {
  @Input()
  lineItem: MarketplaceLineItemInterface;

  constructor(
    public readonly store$: Store<State>,
    public readonly translateService: TranslateService
  ) {
    super(store$);
  }
}
