import { Component, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { TitleService } from "@shared/services/title/title.service";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { selectMarketplaceListings } from "@features/equipment/store/equipment.selectors";
import { map, take, takeUntil, tap } from "rxjs/operators";
import { EquipmentActionTypes, LoadMarketplaceListings } from "@features/equipment/store/equipment.actions";
import { LoadingService } from "@shared/services/loading.service";
import { MarketplaceFilterModel } from "@features/equipment/components/marketplace-filter/marketplace-filter.component";
import { ActivatedRoute, Router } from "@angular/router";
import { selectRequestCountry } from "@app/store/selectors/app/app.selectors";
import { CountryService } from "@shared/services/country.service";
import { Observable } from "rxjs";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import { Actions, concatLatestFrom, ofType } from "@ngrx/effects";
import { UtilsService } from "@shared/services/utils/utils.service";

@Component({
  selector: "astrobin-marketplace-listings-base-page",
  template: ""
})
export abstract class MarketplaceListingsBasePageComponent extends BaseComponentDirective implements OnInit {
  title = this.translateService.instant("Equipment marketplace");
  page = 1;
  filterModel: MarketplaceFilterModel | null = null;
  requestCountryCode: string | null;
  requestCountryLabel: string | null;
  selectedRegion: string | null;
  listings$: Observable<MarketplaceListingInterface[]>;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly translateService: TranslateService,
    public readonly titleService: TitleService,
    public readonly loadingService: LoadingService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly countryService: CountryService,
    public readonly router: Router,
    public readonly utilsService: UtilsService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this._refreshOnQueryParamsChange();
    this._updateRequestCountry();
  }

  setRegion(region: string) {
    this.selectedRegion = region;
    this.refresh();
  }

  public refresh(filterModel?: MarketplaceFilterModel) {
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
    const { sold, expired, user, offersByUser, soldToUser, followedByUser, ...queryParams } = this.filterModel;

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams
    }).then(() => {
      this.actions$.pipe(
        ofType(EquipmentActionTypes.LOAD_MARKETPLACE_LISTINGS_SUCCESS),
        take(1)
      ).subscribe(() => {
        this._initializeListingsStream();
      });

      this.utilsService.delay(1).subscribe(() => {
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
    });
  }

  protected abstract _getListingsFilterPredicate(currentUser: UserInterface | null): (listing: MarketplaceListingInterface) => boolean;

  protected _initializeListingsStream() {
    this.listings$ = this.store$.select(selectMarketplaceListings).pipe(
      concatLatestFrom(() => this.currentUser$),
      map(([listings, currentUser]) => !!listings ? listings.filter(this._getListingsFilterPredicate(currentUser)) : []),
      tap(() => this.loadingService.setLoading(false)),
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
            label: this.translateService.instant("Marketplace")
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
        }
      )).subscribe();
  }
}
