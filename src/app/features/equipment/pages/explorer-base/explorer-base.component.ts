import { Component, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { Actions } from "@ngrx/effects";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { ActivatedRoute, NavigationEnd, Params, Router } from "@angular/router";
import { takeUntil } from "rxjs/operators";
import { EditProposalInterface } from "@features/equipment/types/edit-proposal.interface";
import { Observable } from "rxjs";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { WindowRefService } from "@shared/services/window-ref.service";

@Component({
  selector: "astrobin-equipment-explorer-base",
  template: ""
})
export class ExplorerBaseComponent extends BaseComponentDirective implements OnInit {
  public page = 1;
  activeEditProposalId: EditProposalInterface<EquipmentItemBaseInterface>["id"];
  items$: Observable<PaginatedApiResultInterface<EquipmentItemBaseInterface>>;
  navCollapsed = false;
  enableNavCollapsing = false;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router,
    public readonly windowRefService: WindowRefService
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
    this.page = +this.activatedRoute.snapshot.queryParamMap.get("page") || 1;
    this.activeType = this.activatedRoute.snapshot.paramMap.get("itemType");
    this.activeEditProposalId = +this.activatedRoute.snapshot.paramMap.get("editProposalId");

    this.router.events.pipe(takeUntil(this.destroyed$)).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.activeType = this.activatedRoute.snapshot.paramMap.get("itemType");
        this.getItems();
      }
    });

    this.getItems();
  }

  pageChange(page: number) {
    this.page = page;

    const queryParams: Params = { page };

    this.router
      .navigate([], {
        relativeTo: this.activatedRoute,
        queryParams
      })
      .then(() => {
        this.windowRefService.scroll({ top: 0 });
      });
  }

  getItems() {}
}
