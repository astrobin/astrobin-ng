import { Component } from "@angular/core";
import { UserInterface } from "@core/interfaces/user.interface";
import { MarketplaceListingsBasePageComponent } from "@features/equipment/pages/marketplace/listings-base/marketplace-listings-base-page.component";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";

@Component({
  selector: "astrobin-marketplace-listings-page",
  templateUrl: "../listings-base/marketplace-listings-base-page.component.html",
  styleUrls: ["../listings-base/marketplace-listings-base-page.component.scss"]
})
export class MarketplaceListingsPageComponent extends MarketplaceListingsBasePageComponent {
  protected _getListingsFilterPredicate(
    currentUser: UserInterface | null
  ): (listing: MarketplaceListingInterface) => boolean {
    return listing => listing.lineItems.length > 0;
  }
}
