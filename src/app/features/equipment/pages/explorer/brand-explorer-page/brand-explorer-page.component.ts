import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import {
  EQUIPMENT_EXPLORER_PAGE_SORTING_COOKIE,
  ExplorerBaseComponent
} from "@features/equipment/pages/explorer-base/explorer-base.component";
import { Actions, ofType } from "@ngrx/effects";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { WindowRefService } from "@shared/services/window-ref.service";
import { TranslateService } from "@ngx-translate/core";
import {
  arrayUniqueEquipmentItems,
  selectBrand,
  selectBrands,
  selectEquipmentItems
} from "@features/equipment/store/equipment.selectors";
import {
  EquipmentActionTypes,
  GetAllBrands,
  GetAllBrandsSuccess,
  GetAllInBrand,
  GetAllInBrandSuccess
} from "@features/equipment/store/equipment.actions";
import { filter, map, take, takeUntil } from "rxjs/operators";
import { UtilsService } from "@shared/services/utils/utils.service";
import { CookieService } from "ngx-cookie";
import { LoadingService } from "@shared/services/loading.service";
import { BrandInterface } from "@features/equipment/types/brand.interface";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { EquipmentApiService, EquipmentItemsSortOrder } from "@features/equipment/services/equipment-api.service";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { VariantSelectorModalComponent } from "@shared/components/equipment/item-browser/variant-selector-modal/variant-selector-modal.component";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { EquipmentListingsInterface } from "@features/equipment/types/equipment-listings.interface";

@Component({
  selector: "astrobin-brand-explorer-page",
  templateUrl: "./brand-explorer-page.component.html",
  styleUrls: ["./brand-explorer-page.component.scss"]
})
export class BrandExplorerPageComponent extends ExplorerBaseComponent implements OnInit {
  readonly ExplorerPageSortOrder = EquipmentItemsSortOrder;
  readonly UtilsService = UtilsService;

