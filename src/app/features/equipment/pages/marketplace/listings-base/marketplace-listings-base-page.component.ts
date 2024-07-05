import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild
} from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { TitleService } from "@shared/services/title/title.service";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { selectMarketplace, selectMarketplaceListings } from "@features/equipment/store/equipment.selectors";
import { debounceTime, filter, map, take, takeUntil, tap, withLatestFrom } from "rxjs/operators";
import {
  ClearMarketplaceListings,
  EquipmentActionTypes,
  LoadMarketplaceListings
} from "@features/equipment/store/equipment.actions";
import { LoadingService } from "@shared/services/loading.service";
import {
  MarketplaceFilterModel,
  marketplaceFilterModelKeys,
  MarketplaceRefreshOptions
} from "@features/equipment/components/marketplace-filter/marketplace-filter.component";
import { ActivatedRoute, Router } from "@angular/router";
import { selectRequestCountry } from "@app/store/selectors/app/app.selectors";
import { CountryService } from "@shared/services/country.service";
import { fromEvent, Observable } from "rxjs";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import { Actions, concatLatestFrom, ofType } from "@ngrx/effects";
import { UtilsService } from "@shared/services/utils/utils.service";
import { LocalStorageService } from "@shared/services/localstorage.service";
import { NgbModal, NgbModalRef, NgbPaginationConfig, NgbTooltip } from "@ng-bootstrap/ng-bootstrap";
import { CountrySelectionModalComponent } from "@shared/components/misc/country-selection-modal/country-selection-modal.component";
import { WindowRefService } from "@shared/services/window-ref.service";
import { RouterService } from "@shared/services/router.service";
import { isPlatformBrowser, isPlatformServer } from "@angular/common";
import { EquipmentMarketplaceService } from "@features/equipment/services/equipment-marketplace.service";

