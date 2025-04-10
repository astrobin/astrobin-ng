import type { ChangeDetectorRef, OnInit } from "@angular/core";
import { Component, Inject, PLATFORM_ID } from "@angular/core";
import type { ActivatedRoute, Router } from "@angular/router";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import type { MainState } from "@app/store/state";
import type { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import type { DeviceService } from "@core/services/device.service";
import type { EquipmentItemService } from "@core/services/equipment-item.service";
import type { LoadingService } from "@core/services/loading.service";
import type { TitleService } from "@core/services/title/title.service";
import type { WindowRefService } from "@core/services/window-ref.service";
import { ExplorerBaseComponent } from "@features/equipment/pages/explorer-base/explorer-base.component";
import type { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { LoadBrand } from "@features/equipment/store/equipment.actions";
import type { BrandInterface } from "@features/equipment/types/brand.interface";
import type {
  EquipmentItemBaseInterface,
  EquipmentItemType
} from "@features/equipment/types/equipment-item-base.interface";
import type { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import type { Actions } from "@ngrx/effects";
import type { Store } from "@ngrx/store";
import type { TranslateService } from "@ngx-translate/core";
import type { CookieService } from "ngx-cookie";
import type { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Component({
  selector: "astrobin-equipment-pending-review-explorer",
  templateUrl: "followed-explorer.component.html"
})
export class FollowedExplorerComponent extends ExplorerBaseComponent implements OnInit {
  title = this.translateService.instant("Followed equipment");

  items$: Observable<PaginatedApiResultInterface<EquipmentItemBaseInterface>>;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly translateService: TranslateService,
    public readonly titleService: TitleService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly router: Router,
    public readonly windowRefService: WindowRefService,
    public readonly cookieService: CookieService,
    public readonly loadingService: LoadingService,
    public readonly changeDetectionRef: ChangeDetectorRef,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly deviceService: DeviceService,
    public readonly offcanvasService: NgbOffcanvas
  ) {
    super(
      store$,
      actions$,
      activatedRoute,
      router,
      windowRefService,
      cookieService,
      changeDetectionRef,
      platformId,
      deviceService,
      offcanvasService
    );
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.titleService.setTitle(this.title);

    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [
          {
            label: this.translateService.instant("Equipment")
          },
          {
            label: this.translateService.instant("Followed")
          }
        ]
      })
    );
  }

  getItems() {
    this.loadingService.setLoading(true);
    this.items$ = this.equipmentApiService
      .getAllFollowedEquipmentItems(this._activeType as EquipmentItemType, this.page)
      .pipe(
        tap(response => {
          const uniqueBrands: BrandInterface["id"][] = [];
          for (const item of response.results) {
            if (!!item.brand && uniqueBrands.indexOf(item.brand) === -1) {
              uniqueBrands.push(item.brand);
            }
          }
          uniqueBrands.forEach(id => this.store$.dispatch(new LoadBrand({ id })));
        }),
        tap(() => {
          this.loadingService.setLoading(false);
        })
      );
  }
}
