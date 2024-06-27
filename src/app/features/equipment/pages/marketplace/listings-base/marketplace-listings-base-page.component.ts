import { Component, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { TitleService } from "@shared/services/title/title.service";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { selectMarketplace, selectMarketplaceListings } from "@features/equipment/store/equipment.selectors";
import { map, take, takeUntil, tap } from "rxjs/operators";
import {
  ClearMarketplaceListings,
  EquipmentActionTypes,
  LoadMarketplaceListings
} from "@features/equipment/store/equipment.actions";
import { LoadingService } from "@shared/services/loading.service";
import {
  MarketplaceFilterModel,
  marketplaceFilterModelKeys
} from "@features/equipment/components/marketplace-filter/marketplace-filter.component";
import { ActivatedRoute, Router } from "@angular/router";
import { selectRequestCountry } from "@app/store/selectors/app/app.selectors";
import { CountryService } from "@shared/services/country.service";
import { Observable } from "rxjs";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import { Actions, concatLatestFrom, ofType } from "@ngrx/effects";
import { UtilsService } from "@shared/services/utils/utils.service";
import { LocalStorageService } from "@shared/services/localstorage.service";
import { NgbModal, NgbModalRef, NgbPaginationConfig } from "@ng-bootstrap/ng-bootstrap";
import { CountrySelectionModalComponent } from "@shared/components/misc/country-selection-modal/country-selection-modal.component";
import { WindowRefService } from "@shared/services/window-ref.service";
import { RouterService } from "@shared/services/router.service";

@Component({
  selector: "astrobin-marketplace-listings-base-page",
  template: ""
})
export abstract class MarketplaceListingsBasePageComponent extends BaseComponentDirective implements OnInit {
  readonly WORLDWIDE = "WORLDWIDE";
  readonly REGION_LOCAL_STORAGE_KEY = "marketplaceRegion";

  title = this.translateService.instant("Marketplace");
  page = 1;
  pageSize = this.paginationConfig.pageSize;
  filterModel: MarketplaceFilterModel | null = null;
  requestCountryCode: string | null;
  requestCountryLabel: string | null;
  selectedRegion: string | null;
  selectedRegionLabel: string | null;
  listings$: Observable<MarketplaceListingInterface[]>;
  lastPaginatedRequestCount$ = this.store$.select(
    selectMarketplace
  ).pipe(
    map(state => state.lastPaginatedRequestCount || 0)
  );

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly translateService: TranslateService,
    public readonly titleService: TitleService,
    public readonly loadingService: LoadingService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly countryService: CountryService,
    public readonly router: Router,
    public readonly utilsService: UtilsService,
    public readonly localStorageService: LocalStorageService,
    public readonly modalService: NgbModal,
    public readonly windowRefService: WindowRefService,
    public readonly paginationConfig: NgbPaginationConfig,
    public readonly routerService: RouterService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.selectedRegion = this.localStorageService.getItem(this.REGION_LOCAL_STORAGE_KEY);
    this.selectedRegionLabel = this.countryService.getCountryName(
      this.selectedRegion, this.translateService.currentLang
    );

    this._refreshOnQueryParamsChange();
    this._updateRequestCountry();
  }

  setRegion(event: Event, region: string, refresh = true) {
    if (event) {
      event.preventDefault();
    }

    if (region === null) {
      region = this.WORLDWIDE;
    }

    this.selectedRegion = region;
    this.selectedRegionLabel = this.countryService.getCountryName(region, this.translateService.currentLang);

    this.localStorageService.setItem(this.REGION_LOCAL_STORAGE_KEY, region);

    if (refresh) {
      this.refresh();
    }
  }

  startOtherCountrySelection(event: Event): void {
    if (event) {
      event.preventDefault();
    }

    const modal: NgbModalRef = this.modalService.open(CountrySelectionModalComponent);
    modal.closed.subscribe(country => {
      this.setRegion(null, country);
    });
  }

  onPageChange(page: number) {
    this.page = page;
    this.refresh(this.filterModel);
  }

  public refresh(filterModel?: MarketplaceFilterModel) {
    this.loadingService.setLoading(true);
    this.windowRefService.scroll({ top: 0 });

    this.filterModel = {
      ...this.filterModel,
      ...filterModel
    };

    if (this.selectedRegion) {
      this.filterModel.region = this.selectedRegion;
    } else {
      delete this.filterModel.region;
    }

    // Remove unwanted query params.
    const {
      sold,
      expired,
      user,
      offersByUser,
      soldToUser,
      followedByUser,
      pendingModeration,
      ...queryParams
    } = this.filterModel;

    // Remove query parameters that don't belong.
    for (const key of Object.keys(queryParams)) {
      // Check if key is not in MarketplaceFilterModel as an interface.
      if (!marketplaceFilterModelKeys.includes(key)) {
        delete queryParams[key];
        delete this.filterModel[key];
      }
    }

    this.routerService.updateQueryParams(queryParams);

    this.actions$.pipe(
      ofType(EquipmentActionTypes.LOAD_MARKETPLACE_LISTINGS_SUCCESS),
      take(1)
    ).subscribe(() => {
      this._initializeListingsStream();
    });

    this.utilsService.delay(1).subscribe(() => {
        this.store$.dispatch(new ClearMarketplaceListings());
        this.store$.dispatch(new LoadMarketplaceListings(
          {
            options: {
              ...(this.filterModel || {}),
              page: this.page
            }
          }));
      }
    );

    this._setTitle();
    this._setBreadcrumb();
    this.loadingService.setLoading(false);
  }

  protected abstract _getListingsFilterPredicate(currentUser: UserInterface | null): (listing: MarketplaceListingInterface) => boolean;

  protected _initializeListingsStream() {
    this.listings$ = this.store$.select(selectMarketplaceListings).pipe(
      concatLatestFrom(() => this.currentUser$),
      map(([listings, currentUser]) =>
        !!listings ? listings.filter(this._getListingsFilterPredicate(currentUser)) : null
      ),
      tap(() => {
        this.utilsService.delay(200).subscribe(() => {
          if (this.windowRefService.nativeWindow.innerWidth < 768) {
            this.windowRefService.scrollToElement(".marketplace-navigation");
          }

          this.loadingService.setLoading(false);
        });
      }),
      takeUntil(this.destroyed$)
    );
  }

  protected _setTitle(user?: UserInterface) {
    this.titleService.setTitle(this.title);
  }

  protected _setBreadcrumb(user?: UserInterface) {
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
            label: this.translateService.instant("Listings")
          }
        ]
      })
    );
  }

  private _refreshOnQueryParamsChange() {
    this.activatedRoute.queryParams.pipe(takeUntil(this.destroyed$)).subscribe(params => {
      if (params.region) {
        this.selectedRegion = params.region;
        this.selectedRegionLabel = this.countryService.getCountryName(params.region, this.translateService.currentLang);
      }

      if (params.page) {
        this.page = params.page;
      }

      this.refresh(params);
    });
  }

  private _updateRequestCountry() {
    this.store$.select(selectRequestCountry).pipe(
      takeUntil(this.destroyed$),
      map(requestCountry => {
          if (!requestCountry || requestCountry === "UNKNOWN") {
            requestCountry = "US";
          }

          this.requestCountryCode = requestCountry;
          this.requestCountryLabel = this.countryService.getCountryName(requestCountry, this.translateService.currentLang);

          if (!this.selectedRegion) {
            this.setRegion(null, requestCountry, false);
          }
        }
      )).subscribe();
  }
}