@Component({
  selector: "astrobin-marketplace-listings-base-page",
  template: ""
})
export abstract class MarketplaceListingsBasePageComponent
  extends BaseComponentDirective
  implements OnInit, AfterViewInit {
  readonly WORLDWIDE = "WORLDWIDE";
  readonly REGION_LOCAL_STORAGE_KEY = "marketplaceRegion";
  readonly UtilsService = UtilsService;

  title = this.translateService.instant("Marketplace");
  page = 1;
  pageSize = 20;
  filterModel: MarketplaceFilterModel | null = null;
  requestCountryCode: string | null;
  requestCountryLabel: string | null;
  requestContinent: string | null;
  selectedRegion: string | null;
  selectedRegionLabel: string | null;
  listings$: Observable<MarketplaceListingInterface[]>;
  lastPaginatedRequestCount: number;
  selectRegionTooltipText: string;

  @ViewChild("listingCards", { static: false, read: ElementRef })
  listingCards: ElementRef;

  @ViewChild("selectRegionTooltip")
  selectRegionTooltip: NgbTooltip;

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
    public readonly routerService: RouterService,
    @Inject(PLATFORM_ID) public readonly platformId: object,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly equipmentMarketplaceService: EquipmentMarketplaceService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    if (isPlatformBrowser(this.platformId)) {
      this.selectedRegion = this.localStorageService.getItem(this.REGION_LOCAL_STORAGE_KEY);
      if (this.selectedRegion && this.selectedRegion !== this.WORLDWIDE) {
        this.selectedRegionLabel = this.countryService.getCountryName(
          this.selectedRegion,
          this.translateService.currentLang
        );

        if (this.selectedRegionLabel === undefined) {
          this.selectedRegionLabel = this.selectedRegion;
        }
      }

      this._refreshOnQueryParamsChange();
    }
  }

  ngAfterViewInit() {
    this.checkAndSetupScrollEvent();
    this._updateRequestCountry();
  }

  checkAndSetupScrollEvent() {
    if (this.listingCards) {
      this.setupScrollEvent(this.listingCards);
    } else {
      setTimeout(() => this.checkAndSetupScrollEvent(), 50);
    }
  }

  setupScrollEvent(element: ElementRef) {
    if (isPlatformBrowser(this.platformId)) {
      this.store$
        .select(selectMarketplace)
        .pipe(map(state => state.lastPaginatedRequestCount || 0))
        .subscribe(lastPaginatedRequestCount => {
          this.lastPaginatedRequestCount = lastPaginatedRequestCount;
        });

      fromEvent(this.windowRefService.nativeWindow, "scroll")
        .pipe(
          debounceTime(50),
          withLatestFrom(this.loadingService.loading$),
          map(([event, isLoading]) => {
            const elementBottom = element.nativeElement.getBoundingClientRect().bottom;
            const windowHeight = window.innerHeight;
            return {
              nearBottom: (elementBottom - windowHeight < 900),
              isLoading: isLoading
            };
          }),
          filter(({ nearBottom, isLoading }) => nearBottom && !isLoading),
          takeUntil(this.destroyed$)
        )
        .subscribe(() => {
          if (this.page * this.pageSize < this.lastPaginatedRequestCount) {
            this.loadNextPage();
          }
        });
    }
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

    if (this.selectedRegionLabel === undefined) {
      this.selectedRegionLabel = this.selectedRegion;
    }

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

  loadNextPage() {
    this.page++;
    this.refresh(this.filterModel, { clear: false });
  }

  refresh(
    filterModel?: MarketplaceFilterModel,
    options: MarketplaceRefreshOptions = {
      clear: true
    }
  ) {
    if (isPlatformServer(this.platformId)) {
      // Don't fetch this data on the server, as it can depend on the user's location.
      return;
    }

    this.loadingService.setLoading(true);

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
    const { sold, expired, user, offersByUser, soldToUser, followedByUser, pendingModeration, ...queryParams } =
      this.filterModel;

    // Remove query parameters that don't belong.
    for (const key of Object.keys(queryParams)) {
      if (
        !marketplaceFilterModelKeys.includes(key) ||
        this.filterModel[key] === null ||
        this.filterModel[key] === "null" ||
        this.filterModel[key] === undefined ||
        this.filterModel[key] === "undefined"
      ) {
        delete queryParams[key];
        delete this.filterModel[key];
      }
    }

    this.routerService.updateQueryParams(queryParams);

    this.actions$.pipe(ofType(EquipmentActionTypes.LOAD_MARKETPLACE_LISTINGS_SUCCESS), take(1)).subscribe(() => {
      this._initializeListingsStream();
    });

    this.utilsService.delay(1).subscribe(() => {
      if (options.clear) {
        this.store$.dispatch(new ClearMarketplaceListings());
        this.windowRefService.scroll({ top: 0 });
        this.page = 1;
      }
      this.store$.dispatch(
        new LoadMarketplaceListings({
          options: {
            ...(this.filterModel || {}),
            page: this.page
          }
        })
      );
    });

    this._setTitle();
    this._setBreadcrumb();
    this.loadingService.setLoading(false);
  }

  protected abstract _getListingsFilterPredicate(
    currentUser: UserInterface | null
  ): (listing: MarketplaceListingInterface) => boolean;

  protected _initializeListingsStream() {
    this.listings$ = this.store$.select(selectMarketplaceListings).pipe(
      concatLatestFrom(() => this.currentUser$),
      map(([listings, currentUser]) =>
        !!listings ? listings.filter(this._getListingsFilterPredicate(currentUser)) : null
      ),
      tap(() => {
        this.utilsService.delay(200).subscribe(() => {
          if (this.page === 1 && this.windowRefService.nativeWindow.innerWidth < 768) {
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
        if (this.localStorageService.getItem(this.REGION_LOCAL_STORAGE_KEY) !== params.region) {
          this._openSelectRegionTooltip(
            this.translateService.instant(
              "AstroBin selected your region. You can change it at any time."
            )
          );
        }

        this.selectedRegion = params.region;
        this.selectedRegionLabel = this.countryService.getCountryName(params.region, this.translateService.currentLang);
        if (this.selectedRegionLabel === undefined) {
          this.selectedRegionLabel = this.selectedRegion;
        }
      }

      if (params.page) {
        this.page = params.page;
      }

      this.refresh(params);
    });
  }

  private _updateRequestCountry() {
    this.store$
      .select(selectRequestCountry)
      .pipe(
        takeUntil(this.destroyed$),
        map(requestCountry => {
          if (!requestCountry || requestCountry === "UNKNOWN") {
            requestCountry = "US";
          }

          this.requestCountryCode = requestCountry;
          this.requestCountryLabel = this.countryService.getCountryName(
            requestCountry,
            this.translateService.currentLang
          );

          this.countryService.getCountryContinent(requestCountry).subscribe(continent => {
            this.requestContinent = continent;
          });

          if (!this.selectedRegion) {
            if (UtilsService.isEUCountry(requestCountry)) {
              this.setRegion(null, "EU", false);
            } else {
              this.setRegion(null, requestCountry, false);
            }

            this._openSelectRegionTooltip(
              this.translateService.instant(
                "AstroBin automatically selects the region based on your location. You can change it at any time."
              )
            );
          }
        })
      )
      .subscribe();
  }

  private _openSelectRegionTooltip(text: string) {
    if (this.equipmentMarketplaceService.selectRegionTooltipAlreadyShown) {
      return;
    }

    this.selectRegionTooltipText = text;
    this.changeDetectorRef.detectChanges();

    this.utilsService.delay(500).subscribe(() => {
      if (this.selectRegionTooltip) {
        this.selectRegionTooltip.close();
        this.selectRegionTooltip.open();
        this.equipmentMarketplaceService.selectRegionTooltipAlreadyShown = true;
      }
    });
  }
}
