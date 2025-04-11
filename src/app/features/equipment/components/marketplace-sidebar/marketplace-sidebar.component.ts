import { Component, EventEmitter, Inject, Output, PLATFORM_ID } from "@angular/core";
import { MainState } from "@app/store/state";
import { EquipmentMarketplaceService } from "@core/services/equipment-marketplace.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { MarketplaceFilterModel } from "@features/equipment/components/marketplace-filter/marketplace-filter.component";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-marketplace-sidebar",
  templateUrl: "./marketplace-sidebar.component.html",
  styleUrls: ["./marketplace-sidebar.component.scss"]
})
export class MarketplaceSidebarComponent extends BaseComponentDirective {
  @Output()
  filterChange = new EventEmitter<MarketplaceFilterModel>();

  constructor(
    public readonly store$: Store<MainState>,
    public readonly equipmentMarketplaceService: EquipmentMarketplaceService,
    public readonly windowRefService: WindowRefService,
    @Inject(PLATFORM_ID) public readonly platformId: any
  ) {
    super(store$);
  }
}
