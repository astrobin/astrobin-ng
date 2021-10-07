import { Component } from "@angular/core";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { Actions } from "@ngrx/effects";
import { EquipmentItemBaseInterface } from "@features/equipment/interfaces/equipment-item-base.interface";
import { ActivatedRoute, Router } from "@angular/router";
import { selectBrand } from "@features/equipment/store/equipment.selectors";
import { take } from "rxjs/operators";
import { UtilsService } from "@shared/services/utils/utils.service";
import { ExplorerBaseComponent } from "@features/equipment/pages/explorer-base/explorer-base.component";
import { Observable } from "rxjs";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";

@Component({
  selector: "astrobin-equipment-pending-explorer-base",
  templateUrl: "./pending-explorer-base.component.html"
})
export class PendingExplorerBaseComponent extends ExplorerBaseComponent {
  items$: Observable<PaginatedApiResultInterface<EquipmentItemBaseInterface>>;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router
  ) {
    super(store$, actions$, activatedRoute, router);
  }

  viewItem(item: EquipmentItemBaseInterface): void {
    this.store$
      .select(selectBrand, item.brand)
      .pipe(take(1))
      .subscribe(brand => {
        this.router.navigate([
          "equipment",
          "explorer",
          this.activeType.toLowerCase(),
          item.id,
          UtilsService.slugify(`${brand.name} ${item.name}`)
        ]);
      });
  }

  pageChange(page: number) {}
}
