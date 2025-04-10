import { Component, Input } from "@angular/core";
import type { MainState } from "@app/store/state";
import type { EquipmentItemService } from "@core/services/equipment-item.service";
import type { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";
import type { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-marketplace-listing-line-item-condition",
  templateUrl: "./marketplace-line-item-condition.component.html",
  styleUrls: ["./marketplace-line-item-condition.component.scss"]
})
export class MarketplaceLineItemConditionComponent extends BaseComponentDirective {
  @Input()
  lineItem: MarketplaceLineItemInterface;

  constructor(public readonly store$: Store<MainState>, public readonly equipmentItemService: EquipmentItemService) {
    super(store$);
  }
}
