import type { OnInit } from "@angular/core";
import { ChangeDetectorRef, Component, Inject, PLATFORM_ID } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import type { MainState } from "@app/store/state";
import { DeviceService } from "@core/services/device.service";
import { TitleService } from "@core/services/title/title.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { ExplorerBaseComponent } from "@features/equipment/pages/explorer-base/explorer-base.component";
import type { EquipmentItemBaseInterface } from "@features/equipment/types/equipment-item-base.interface";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { CookieService } from "ngx-cookie";

@Component({
  selector: "astrobin-migration-explorer",
  templateUrl: "./migration-explorer.component.html",
  styleUrls: ["./migration-explorer.component.scss"]
})
export class MigrationExplorerComponent extends ExplorerBaseComponent implements OnInit {
  title = "Migration explorer";

  activeId: EquipmentItemBaseInterface["id"];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router,
    public readonly titleService: TitleService,
    public readonly translateService: TranslateService,
    public readonly windowRefService: WindowRefService,
    public readonly cookieService: CookieService,
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
      changeDetectionRef,
      platformId,
      deviceService,
      offcanvasService
    );
  }

  ngOnInit(): void {
    super.ngOnInit();
    this._setTitle();
    this._setBreadcrumb();
    this._setActiveId();
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
            label: this.title
          }
        ]
      })
    );
  }

  _setActiveId() {
    this.activeId = parseInt(this.activatedRoute.snapshot?.paramMap.get("itemId"), 10);
  }

  getItems() {
    return [];
  }
}
