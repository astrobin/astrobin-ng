import { Component, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { Actions } from "@ngrx/effects";
import {
  EquipmentItemBaseInterface,
  EquipmentItemType
} from "@features/equipment/interfaces/equipment-item-base.interface";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { selectBrand } from "@features/equipment/store/equipment.selectors";
import { take, takeUntil } from "rxjs/operators";
import { UtilsService } from "@shared/services/utils/utils.service";

@Component({
  selector: "astrobin-equipment-explorer-base",
  template: ""
})
export class ExplorerBaseComponent extends BaseComponentDirective implements OnInit {
  public page = 1;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router
  ) {
    super(store$);
  }

  protected _activeType: EquipmentItemType;

  get activeType(): EquipmentItemType {
    return this._activeType;
  }

  set activeType(type: string) {
    this._activeType = EquipmentItemType[type.toUpperCase()];
  }

  ngOnInit() {
    this.activeType = this.activatedRoute.snapshot.paramMap.get("itemType");

    this.router.events.pipe(takeUntil(this.destroyed$)).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.activeType = this.activatedRoute.snapshot.paramMap.get("itemType");
      }
    });
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
}
