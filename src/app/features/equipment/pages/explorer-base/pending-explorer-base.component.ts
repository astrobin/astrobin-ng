import { ChangeDetectorRef, Component, Inject, PLATFORM_ID } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MainState } from "@app/store/state";
import { DeviceService } from "@core/services/device.service";
import { EquipmentItemService } from "@core/services/equipment-item.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { ExplorerBaseComponent } from "@features/equipment/pages/explorer-base/explorer-base.component";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { CookieService } from "ngx-cookie";

export enum PendingType {
  PENDING_EDIT = "PENDING_EDIT",
  PENDING_REVIEW = "PENDING_REVIEW"
}

@Component({
  selector: "astrobin-equipment-pending-explorer-base",
  templateUrl: "./pending-explorer-base.component.html"
})
export class PendingExplorerBaseComponent extends ExplorerBaseComponent {
  readonly PendingType = PendingType;
  pendingType: PendingType;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly activatedRoute: ActivatedRoute,
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
      changeDetectionRef,
      platformId,
      deviceService,
      offcanvasService
    );
  }
}
