import { ChangeDetectorRef, Component, Inject, PLATFORM_ID, ViewChild, TemplateRef, AfterViewInit, OnDestroy } from "@angular/core";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { Actions } from "@ngrx/effects";
import { ActivatedRoute, Router } from "@angular/router";
import { ExplorerBaseComponent } from "@features/equipment/pages/explorer-base/explorer-base.component";
import { WindowRefService } from "@core/services/window-ref.service";
import { CookieService } from "ngx-cookie";
import { EquipmentItemService } from "@core/services/equipment-item.service";
import { DeviceService } from "@core/services/device.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { MobilePageMenuService } from "@core/services/mobile-page-menu.service";

export enum PendingType {
  PENDING_EDIT = "PENDING_EDIT",
  PENDING_REVIEW = "PENDING_REVIEW"
}

@Component({
  selector: "astrobin-equipment-pending-explorer-base",
  templateUrl: "./pending-explorer-base.component.html"
})
export class PendingExplorerBaseComponent extends ExplorerBaseComponent implements AfterViewInit, OnDestroy {
  readonly PendingType = PendingType;
  pendingType: PendingType;
  
  @ViewChild("titleTemplate", { static: true })
  titleTemplate: TemplateRef<any>;
  
  @ViewChild("descriptionTemplate", { static: true })
  descriptionTemplate: TemplateRef<any>;
  
  @ViewChild("navTemplate", { static: true })
  navTemplate: TemplateRef<any>;

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
    public readonly offcanvasService: NgbOffcanvas,
    public readonly mobilePageMenuService: MobilePageMenuService
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
  
  ngAfterViewInit() {
    super.ngAfterViewInit?.();
    this._registerMobilePageMenu();
  }
  
  ngOnDestroy(): void {
    this.mobilePageMenuService.clearMenu();
    super.ngOnDestroy();
  }
  
  onMobileMenuOpen(): void {
    // Any specific logic needed when menu opens
  }
  
  onMobileMenuClose(): void {
    // Any specific logic needed when menu closes
  }
  
  /**
   * Register the mobile page menu with the service
   */
  private _registerMobilePageMenu(): void {
    if (!this.deviceService.mdMax()) {
      return;
    }
    
    // Only register if the templates are available
    if (!this.titleTemplate || !this.descriptionTemplate || !this.navTemplate) {
      return;
    }
    
    // Register the menu configuration with the service
    this.mobilePageMenuService.registerMenu({
      titleTemplate: this.titleTemplate,
      descriptionTemplate: this.descriptionTemplate,
      template: this.navTemplate,
    });
  }
}
