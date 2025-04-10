import { Component, Input } from "@angular/core";
import { EquipmentItemListingInterface } from "@features/equipment/types/equipment-listings.interface";
import { StockStatus } from "@features/equipment/types/stock-status.type";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-stock-status",
  templateUrl: "./stock-status.component.html",
  styleUrls: ["./stock-status.component.scss"]
})
export class StockStatusComponent extends BaseComponentDirective {
  readonly StockStatus = StockStatus;

  @Input()
  listing: EquipmentItemListingInterface;
}