  title = this.translateService.instant("Equipment explorer");
  activeId: BrandInterface["id"];
  activeBrand: BrandInterface;
  itemsInBrand: EquipmentItemBaseInterface[];
  listings: EquipmentListingsInterface = null;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router,
    public readonly windowRefService: WindowRefService,
    public readonly translateService: TranslateService,
    public readonly cookieService: CookieService,
    public readonly loadingService: LoadingService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly modalService: NgbModal,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly changeDetectionRef: ChangeDetectorRef
  ) {
    super(store$, actions$, activatedRoute, router, windowRefService, cookieService, changeDetectionRef);
    this.activeType = "BRAND";
  }

  get logo(): string {
    return (this.activeBrand.logo as string) || "/assets/images/brand-placeholder.png?v=2";
  }

  ngOnInit(): void {
    super.ngOnInit();

    this._setParams();
    this._loadAllPages();
    this._setupRouterEvents();
  }

  getItems() {
    this.loadingService.setLoading(true);

    this.sortOrder =
      (this.cookieService.get(EQUIPMENT_EXPLORER_PAGE_SORTING_COOKIE) as EquipmentItemsSortOrder) ||
      EquipmentItemsSortOrder.AZ;

    if (!!this.activeBrand) {
      return this._loadItemsInBrand();
    }

    this.items$ = this.store$.select(selectBrands).pipe(
      map(brands =>
        [...brands].sort((a: BrandInterface, b: BrandInterface) => {
          let diff: number;

          switch (this.sortOrder) {
            case EquipmentItemsSortOrder.AZ:
              return a.name.localeCompare(b.name);
            case EquipmentItemsSortOrder.AZ_DESC:
              return b.name.localeCompare(a.name);
            case EquipmentItemsSortOrder.IMAGES:
              diff = a.imageCount - b.imageCount;
              return diff === 0 ? a.name.localeCompare(b.name) : diff;
            case EquipmentItemsSortOrder.IMAGES_DESC:
              diff = b.imageCount - a.imageCount;
              return diff === 0 ? a.name.localeCompare(b.name) : diff;
            case EquipmentItemsSortOrder.USERS:
              diff = a.userCount - b.userCount;
              return diff === 0 ? a.name.localeCompare(b.name) : diff;
            case EquipmentItemsSortOrder.USERS_DESC:
              diff = b.userCount - a.userCount;
              return diff === 0 ? a.name.localeCompare(b.name) : diff;
          }

          return 0;
        })
      )
    );

    this.store$.dispatch(new GetAllBrands({ page: 1, sort: this.sortOrder }));
  }

  viewBrand(brand: BrandInterface) {
    this.router.navigateByUrl(`/equipment/explorer/brand/${brand.id}/${UtilsService.slugify(brand.name)}`);
  }

  viewItem(item: EquipmentItemBaseInterface): void {
    if (item.variants?.length > 0) {
      const modal: NgbModalRef = this.modalService.open(VariantSelectorModalComponent);
      const componentInstance: VariantSelectorModalComponent = modal.componentInstance;
      componentInstance.variants = [...[item], ...item.variants].filter(variant => !variant.frozenAsAmbiguous);
      componentInstance.enableSelectFrozen = false;

      modal.closed.pipe(take(1)).subscribe((variant: EquipmentItem) => {
        this.router.navigateByUrl(`/equipment/explorer/${variant.klass}/${variant.id}/`);
      });
    } else {
      this.router.navigateByUrl(`/equipment/explorer/${item.klass}/${item.id}/`);
    }
  }

  closeBrand() {
    this.router.navigateByUrl("/equipment/explorer/brand/");
  }

  private _loadAllPages() {
    this.actions$
      .pipe(
        ofType(EquipmentActionTypes.GET_ALL_BRANDS_SUCCESS),
        takeUntil(this.destroyed$),
        map((action: GetAllBrandsSuccess) => action.payload.response)
      )
      .subscribe(response => {
        if (!response.next) {
          this.loadingService.setLoading(false);
          return;
        }

        const nextUrl = response.next;
        const nextPage = parseInt(UtilsService.getUrlParam(nextUrl, "page"), 10);
        this.store$.dispatch(new GetAllBrands({ page: nextPage, sort: this.sortOrder }));
      });
  }

  private _setParams() {
    this.activeId = parseInt(this.activatedRoute.snapshot?.paramMap.get("brandId"), 10);
    if (!!this.activeId) {
      this.store$
        .select(selectBrand, this.activeId)
        .pipe(
          filter(brand => !!brand),
          take(1)
        )
        .subscribe(brand => {
          this.activeBrand = brand;
          this._loadItemsInBrand();
          this._loadListings();
        });
    }
  }

  private _loadItemsInBrand() {
    if (!this.activeBrand) {
      return;
    }

    this.actions$
      .pipe(
        ofType(EquipmentActionTypes.GET_ALL_IN_BRAND_SUCCESS),
        takeUntil(this.destroyed$),
        map((action: GetAllInBrandSuccess) => action.payload.response)
      )
      .subscribe(response => {
        if (!response.next) {
          this.loadingService.setLoading(false);
          return;
        }

        const nextUrl = response.next;
        const nextPage = parseInt(UtilsService.getUrlParam(nextUrl, "page"), 10);
        this.store$.dispatch(
          new GetAllInBrand({ brand: this.activeBrand.id, type: response.results[0].klass, page: nextPage })
        );
      });

    for (const itemType of Object.keys(EquipmentItemType)) {
      this.store$.dispatch(
        new GetAllInBrand({ brand: this.activeBrand.id, type: itemType as EquipmentItemType, page: 1 })
      );

      this.store$
        .select(selectEquipmentItems)
        .pipe(
          takeUntil(this.destroyed$),
          map(items => items.filter(item => item.brand === this.activeBrand.id && item.klass === itemType)),
          filter(items => items.length > 0)
        )
        .subscribe(items => {
          if (!this.itemsInBrand) {
            this.itemsInBrand = [];
          }

          this.itemsInBrand = arrayUniqueEquipmentItems([...this.itemsInBrand, ...items]).sort(
            (a: EquipmentItemBaseInterface, b: EquipmentItemBaseInterface) => {
              let diff: number;

              switch (this.sortOrder) {
                case EquipmentItemsSortOrder.AZ:
                  return a.name.localeCompare(b.name);
                case EquipmentItemsSortOrder.AZ_DESC:
                  return b.name.localeCompare(a.name);
                case EquipmentItemsSortOrder.IMAGES:
                  diff = a.imageCount - b.imageCount;
                  return diff === 0 ? a.name.localeCompare(b.name) : diff;
                case EquipmentItemsSortOrder.IMAGES_DESC:
                  diff = b.imageCount - a.imageCount;
                  return diff === 0 ? a.name.localeCompare(b.name) : diff;
                case EquipmentItemsSortOrder.USERS:
                  diff = a.userCount - b.userCount;
                  return diff === 0 ? a.name.localeCompare(b.name) : diff;
                case EquipmentItemsSortOrder.USERS_DESC:
                  diff = b.userCount - a.userCount;
                  return diff === 0 ? a.name.localeCompare(b.name) : diff;
              }

              return 0;
            }
          );
        });
    }
  }

  private _setupRouterEvents() {
    this.router.events
      .pipe(
        takeUntil(this.destroyed$),
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        this._setParams();
      });
  }

  private _loadListings() {
    this.loadingService.setLoading(true);

    this.listings = null;

    if (!!this.activeBrand) {
      this.equipmentApiService.getListingsForBrand(this.activeBrand.id).subscribe(listings => {
        // Skip "Lite" retailer integration for now. On the classic website, full integration means banners, and lite
        // integration means shopping cart menu in the corner of the technical card.
        // On the equipment item page, full means banners, and lite means stock availability.
        if (listings.allowFullRetailerIntegration) {
          this.listings = listings;
        }
        this.loadingService.setLoading(false);
      });
    } else {
      this.loadingService.setLoading(false);
    }
  }
}
