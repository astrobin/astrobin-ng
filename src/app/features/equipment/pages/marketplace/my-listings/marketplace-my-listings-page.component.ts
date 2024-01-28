import { Component, OnInit } from "@angular/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { LoadMarketplaceListings } from "@features/equipment/store/equipment.actions";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { TitleService } from "@shared/services/title/title.service";
import { LoadingService } from "@shared/services/loading.service";
import { selectMarketplaceListings } from "@features/equipment/store/equipment.selectors";
import { filter, map, take, takeUntil, tap } from "rxjs/operators";
import { concatLatestFrom } from "@ngrx/effects";
import { MarketplaceFilterModel } from "@features/equipment/components/marketplace-filter/marketplace-filter.component";

@Component({
  selector: "astrobin-marketplace-my-listings-page",
  templateUrl: "./marketplace-my-listings-page.component.html",
  styleUrls: [
    "./marketplace-my-listings-page.component.scss",
    "../listings/marketplace-listings-page.component.scss"
  ]
})
export class MarketplaceMyListingsPageComponent extends BaseComponentDirective implements OnInit {
  readonly title = this.translateService.instant("My listings");

  listings$ = this.store$.select(selectMarketplaceListings).pipe(
    takeUntil(this.destroyed$),
    filter(listings => !!listings),
    concatLatestFrom(() => this.currentUser$),
    map(([listings, user]) => listings.filter(listing => listing.user === user.id && listing.lineItems.length > 0)),
    tap(() => this.loadingService.setLoading(false))
  );

  page = 1;
  filterModel: MarketplaceFilterModel;

  constructor(
    public readonly store$: Store<State>,
    public readonly translateService: TranslateService,
    public readonly titleService: TitleService,
    public readonly loadingService: LoadingService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.titleService.setTitle(this.title);

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
            label: this.translateService.instant("My listings")
          }
        ]
      })
    );

    this.refresh();
  }

  public refresh(filterModel?: MarketplaceFilterModel) {
    this.loadingService.setLoading(true);
    this.filterModel = filterModel;
    this.currentUser$.pipe(take(1)).subscribe(user => {
      this.store$.dispatch(new LoadMarketplaceListings({
        options: {
          ...(filterModel || {}),
          page: this.page,
          user
        }
      }));
    });
  }
}
