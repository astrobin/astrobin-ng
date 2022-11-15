import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
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
import { BrandInterface } from "@features/equipment/types/brand.interface";
import { CookieService } from "ngx-cookie";
import { EquipmentItemsSortOrder } from "@features/equipment/services/equipment-api.service";
import { GetContributors } from "@features/equipment/store/equipment.actions";
import { EquipmentItemDisplayProperty } from "@features/equipment/services/equipment-item.service";

export const EQUIPMENT_EXPLORER_PAGE_SORTING_COOKIE = "astrobin-equipment-explorer-page-sorting";

@Component({
  selector: "astrobin-equipment-explorer-base",
  template: ""
})
export class ExplorerBaseComponent extends BaseComponentDirective implements OnInit {
  readonly EquipmentItemDisplayProperty = EquipmentItemDisplayProperty;

  public page = 1;
  activeEditProposalId: EditProposalInterface<EquipmentItemBaseInterface>["id"];
  items$: Observable<PaginatedApiResultInterface<EquipmentItemBaseInterface> | BrandInterface[]>;
  sortOrder: EquipmentItemsSortOrder = EquipmentItemsSortOrder.AZ;
  navCollapsed = false;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router,
    public readonly windowRefService: WindowRefService,
    public readonly cookieService: CookieService,
    public readonly changeDetectionRef: ChangeDetectorRef
  ) {
    super(store$);
  }

  protected _activeType: EquipmentItemType | "BRAND";

  get activeType(): EquipmentItemType | "BRAND" {
    return this._activeType;
  }

  set activeType(type: string) {
    if (!type) {
      return;
    }

    if (type !== "BRAND") {
      this._activeType = EquipmentItemType[type.toUpperCase()];
      return;
    }

    this._activeType = type as "BRAND";
  }

  ngOnInit() {
    super.ngOnInit();

    this.page = +this.activatedRoute.snapshot?.queryParamMap.get("page") || 1;
    this.activeType = this.activatedRoute.snapshot?.paramMap.get("itemType");
    this.activeEditProposalId = +this.activatedRoute.snapshot?.paramMap.get("editProposalId");

    this.store$.dispatch(new GetContributors());

    this.router.events?.pipe(takeUntil(this.destroyed$)).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.activeType = this.activatedRoute.snapshot?.paramMap.get("itemType");
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

  toggleAZSorting() {
    if (this.sortOrder !== EquipmentItemsSortOrder.AZ) {
      this.sortOrder = EquipmentItemsSortOrder.AZ;
    } else {
      this.sortOrder = EquipmentItemsSortOrder.AZ_DESC;
    }

    this.cookieService.put(EQUIPMENT_EXPLORER_PAGE_SORTING_COOKIE, this.sortOrder, {
      path: "/",
      expires: null
    });

    this.getItems();
  }

  toggleUsersSorting() {
    if (this.sortOrder !== EquipmentItemsSortOrder.USERS_DESC) {
      this.sortOrder = EquipmentItemsSortOrder.USERS_DESC;
    } else {
      this.sortOrder = EquipmentItemsSortOrder.USERS;
    }

    this.cookieService.put(EQUIPMENT_EXPLORER_PAGE_SORTING_COOKIE, this.sortOrder, {
      path: "/",
      expires: null
    });

    this.getItems();
  }

  toggleImagesSorting() {
    if (this.sortOrder !== EquipmentItemsSortOrder.IMAGES_DESC) {
      this.sortOrder = EquipmentItemsSortOrder.IMAGES_DESC;
    } else {
      this.sortOrder = EquipmentItemsSortOrder.IMAGES;
    }

    this.cookieService.put(EQUIPMENT_EXPLORER_PAGE_SORTING_COOKIE, this.sortOrder, {
      path: "/",
      expires: null
    });

    this.getItems();
  }

  onNavCollapsedChanged(collapsed: boolean): void {
    this.navCollapsed = collapsed;
    this.changeDetectionRef.detectChanges();
  }

  getItems() {
  }

  protected _scrollToItemBrowser(): void {
    if (this.windowRefService.nativeWindow.innerWidth < 768) {
      this.windowRefService.scrollToElement("astrobin-equipment-item-browser");
    }
  }
}
