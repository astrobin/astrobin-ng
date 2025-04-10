import type { ChangeDetectorRef, OnInit } from "@angular/core";
import { Component, Inject, PLATFORM_ID } from "@angular/core";
import type { ActivatedRoute, Router } from "@angular/router";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import type { MainState } from "@app/store/state";
import type { DeviceService } from "@core/services/device.service";
import type { EquipmentItemService } from "@core/services/equipment-item.service";
import type { TitleService } from "@core/services/title/title.service";
import type { WindowRefService } from "@core/services/window-ref.service";
import {
  PendingExplorerBaseComponent,
  PendingType
} from "@features/equipment/pages/explorer-base/pending-explorer-base.component";
import type { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import type { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import type { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import type { Actions } from "@ngrx/effects";
import type { Store } from "@ngrx/store";
import type { TranslateService } from "@ngx-translate/core";
import type { CookieService } from "ngx-cookie";
import { tap } from "rxjs/operators";

@Component({
  selector: "astrobin-equipment-pending-edit-explorer",
  templateUrl: "../explorer-base/pending-explorer-base.component.html",
  styleUrls: ["../explorer-base/pending-explorer-base.component.scss"]
})
export class PendingEditExplorerComponent extends PendingExplorerBaseComponent implements OnInit {
  title = this.translateService.instant("Equipment pending edit");

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
    public readonly equipmentItemService: EquipmentItemService,
    public readonly changeDetectionRef: ChangeDetectorRef,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
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
    this.pendingType = PendingType.PENDING_EDIT;
  }

  ngOnInit() {
    super.ngOnInit();

    this.titleService.setTitle(this.title);

    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [
          {
            label: this.translateService.instant("Equipment")
          },
          {
            label: this.translateService.instant("Pending edit")
          }
        ]
      })
    );
  }

  getItems() {
    this.items$ = this.equipmentApiService.getAllEquipmentItemsPendingEdit(this._activeType as EquipmentItemType);
  }
}
