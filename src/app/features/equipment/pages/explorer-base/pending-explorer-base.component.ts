import { Component } from "@angular/core";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { Actions } from "@ngrx/effects";
import { EquipmentItemBaseInterface } from "@features/equipment/types/equipment-item-base.interface";
import { ActivatedRoute, Router } from "@angular/router";
import { selectBrand } from "@features/equipment/store/equipment.selectors";
import { take } from "rxjs/operators";
import { UtilsService } from "@shared/services/utils/utils.service";
import { ExplorerBaseComponent } from "@features/equipment/pages/explorer-base/explorer-base.component";
import { WindowRefService } from "@shared/services/window-ref.service";
import { BrandInterface } from "@features/equipment/types/brand.interface";

@Component({
  selector: "astrobin-equipment-pending-explorer-base",
  templateUrl: "./pending-explorer-base.component.html"
})
export abstract class PendingExplorerBaseComponent extends ExplorerBaseComponent {
  protected constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router,
    public readonly windowRefService: WindowRefService
  ) {
    super(store$, actions$, activatedRoute, router, windowRefService);
  }

  viewItem(item: EquipmentItemBaseInterface): void {
    const _doViewItem = (brand: BrandInterface | null) => {
      this.router.navigate([
        "equipment",
        "explorer",
        this.activeType.toLowerCase(),
        item.id,
        UtilsService.slugify(`${brand ? brand.name : "diy"} ${item.name}`)
      ]);
    };

    if (!!item.brand) {
      this.store$
        .select(selectBrand, item.brand)
        .pipe(take(1))
        .subscribe(brand => {
          _doViewItem(brand);
        });
    } else {
      _doViewItem(null);
    }
  }
}
