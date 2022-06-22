import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import {
  EQUIPMENT_EXPLORER_PAGE_SORTING_COOKIE,
  ExplorerBaseComponent,
  ExplorerPageSortOrder
} from "@features/equipment/pages/explorer-base/explorer-base.component";
import { Actions, ofType } from "@ngrx/effects";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { WindowRefService } from "@shared/services/window-ref.service";
import { TranslateService } from "@ngx-translate/core";
import {
  arrayUniqueEquipmentItems,
  selectBrand,
  selectBrands,
  selectEquipmentItems,
  selectImagesUsingEquipmentBrand,
  selectUsersUsingEquipmentBrand
} from "@features/equipment/store/equipment.selectors";
import {
  EquipmentActionTypes,
  GetAllBrands,
  GetAllBrandsSuccess,
  GetAllInBrand,
  GetAllInBrandSuccess,
  GetImagesUsingBrand,
  GetUsersUsingBrand
} from "@features/equipment/store/equipment.actions";
import { filter, map, take, takeUntil } from "rxjs/operators";
import { UtilsService } from "@shared/services/utils/utils.service";
import { CookieService } from "ngx-cookie-service";
import { LoadingService } from "@shared/services/loading.service";
import { BrandInterface } from "@features/equipment/types/brand.interface";
import { Observable } from "rxjs";
import { UserInterface } from "@shared/interfaces/user.interface";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";

@Component({
  selector: "astrobin-brand-explorer-page",
  templateUrl: "./brand-explorer-page.component.html",
  styleUrls: ["./brand-explorer-page.component.scss"]
})
export class BrandExplorerPageComponent extends ExplorerBaseComponent implements OnInit {
  readonly ExplorerPageSortOrder = ExplorerPageSortOrder;
  readonly UtilsService = UtilsService;

  title = this.translateService.instant("Equipment explorer");
  activeId: BrandInterface["id"];
  activeBrand: BrandInterface;
  itemsInBrand: EquipmentItemBaseInterface[];

  usersUsing$: Observable<UserInterface[]>;
  imagesUsing$: Observable<ImageInterface[]>;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router,
    public readonly windowRefService: WindowRefService,
    public readonly translateService: TranslateService,
    public readonly cookieService: CookieService,
    public readonly loadingService: LoadingService,
    public readonly equipmentItemService: EquipmentItemService
  ) {
    super(store$, actions$, activatedRoute, router, windowRefService, cookieService);
    this.activeType = "BRAND";
  }

  get logo(): string {
    return (this.activeBrand.logo as string) || "/assets/images/brand-placeholder.png";
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
      (this.cookieService.get(EQUIPMENT_EXPLORER_PAGE_SORTING_COOKIE) as ExplorerPageSortOrder) ||
      ExplorerPageSortOrder.AZ;

    if (!!this.activeBrand) {
      return this._loadItemsInBrand();
    }

    this.items$ = this.store$.select(selectBrands).pipe(
      map(brands =>
        [...brands].sort((a: BrandInterface, b: BrandInterface) => {
          let diff: number;

          switch (this.sortOrder) {
            case ExplorerPageSortOrder.AZ:
              return a.name.localeCompare(b.name);
            case ExplorerPageSortOrder.AZ_DESC:
              return b.name.localeCompare(a.name);
            case ExplorerPageSortOrder.IMAGES:
              diff = a.imageCount - b.imageCount;
              return diff === 0 ? a.name.localeCompare(b.name) : diff;
            case ExplorerPageSortOrder.IMAGES_DESC:
              diff = b.imageCount - a.imageCount;
              return diff === 0 ? a.name.localeCompare(b.name) : diff;
            case ExplorerPageSortOrder.USERS:
              diff = a.userCount - b.userCount;
              return diff === 0 ? a.name.localeCompare(b.name) : diff;
            case ExplorerPageSortOrder.USERS_DESC:
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
    this.activeId = parseInt(this.activatedRoute.snapshot.paramMap.get("brandId"), 10);
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
          this._loadUsing();
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
                case ExplorerPageSortOrder.AZ:
                  return a.name.localeCompare(b.name);
                case ExplorerPageSortOrder.AZ_DESC:
                  return b.name.localeCompare(a.name);
                case ExplorerPageSortOrder.IMAGES:
                  diff = a.imageCount - b.imageCount;
                  return diff === 0 ? a.name.localeCompare(b.name) : diff;
                case ExplorerPageSortOrder.IMAGES_DESC:
                  diff = b.imageCount - a.imageCount;
                  return diff === 0 ? a.name.localeCompare(b.name) : diff;
                case ExplorerPageSortOrder.USERS:
                  diff = a.userCount - b.userCount;
                  return diff === 0 ? a.name.localeCompare(b.name) : diff;
                case ExplorerPageSortOrder.USERS_DESC:
                  diff = b.userCount - a.userCount;
                  return diff === 0 ? a.name.localeCompare(b.name) : diff;
              }

              return 0;
            }
          );
        });
    }
  }

  private _loadUsing() {
    this.store$.dispatch(new GetUsersUsingBrand({ brandId: this.activeId }));
    this.store$.dispatch(new GetImagesUsingBrand({ brandId: this.activeId }));

    this.usersUsing$ = this.store$.select(selectUsersUsingEquipmentBrand, {
      brandId: this.activeId
    });

    this.imagesUsing$ = this.store$.select(selectImagesUsingEquipmentBrand, {
      brandId: this.activeId
    });
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
}
