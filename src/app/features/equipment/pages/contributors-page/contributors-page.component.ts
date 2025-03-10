import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, TemplateRef, Inject, ChangeDetectorRef, PLATFORM_ID } from "@angular/core";
import { selectEquipmentContributors } from "@features/equipment/store/equipment.selectors";
import { takeUntil } from "rxjs/operators";
import { GetContributors } from "@features/equipment/store/equipment.actions";
import { ExplorerBaseComponent } from "@features/equipment/pages/explorer-base/explorer-base.component";
import { Observable } from "rxjs";
import { ContributorInterface } from "@features/equipment/types/contributor.interface";
import { MobilePageMenuService } from "@core/services/mobile-page-menu.service";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { Actions } from "@ngrx/effects";
import { ActivatedRoute, Router } from "@angular/router";
import { WindowRefService } from "@core/services/window-ref.service";
import { CookieService } from "ngx-cookie";
import { DeviceService } from "@core/services/device.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "astrobin-contributors-page",
  templateUrl: "./contributors-page.component.html",
  styleUrls: ["./contributors-page.component.scss"]
})
export class ContributorsPageComponent extends ExplorerBaseComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly contributors$: Observable<ContributorInterface[]> = this.store$.select(selectEquipmentContributors).pipe(
    takeUntil(this.destroyed$)
  );
  
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
    public readonly changeDetectorRef: ChangeDetectorRef,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly deviceService: DeviceService,
    public readonly offcanvasService: NgbOffcanvas,
    private readonly mobilePageMenuService: MobilePageMenuService
  ) {
    super(
      store$,
      actions$,
      activatedRoute,
      router,
      windowRefService,
      cookieService,
      changeDetectorRef,
      platformId,
      deviceService,
      offcanvasService
    );
  }

  ngOnInit() {
    super.ngOnInit();

    this.store$.dispatch(new GetContributors());
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
      template: this.navTemplate
    });
  }
}
