import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { TitleService } from "@shared/services/title/title.service";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { Actions } from "@ngrx/effects";
import {
  EQUIPMENT_EXPLORER_PAGE_SORTING_COOKIE,
  ExplorerBaseComponent
} from "@features/equipment/pages/explorer-base/explorer-base.component";
import { WindowRefService } from "@shared/services/window-ref.service";
import { filter, take, takeUntil, tap } from "rxjs/operators";
import { EquipmentApiService, EquipmentItemsSortOrder } from "@features/equipment/services/equipment-api.service";
import { selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { UtilsService } from "@shared/services/utils/utils.service";
import { Location } from "@angular/common";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { CameraInterface, CameraType } from "@features/equipment/types/camera.interface";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { CookieService } from "ngx-cookie";
import {
  ExplorerFilterInterface,
  ExplorerFiltersComponent
} from "@features/equipment/pages/explorer/explorer-filters/explorer-filters.component";
import { CompareService } from "@features/equipment/services/compare.service";
import { ExplorerComponent } from "@features/equipment/components/explorer/explorer.component";
import { ItemTypeNavComponent } from "@features/equipment/components/item-type-nav/item-type-nav.component";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { VariantSelectorModalComponent } from "@shared/components/equipment/item-browser/variant-selector-modal/variant-selector-modal.component";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";

@Component({
  selector: "astrobin-equipment-explorer-page",
  templateUrl: "./explorer-page.component.html",
  styleUrls: ["./explorer-page.component.scss"]
})
export class ExplorerPageComponent extends ExplorerBaseComponent implements OnInit {
  readonly EquipmentItemType = EquipmentItemType;
  readonly ExplorerPageSortOrder = EquipmentItemsSortOrder;

  @ViewChild("explorer")
  explorer: ExplorerComponent;

  @ViewChild("explorerFilters")
  explorerFilters: ExplorerFiltersComponent;

  @ViewChild("itemTypeNavComponent")
  itemTypeNavComponent: ItemTypeNavComponent;

  title = this.translateService.instant("Equipment explorer");
  activeId: EquipmentItemBaseInterface["id"];
  filters: ExplorerFilterInterface[] = [];
  creationMode = false;
  compareComponentVisible = false;
  goBackOnClose = false;

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
    public readonly equipmentItemService: EquipmentItemService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly cookieService: CookieService,
    public readonly compareService: CompareService,
    public readonly utilsService: UtilsService,
    public readonly modalService: NgbModal,
    public readonly changeDetectionRef: ChangeDetectorRef
  ) {
    super(store$, actions$, activatedRoute, router, windowRefService, cookieService, changeDetectionRef);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this._setTitle();
    this._setBreadcrumb();
    this._setParams();
    this._setLocation();

    this.router.events
      .pipe(
        takeUntil(this.destroyed$),
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        this._setParams();
      });
  }

  onSelectedItemChanged(item: EquipmentItemBaseInterface) {
    this.activeId = !!item ? item.id : null;

    this._setLocation();
    this._scrollToItemBrowser();
  }

  viewItem(item: EquipmentItemBaseInterface): void {
    if (item.variants?.length > 0) {
      const modal: NgbModalRef = this.modalService.open(VariantSelectorModalComponent);
      const componentInstance: VariantSelectorModalComponent = modal.componentInstance;
      componentInstance.variants = [...[item], ...item.variants].filter(variant => !variant.frozenAsAmbiguous);
      componentInstance.enableSelectFrozen = false;

      modal.closed.pipe(take(1)).subscribe((variant: EquipmentItem) => {
        this.onSelectedItemChanged(variant);
      });
    } else {
      this.onSelectedItemChanged(item);
    }
  }

  getItems() {
    this.sortOrder =
      (this.cookieService.get(EQUIPMENT_EXPLORER_PAGE_SORTING_COOKIE) as EquipmentItemsSortOrder) ||
      EquipmentItemsSortOrder.AZ;
    this.filters = this.explorerFilters ? this.explorerFilters.activeFilters : [];

    this.items$ = this.equipmentApiService
      .findAllEquipmentItems(this._activeType as EquipmentItemType, {
        page: this.page,
        sortOrder: this.sortOrder,
        filters: this.filters
      })
      .pipe(tap(() => this._scrollToItemBrowser()));
  }

  filtersApplied(): void {
    this.getItems();
  }

  private _setTitle() {
    this.titleService.setTitle(this.title);
  }

  private _setBreadcrumb() {
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

  private _setParams() {
    this.page = parseInt(this.activatedRoute.snapshot?.queryParamMap.get("page"), 10) || 1;
    this.activeId = parseInt(this.activatedRoute.snapshot?.paramMap.get("itemId"), 10);
  }

  private _setLocation() {
    const _doSetLocation = (item: EquipmentItemBaseInterface) => {
      if (!!this.itemTypeNavComponent) {
        this.itemTypeNavComponent.collapse();
      }

      this.utilsService.delay(100).subscribe(() => {
        if (!item) {
          const urlObject = this.windowRefService.getCurrentUrl();

          let url = `/equipment/explorer/${this.activeType.toLowerCase()}${urlObject.search}${urlObject.hash}`;

          if (this.page > 1) {
            url = UtilsService.addOrUpdateUrlParam(url, "page", this.page + "");
          }

          if (this.sortOrder !== EquipmentItemsSortOrder.AZ) {
            url = UtilsService.addOrUpdateUrlParam(url, "sort", this.sortOrder);
          }

          this.location.replaceState(url);
          return;
        }

        const hash = this.windowRefService.nativeWindow.location.hash;

        if (
          this.activatedRoute.snapshot?.queryParamMap.get("request-review") === "true" &&
          item &&
          !!item.reviewerDecision
        ) {
          this.popNotificationsService.warning(
            this.translateService.instant("This item has already been approved by you or another moderator.")
          );
        }

        if (this.activatedRoute.snapshot?.queryParamMap.get("edit") === "true") {
          this.explorer.startEditMode();
        }

        this.goBackOnClose = this.activatedRoute.snapshot?.queryParamMap.get("back-on-close") === "true";

        let slug = UtilsService.slugify(`${!!item.brandName ? item.brandName : "diy"} ${item.name}`);

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
          this.location.replaceState(`/equipment/explorer/${this.activeType.toLowerCase()}/${item.id}/${slug}${hash}`);
        }
      });
    };

    if (!!this.activeId) {
      this.store$
        .select(selectEquipmentItem, { id: this.activeId, type: this.activeType })
        .pipe(
          filter(item => !!item),
          take(1)
        )
        .subscribe(item => {
          _doSetLocation(item);
        });
    } else {
      _doSetLocation(null);
    }
  }
}
