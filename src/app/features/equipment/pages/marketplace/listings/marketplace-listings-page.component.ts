import { Component, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { TitleService } from "@shared/services/title/title.service";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { selectMarketplaceListings } from "@features/equipment/store/equipment.selectors";
import { filter, map, takeUntil, tap } from "rxjs/operators";
import { LoadMarketplaceListings } from "@features/equipment/store/equipment.actions";
import { LoadingService } from "@shared/services/loading.service";
import { MarketplaceFilterModel } from "@features/equipment/components/marketplace-filter/marketplace-filter.component";
import { ActivatedRoute, Router } from "@angular/router";
import { selectRequestCountry } from "@app/store/selectors/app/app.selectors";
import { CountryService } from "@shared/services/country.service";

@Component({
  selector: "astrobin-marketplace-listings-page",
  templateUrl: "./marketplace-listings-page.component.html",
  styleUrls: ["./marketplace-listings-page.component.scss"]
})
export class MarketplaceListingsPageComponent extends BaseComponentDirective implements OnInit {
  readonly title = this.translateService.instant("Equipment marketplace");

  page = 1;
  filterModel: MarketplaceFilterModel | null = null;
  requestCountryCode: string | null;
  requestCountryLabel: string | null;
  selectedRegion: string | null;

  listings$ = this.store$.select(selectMarketplaceListings).pipe(
    takeUntil(this.destroyed$),
    filter(listings => !!listings),
    map(listings => listings.filter(listing => listing.lineItems.length > 0)),
    tap(() => this.loadingService.setLoading(false))
  );

  constructor(
    public readonly store$: Store<State>,
    public readonly translateService: TranslateService,
    public readonly titleService: TitleService,
    public readonly loadingService: LoadingService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly countryService: CountryService,
    public readonly router: Router
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this._setTitle();
    this._setBreadcrumb();
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

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.filterModel
    }).then(() => {
        this.store$.dispatch(new LoadMarketplaceListings(
          {
            options: {
              ...(this.filterModel || {}),
              page: this.page
            }
          }));
      }
    );
  }

  private _setTitle() {
    this.titleService.setTitle(this.title);
  }

  private _setBreadcrumb() {
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
          this.requestCountryCode = requestCountry;
          this.requestCountryLabel = this.countryService.getCountryName(requestCountry, this.translateService.currentLang);
        }
      )).subscribe();
  }
}
