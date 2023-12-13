import { Component, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { TitleService } from "@shared/services/title/title.service";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { take, tap } from "rxjs/operators";
import {
  CreateMarketplaceListing,
  CreateMarketplaceListingFailure,
  CreateMarketplaceListingSuccess,
  EquipmentActionTypes
} from "@features/equipment/store/equipment.actions";
import { Actions, ofType } from "@ngrx/effects";
import { LoadingService } from "@shared/services/loading.service";
import { Router } from "@angular/router";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";

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
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly translateService: TranslateService,
    public readonly titleService: TitleService,
    public readonly loadingService: LoadingService,
    public readonly router: Router,
    public readonly popNotificationsService: PopNotificationsService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.titleService.setTitle(this.title);
    this.store$.dispatch(this.breadcrumb);
  }

  onCreate(value) {
    this.loadingService.setLoading(true);

    this.actions$
      .pipe(
        ofType(
          EquipmentActionTypes.CREATE_MARKETPLACE_LISTING_SUCCESS,
          EquipmentActionTypes.CREATE_MARKETPLACE_LISTING_FAILURE
        ),
        take(1),
        tap((action: CreateMarketplaceListingSuccess | CreateMarketplaceListingFailure) => {
          if (action.type === EquipmentActionTypes.CREATE_MARKETPLACE_LISTING_SUCCESS) {
            this.router.navigateByUrl(`/equipment/marketplace/listing/${action.payload.listing.hash}`).then(() => {
              this.loadingService.setLoading(false);
            });
          } else {
            this.loadingService.setLoading(false);
          }
        })
      )
      .subscribe();

    this.store$.dispatch(new CreateMarketplaceListing({ listing: value }));
  }
}
