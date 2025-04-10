import type { Location } from "@angular/common";
import type { ChangeDetectorRef, OnInit } from "@angular/core";
import { Component, Inject, PLATFORM_ID } from "@angular/core";
import type { ActivatedRoute, Router } from "@angular/router";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import type { MainState } from "@app/store/state";
import type { UserInterface } from "@core/interfaces/user.interface";
import type { CountryService } from "@core/services/country.service";
import type { DeviceService } from "@core/services/device.service";
import type { EquipmentMarketplaceService } from "@core/services/equipment-marketplace.service";
import type { LoadingService } from "@core/services/loading.service";
import type { LocalStorageService } from "@core/services/localstorage.service";
import type { RouterService } from "@core/services/router.service";
import type { TitleService } from "@core/services/title/title.service";
import type { UtilsService } from "@core/services/utils/utils.service";
import type { WindowRefService } from "@core/services/window-ref.service";
import { AuthActionTypes, LoadUser } from "@features/account/store/auth.actions";
import type { LoadUserFailure, LoadUserSuccess } from "@features/account/store/auth.actions";
import type {
  MarketplaceFilterModel,
  MarketplaceRefreshOptions
} from "@features/equipment/components/marketplace-filter/marketplace-filter.component";
import { MarketplaceListingsBasePageComponent } from "@features/equipment/pages/marketplace/listings-base/marketplace-listings-base-page.component";
import type { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import type { NgbModal, NgbOffcanvas, NgbPaginationConfig } from "@ng-bootstrap/ng-bootstrap";
import { ofType } from "@ngrx/effects";
import type { Actions } from "@ngrx/effects";
import type { Store } from "@ngrx/store";
import type { TranslateService } from "@ngx-translate/core";
import { filter, map, take } from "rxjs/operators";

@Component({
  selector: "astrobin-marketplace-user-listings-base-page",
  template: ""
})
export abstract class MarketplaceUserListingsBasePageComponent
  extends MarketplaceListingsBasePageComponent
  implements OnInit
{
  username: string;
  user: UserInterface;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly translateService: TranslateService,
    public readonly titleService: TitleService,
    public readonly loadingService: LoadingService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly countryService: CountryService,
    public readonly router: Router,
    public readonly utilsService: UtilsService,
    public readonly location: Location,
    public readonly windowRefService: WindowRefService,
    public readonly localStorageService: LocalStorageService,
    public readonly modalService: NgbModal,
    public readonly paginationConfig: NgbPaginationConfig,
    public readonly routerService: RouterService,
    @Inject(PLATFORM_ID) public readonly platformId: object,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly equipmentMarketplaceService: EquipmentMarketplaceService,
    public readonly deviceService: DeviceService,
    public readonly offcanvasService: NgbOffcanvas
  ) {
    super(
      store$,
      actions$,
      translateService,
      titleService,
      loadingService,
      activatedRoute,
      countryService,
      router,
      utilsService,
      localStorageService,
      modalService,
      windowRefService,
      paginationConfig,
      routerService,
      platformId,
      changeDetectorRef,
      equipmentMarketplaceService,
      deviceService,
      offcanvasService
    );
  }

  ngOnInit(): void {
    this.username = this.activatedRoute.snapshot.paramMap.get("username");
    super.ngOnInit();
  }

  public refresh(
    filterModel?: MarketplaceFilterModel,
    options: MarketplaceRefreshOptions = {
      clear: true
    }
  ) {
    this.actions$
      .pipe(
        ofType(AuthActionTypes.LOAD_USER_SUCCESS),
        map((action: LoadUserSuccess) => action.payload.user),
        filter(user => user.username === this.username),
        take(1)
      )
      .subscribe(user => {
        this.user = user;

        if (!user) {
          this.windowRefService.routeTo404();
          return;
        }

        this._setTitle(user);
        this._setBreadcrumbs(user);

        // Call the base class refresh method with additional filter for user
        const userFilterModel = { ...filterModel, user: user.id };
        super.refresh(userFilterModel, options);
      });

    this.actions$
      .pipe(
        ofType(AuthActionTypes.LOAD_USER_FAILURE),
        map((action: LoadUserFailure) => action.payload.username),
        filter(username => username === this.username),
        take(1)
      )
      .subscribe(() => {
        this.windowRefService.routeTo404();
        this.loadingService.setLoading(false);
      });

    this.store$.dispatch(new LoadUser({ username: this.username }));
  }

  protected _getListingsFilterPredicate(
    currentUser: UserInterface | null
  ): (listing: MarketplaceListingInterface) => boolean {
    return listing => listing.lineItems.length > 0 && listing.user === this.user?.id;
  }

  protected _setTitle(user: UserInterface) {
    if (!user) {
      return;
    }

    this.title = this.translateService.instant("{{0}}'s marketplace listings", { 0: user.displayName });
    this.titleService.setTitle(this.title);
  }

  protected _setBreadcrumbs(user: UserInterface) {
    if (!user) {
      return;
    }

    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [
          {
            label: this.translateService.instant("Equipment"),
            link: "/equipment/explorer"
          },
          {
            label: this.translateService.instant("Marketplace"),
            link: "/equipment/marketplace"
          },
          {
            label: this.translateService.instant("User listings")
          },
          {
            label: user.displayName
          }
        ]
      })
    );
  }
}
