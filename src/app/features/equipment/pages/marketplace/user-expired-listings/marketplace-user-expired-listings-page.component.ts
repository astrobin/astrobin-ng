import { Component } from "@angular/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import type { UserInterface } from "@core/interfaces/user.interface";
import type {
  MarketplaceFilterModel,
  MarketplaceRefreshOptions
} from "@features/equipment/components/marketplace-filter/marketplace-filter.component";
import { MarketplaceUserListingsBasePageComponent } from "@features/equipment/pages/marketplace/user-listings-base/marketplace-user-listings-base-page.component";
import type { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";

@Component({
  selector: "astrobin-marketplace-user-expired-listings-page",
  templateUrl: "../listings-base/marketplace-listings-base-page.component.html",
  styleUrls: ["../listings-base/marketplace-listings-base-page.component.scss"]
})
export class MarketplaceUserExpiredListingsPageComponent extends MarketplaceUserListingsBasePageComponent {
  public refresh(
    filterModel?: MarketplaceFilterModel,
    options: MarketplaceRefreshOptions = {
      clear: true
    }
  ) {
    const modifiedFilterModel: MarketplaceFilterModel = {
      ...filterModel,
      expired: true
    };

    super.refresh(modifiedFilterModel, options);
  }

  protected _getListingsFilterPredicate(
    currentUser: UserInterface | null
  ): (listing: MarketplaceListingInterface) => boolean {
    return listing =>
      listing.lineItems.length > 0 && listing.user === this.user.id && new Date(listing.expiration + "Z") < new Date();
  }

  protected _setTitle(user: UserInterface) {
    this.title = this.translateService.instant("My expired listings");
    this.titleService.setTitle(this.title);
  }

  protected _setBreadcrumbs(user: UserInterface) {
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
            label: this.translateService.instant("My expired listings")
          }
        ]
      })
    );
  }
}
