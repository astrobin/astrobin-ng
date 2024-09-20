import { Component, Input } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { EquipmentItemService } from "@shared/services/equipment-item.service";

@Component({
  selector: "astrobin-marketplace-listing-line-item-condition",
  templateUrl: "./marketplace-line-item-condition.component.html",
  styleUrls: ["./marketplace-line-item-condition.component.scss"]
})
export class MarketplaceLineItemConditionComponent extends BaseComponentDirective {
  @Input()
  lineItem: MarketplaceLineItemInterface;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly equipmentItemService: EquipmentItemService
  ) {
    super(store$);
  }
}
