import type { ChangeDetectorRef, OnInit } from "@angular/core";
import { Component, Inject, PLATFORM_ID } from "@angular/core";
import type { ActivatedRoute, Params, Router } from "@angular/router";
import { NavigationEnd } from "@angular/router";
import type { MainState } from "@app/store/state";
import type { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import type { DeviceService } from "@core/services/device.service";
import { EquipmentItemDisplayProperty } from "@core/services/equipment-item.service";
import type { WindowRefService } from "@core/services/window-ref.service";
import { EquipmentItemsSortOrder } from "@features/equipment/services/equipment-api.service";
import { GetContributors } from "@features/equipment/store/equipment.actions";
import type { BrandInterface } from "@features/equipment/types/brand.interface";
import type { EditProposalInterface } from "@features/equipment/types/edit-proposal.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import type { EquipmentItemBaseInterface } from "@features/equipment/types/equipment-item-base.interface";
import type { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import type { Actions } from "@ngrx/effects";
import type { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import type { CookieService } from "ngx-cookie";
import type { Observable } from "rxjs";
import { takeUntil } from "rxjs/operators";

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

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router,
    public readonly windowRefService: WindowRefService,
    public readonly cookieService: CookieService,
    public readonly changeDetectionRef: ChangeDetectorRef,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly deviceService: DeviceService,
    public readonly offcanvasService: NgbOffcanvas
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

    this.initializeWindowWidthUpdate(this.platformId, this.deviceService, this.windowRefService);

    this.page = +this.activatedRoute.snapshot?.queryParamMap.get("page") || 1;
    this.activeType = this.activatedRoute.snapshot?.paramMap.get("itemType");
    this.activeEditProposalId = +this.activatedRoute.snapshot?.paramMap.get("editProposalId");

    this.store$.dispatch(new GetContributors());

    this.router.events?.pipe(takeUntil(this.destroyed$)).subscribe(event => {
      this.offcanvasService.dismiss();

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

  getItems() {}
}
