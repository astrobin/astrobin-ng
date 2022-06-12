import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { TitleService } from "@shared/services/title/title.service";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { Actions } from "@ngrx/effects";
import { ExplorerBaseComponent } from "@features/equipment/pages/explorer-base/explorer-base.component";
import { WindowRefService } from "@shared/services/window-ref.service";
import { filter, take, takeUntil, tap } from "rxjs/operators";
import { BrandInterface } from "@features/equipment/types/brand.interface";
import { LoadBrand } from "@features/equipment/store/equipment.actions";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { selectBrand, selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { UtilsService } from "@shared/services/utils/utils.service";
import { Location } from "@angular/common";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { CameraInterface, CameraType } from "@features/equipment/types/camera.interface";

enum ExplorerPageSortOrder {
  AZ = "az",
  AZ_DESC = "-az",
  USERS = "users",
  USERS_DESC = "-users",
  IMAGES = "images",
  IMAGES_DESC = "-images"
}

@Component({
  selector: "astrobin-equipment-explorer-page",
  templateUrl: "./explorer-page.component.html",
  styleUrls: ["./explorer-page.component.scss"]
})
export class ExplorerPageComponent extends ExplorerBaseComponent implements OnInit {
  readonly EquipmentItemType = EquipmentItemType;
  readonly ExplorerPageSortOrder = ExplorerPageSortOrder;

  title = this.translateService.instant("Equipment explorer");
  activeId: EquipmentItemBaseInterface["id"];
  sortOrder: ExplorerPageSortOrder = ExplorerPageSortOrder.AZ;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly translateService: TranslateService,
    public readonly titleService: TitleService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router,
    public readonly windowRefService: WindowRefService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly location: Location,
    public readonly equipmentItemService: EquipmentItemService
  ) {
    super(store$, actions$, activatedRoute, router, windowRefService);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this._setTitle();
    this._setBreadcrumb();
    this._setParams();

    this.router.events
      .pipe(
        takeUntil(this.destroyed$),
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        this._setParams();
        this.getItems();
      });
  }

  _setTitle() {
    this.titleService.setTitle(this.title);
  }

  _setBreadcrumb() {
    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [
          {
            label: this.translateService.instant("Equipment")
          },
          {
            label: this.translateService.instant("Explorer")
          }
        ]
      })
    );
  }

  _setParams() {
    this.activeId = parseInt(this.activatedRoute.snapshot.paramMap.get("itemId"), 10);
    this.page = parseInt(this.activatedRoute.snapshot.queryParamMap.get("page"), 10) || 1;
  }

  _setLocation() {
    const _doSetLocation = (brand: BrandInterface | null, item: EquipmentItemBaseInterface) => {
      setTimeout(() => {
        if (!item) {
          let url = `/equipment/explorer/${this.activeType.toLowerCase()}`;
          if (this.page > 1) {
            url = UtilsService.addOrUpdateUrlParam(url, "page", this.page + "");
          }

          if (this.sortOrder !== ExplorerPageSortOrder.AZ) {
            url = UtilsService.addOrUpdateUrlParam(url, "sort", this.sortOrder);
          }

          this.location.replaceState(url);
          return;
        }

        let slug = UtilsService.slugify(
          `${!!brand ? brand.name : this.translateService.instant("(DIY)")} ${item.name}`
        );

        if (this.equipmentItemService.getType(item) === EquipmentItemType.CAMERA) {
          const camera = item as CameraInterface;

          if (camera.type === CameraType.DSLR_MIRRORLESS) {
            if (camera.modified) {
              slug += "-modified";
            }

            if (camera.cooled) {
              slug += "-cooled";
            }
          }
        }

        if (
          this.windowRefService.nativeWindow.location.pathname.indexOf(
            `/${this.activeType.toLowerCase()}/${item.id}/`
          ) === -1
        ) {
          this.location.replaceState(`/equipment/explorer/${this.activeType.toLowerCase()}/${item.id}/${slug}`);
        }
      }, 100);
    };

    if (!!this.activeId) {
      this.store$
        .select(selectEquipmentItem, { id: this.activeId, type: this.activeType })
        .pipe(
          filter(item => !!item),
          take(1)
        )
        .subscribe(item => {
          if (item) {
            if (!!item.brand) {
              this.store$
                .select(selectBrand, item.brand)
                .pipe(
                  filter(brand => !!brand),
                  take(1)
                )
                .subscribe(brand => {
                  _doSetLocation(brand, item);
                });
            } else {
              _doSetLocation(null, item);
            }
          } else {
            _doSetLocation(null, null);
          }
        });
    } else {
      _doSetLocation(null, null);
    }
  }

  onSelectedItemChanged(item: EquipmentItemBaseInterface) {
    this.activeId = !!item ? item.id : null;
    this._setLocation();
  }

  viewItem(item: EquipmentItemBaseInterface): void {
    this.onSelectedItemChanged(item);
  }

  getItems() {
    this.items$ = this.equipmentApiService.getAllEquipmentItems(this._activeType, this.page, this.sortOrder).pipe(
      tap(response => {
        const uniqueBrands: BrandInterface["id"][] = [];
        for (const item of response.results) {
          if (!!item.brand && uniqueBrands.indexOf(item.brand) === -1) {
            uniqueBrands.push(item.brand);
          }
        }
        uniqueBrands.forEach(id => this.store$.dispatch(new LoadBrand({ id })));
      })
    );
  }

  toggleAZSorting() {
    if (this.sortOrder !== ExplorerPageSortOrder.AZ) {
      this.sortOrder = ExplorerPageSortOrder.AZ;
    } else {
      this.sortOrder = ExplorerPageSortOrder.AZ_DESC;
    }

    this.getItems();
  }

  toggleUsersSorting() {
    if (this.sortOrder !== ExplorerPageSortOrder.USERS_DESC) {
      this.sortOrder = ExplorerPageSortOrder.USERS_DESC;
    } else {
      this.sortOrder = ExplorerPageSortOrder.USERS;
    }

    this.getItems();
  }

  toggleImagesSorting() {
    if (this.sortOrder !== ExplorerPageSortOrder.IMAGES_DESC) {
      this.sortOrder = ExplorerPageSortOrder.IMAGES_DESC;
    } else {
      this.sortOrder = ExplorerPageSortOrder.IMAGES;
    }

    this.getItems();
  }
}
