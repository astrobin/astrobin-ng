import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID, ViewChild, TemplateRef, AfterViewInit, OnDestroy } from "@angular/core";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { TitleService } from "@core/services/title/title.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Actions } from "@ngrx/effects";
import { Observable } from "rxjs";
import { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { tap } from "rxjs/operators";
import { LoadBrand } from "@features/equipment/store/equipment.actions";
import { BrandInterface } from "@features/equipment/types/brand.interface";
import { WindowRefService } from "@core/services/window-ref.service";
import { CookieService } from "ngx-cookie";
import { LoadingService } from "@core/services/loading.service";
import { ExplorerBaseComponent } from "@features/equipment/pages/explorer-base/explorer-base.component";
import { EquipmentItemService } from "@core/services/equipment-item.service";
import { DeviceService } from "@core/services/device.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { MobilePageMenuService } from "@core/services/mobile-page-menu.service";

@Component({
  selector: "astrobin-equipment-pending-review-explorer",
  templateUrl: "followed-explorer.component.html"
})
export class FollowedExplorerComponent extends ExplorerBaseComponent implements OnInit, AfterViewInit, OnDestroy {
  title = this.translateService.instant("Followed equipment");

  items$: Observable<PaginatedApiResultInterface<EquipmentItemBaseInterface>>;
  
  @ViewChild("titleTemplate", { static: true })
  titleTemplate: TemplateRef<any>;
  
  @ViewChild("descriptionTemplate", { static: true })
  descriptionTemplate: TemplateRef<any>;
  
  @ViewChild("navTemplate", { static: true })
  navTemplate: TemplateRef<any>;

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
