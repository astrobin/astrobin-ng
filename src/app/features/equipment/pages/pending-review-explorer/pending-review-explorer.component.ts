import type { OnInit } from "@angular/core";
import { ChangeDetectorRef, Component, Inject, PLATFORM_ID } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import type { MainState } from "@app/store/state";
import type { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import { DeviceService } from "@core/services/device.service";
import { EquipmentItemService } from "@core/services/equipment-item.service";
import { LoadingService } from "@core/services/loading.service";
import { TitleService } from "@core/services/title/title.service";
import { WindowRefService } from "@core/services/window-ref.service";
import {
  PendingExplorerBaseComponent,
  PendingType
} from "@features/equipment/pages/explorer-base/pending-explorer-base.component";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { LoadBrand } from "@features/equipment/store/equipment.actions";
import type { BrandInterface } from "@features/equipment/types/brand.interface";
import type {
  EquipmentItemBaseInterface,
  EquipmentItemType
} from "@features/equipment/types/equipment-item-base.interface";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { CookieService } from "ngx-cookie";
import type { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Component({
  selector: "astrobin-equipment-pending-review-explorer",
  templateUrl: "../explorer-base/pending-explorer-base.component.html",
  styleUrls: ["../explorer-base/pending-explorer-base.component.scss"]
})
export class PendingReviewExplorerComponent extends PendingExplorerBaseComponent implements OnInit {
  title = this.translateService.instant("Equipment pending review");

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
    public readonly equipmentItemService: EquipmentItemService,
    public readonly changeDetectionRef: ChangeDetectorRef,
    @Inject(PLATFORM_ID) public readonly platformId: object,
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
      equipmentItemService,
      changeDetectionRef,
      platformId,
      deviceService,
      offcanvasService
    );
    this.pendingType = PendingType.PENDING_REVIEW;
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
            label: this.translateService.instant("Pending review")
          }
        ]
      })
    );
  }

  getItems() {
    this.loadingService.setLoading(true);
    this.items$ = this.equipmentApiService
      .getAllEquipmentItemsPendingReview(this._activeType as EquipmentItemType, this.page)
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
