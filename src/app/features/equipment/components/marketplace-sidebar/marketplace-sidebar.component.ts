import { Component, EventEmitter, Inject, Output, PLATFORM_ID } from "@angular/core";
import type { MainState } from "@app/store/state";
import type { EquipmentMarketplaceService } from "@core/services/equipment-marketplace.service";
import type { WindowRefService } from "@core/services/window-ref.service";
import type { MarketplaceFilterModel } from "@features/equipment/components/marketplace-filter/marketplace-filter.component";
import type { Store } from "@ngrx/store";
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
