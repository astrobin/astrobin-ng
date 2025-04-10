import type { OnInit } from "@angular/core";
import { Component } from "@angular/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import type {
  MarketplaceFilterModel,
  MarketplaceRefreshOptions
} from "@features/equipment/components/marketplace-filter/marketplace-filter.component";
import { MarketplaceListingsBasePageComponent } from "@features/equipment/pages/marketplace/listings-base/marketplace-listings-base-page.component";
import type { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-marketplace-followed-listings-page",
  templateUrl: "../listings-base/marketplace-listings-base-page.component.html",
  styleUrls: ["../listings-base/marketplace-listings-base-page.component.scss"]
})
export class MarketplaceUserFollowedListingsPageComponent
  extends MarketplaceListingsBasePageComponent
  implements OnInit
{
  public refresh(
    filterModel?: MarketplaceFilterModel,
    options: MarketplaceRefreshOptions = {
      clear: true
    }
  ) {
    this.currentUser$.pipe(takeUntil(this.destroyed$)).subscribe(currentUser => {
      if (!currentUser) {
        return;
      }

      const modifiedFilterModel = {
        ...filterModel,
        followedByUser: currentUser.id
      };

      super.refresh(modifiedFilterModel, options);
    });
  }

  protected _setTitle() {
    this.title = this.translateService.instant("Listings you follow");
    this.titleService.setTitle(this.title);
  }

  protected _setBreadcrumbs() {
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
            label: this.translateService.instant("Listings you follow")
          }
        ]
      })
    );
  }

  protected _getListingsFilterPredicate(): (listing: MarketplaceListingInterface) => boolean {
    return listing => listing.followed;
  }
}
