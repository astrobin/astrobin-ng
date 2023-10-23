import { Component, Input } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";

@Component({
  selector: "astrobin-marketplace-listing-line-item-condition",
  templateUrl: "./marketplace-listing-line-item-condition.component.html",
  styleUrls: ["./marketplace-listing-line-item-condition.component.scss"]
})
export class MarketplaceListingLineItemConditionComponent extends BaseComponentDirective {
  @Input()
  lineItem: MarketplaceLineItemInterface;

  constructor(
    public readonly store$: Store<State>,
    public readonly equipmentItemService: EquipmentItemService
  ) {
    super(store$);
  }
}
