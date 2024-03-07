import { Component } from "@angular/core";
import { MarketplaceUserListingsBasePageComponent } from "@features/equipment/pages/marketplace/user-listings-base/marketplace-user-listings-base-page.component";

@Component({
  selector: "astrobin-marketplace-user-listings-page",
  templateUrl: "../listings-base/marketplace-listings-base-page.component.html",
  styleUrls: ["../listings-base/marketplace-listings-base-page.component.scss"]
})
export class MarketplaceUserListingsPageComponent extends MarketplaceUserListingsBasePageComponent {
}
