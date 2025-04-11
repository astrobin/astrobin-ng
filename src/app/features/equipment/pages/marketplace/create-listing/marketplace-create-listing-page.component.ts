import { OnInit, Component } from "@angular/core";
import { Router } from "@angular/router";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { MainState } from "@app/store/state";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { LoadingService } from "@core/services/loading.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { RouterService } from "@core/services/router.service";
import { TitleService } from "@core/services/title/title.service";
import { UserSubscriptionService } from "@core/services/user-subscription/user-subscription.service";
import {
  MARKETPLACE_SALE_TYPE,
  MarketplaceListingFormInitialCountInterface
} from "@features/equipment/components/marketplace-listing-form/marketplace-listing-form.component";
import {
  CreateMarketplaceListing,
  EquipmentActionTypes,
  CreateMarketplaceListingFailure,
  CreateMarketplaceListingSuccess
} from "@features/equipment/store/equipment.actions";
import { MarketplaceShippingCostType } from "@features/equipment/types/marketplace-line-item.interface";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { ofType, Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { take, tap } from "rxjs/operators";

@Component({
  selector: "astrobin-marketplace-create-listing-page",
  templateUrl: "./marketplace-create-listing.page.component.html",
  styleUrls: ["./marketplace-create-listing.page.component.scss"]
})
export class MarketplaceCreateListingPageComponent extends BaseComponentDirective implements OnInit {
  readonly title = this.translateService.instant("Create listing");
  readonly breadcrumb = new SetBreadcrumb({
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
        label: this.translateService.instant("Create listing")
      }
    ]
  });

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly translateService: TranslateService,
    public readonly titleService: TitleService,
    public readonly loadingService: LoadingService,
    public readonly router: Router,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly routerService: RouterService,
    public readonly classicRoutesService: ClassicRoutesService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.titleService.setTitle(this.title);
    this.store$.dispatch(this.breadcrumb);

    this.userSubscriptionService.canCreateMarketplaceListing$().subscribe(canCreateMarketplaceListing => {
      if (!canCreateMarketplaceListing) {
        this.routerService.redirectToUrl(this.classicRoutesService.PRICING);
      }
    });
  }

  onCreate(value: MarketplaceListingInterface & MarketplaceListingFormInitialCountInterface) {
    let listings: MarketplaceListingInterface[];
    let listingsProcessed = 0;

    if (value.saleType === MARKETPLACE_SALE_TYPE.MULTIPLE_SEPARATELY && value.count > 1) {
      // Create multiple listings, each one gets one of the line items, and all other data is the same.
      listings = Array.from({ length: value.count }, (_, i) => ({
        ...value,
        shippingMethod:
          value.lineItems[i].shippingCostType !== MarketplaceShippingCostType.NO_SHIPPING ? value.shippingMethod : null,
        deliveryByShipping:
          value.lineItems[i].shippingCostType !== MarketplaceShippingCostType.NO_SHIPPING
            ? value.deliveryByShipping
            : false,
        lineItems: [value.lineItems[i]]
      }));
    } else {
      listings = [value];
    }

    this.actions$
      .pipe(
        ofType(
          EquipmentActionTypes.CREATE_MARKETPLACE_LISTING_SUCCESS,
          EquipmentActionTypes.CREATE_MARKETPLACE_LISTING_FAILURE
        ),
        take(listings.length),
        tap((action: CreateMarketplaceListingSuccess | CreateMarketplaceListingFailure) => {
          listingsProcessed++;

          if (action.type === EquipmentActionTypes.CREATE_MARKETPLACE_LISTING_SUCCESS) {
            if (listings.length === 1) {
              void this.router
                .navigateByUrl(`/equipment/marketplace/listing/${action.payload.listing.hash}`)
                .then(() => {
                  this.loadingService.setLoading(false);
                });
            } else {
              if (listingsProcessed === listings.length) {
                this.currentUser$.pipe(take(1)).subscribe(user => {
                  void this.router.navigateByUrl(`/equipment/marketplace/users/${user.username}/listings`).then(() => {
                    this.popNotificationsService.success(
                      this.translateService.instant("All listings have been created.")
                    );
                    this.loadingService.setLoading(false);
                  });
                });
              }
            }
          } else {
            this.loadingService.setLoading(false);
          }
        })
      )
      .subscribe();

    this.loadingService.setLoading(true);

    for (const listing of listings) {
      this.store$.dispatch(new CreateMarketplaceListing({ listing }));
    }
  }
}
