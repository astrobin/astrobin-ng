import { Component } from "@angular/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import {
  MarketplaceFilterModel,
  MarketplaceRefreshOptions
} from "@features/equipment/components/marketplace-filter/marketplace-filter.component";
import { MarketplaceListingsBasePageComponent } from "@features/equipment/pages/marketplace/listings-base/marketplace-listings-base-page.component";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { UserInterface } from "@shared/interfaces/user.interface";

@Component({
  selector: "astrobin-marketplace-sold-listings-page",
  templateUrl: "../listings-base/marketplace-listings-base-page.component.html",
  styleUrls: ["../listings-base/marketplace-listings-base-page.component.scss"]
})
export class MarketplaceSoldListingsPageComponent extends MarketplaceListingsBasePageComponent {
  public refresh(
    filterModel?: MarketplaceFilterModel,
    options: MarketplaceRefreshOptions = {
      clear: true
    }
  ) {
    const modifiedFilterModel: MarketplaceFilterModel = {
      ...filterModel,
      sold: true
    };

    super.refresh(modifiedFilterModel, options);
  }

  protected _getListingsFilterPredicate(currentUser: UserInterface | null): (listing: MarketplaceListingInterface) => boolean {
    return listing => listing.lineItems.length > 0 && listing.lineItems.some(item => !!item.sold);
  }

  protected _setBreadcrumb() {
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
            label: this.translateService.instant("Sold listings")
          }
        ]
      })
    );
  }
}
