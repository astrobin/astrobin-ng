import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from "@angular/core";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { TitleService } from "@core/services/title/title.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Actions } from "@ngrx/effects";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { tap } from "rxjs/operators";
import {
  PendingExplorerBaseComponent,
  PendingType
} from "@features/equipment/pages/explorer-base/pending-explorer-base.component";
import { WindowRefService } from "@core/services/window-ref.service";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { CookieService } from "ngx-cookie";
import { EquipmentItemService } from "@core/services/equipment-item.service";
import { DeviceService } from "@core/services/device.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";

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
