import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { Actions } from "@ngrx/effects";
import { EquipmentItemBaseInterface } from "@features/equipment/types/equipment-item-base.interface";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { selectBrand } from "@features/equipment/store/equipment.selectors";
import { take } from "rxjs/operators";
import { UtilsService } from "@shared/services/utils/utils.service";
import { ExplorerBaseComponent } from "@features/equipment/pages/explorer-base/explorer-base.component";
import { Observable } from "rxjs";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { WindowRefService } from "@shared/services/window-ref.service";
import { BrandInterface } from "@features/equipment/types/brand.interface";

@Component({
  selector: "astrobin-equipment-pending-explorer-base",
  templateUrl: "./pending-explorer-base.component.html"
})
export class PendingExplorerBaseComponent extends ExplorerBaseComponent implements OnInit {
  items$: Observable<PaginatedApiResultInterface<EquipmentItemBaseInterface>>;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router,
    public readonly windowRefService: WindowRefService
  ) {
    super(store$, actions$, activatedRoute, router);
  }

  ngOnInit() {
    super.ngOnInit();
    this.getItems();
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

  pageChange(page: number) {
    this.page = page;

    const queryParams: Params = { page };

    this.router
      .navigate([], {
        relativeTo: this.activatedRoute,
        queryParams,
        queryParamsHandling: "merge"
      })
      .then(() => {
        this.getItems();
        this.windowRefService.scroll({ top: 0 });
      });
  }

  getItems() {}
}
