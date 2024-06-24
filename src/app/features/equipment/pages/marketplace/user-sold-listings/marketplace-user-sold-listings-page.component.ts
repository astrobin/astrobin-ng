import { Component } from "@angular/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { MarketplaceFilterModel } from "@features/equipment/components/marketplace-filter/marketplace-filter.component";
import { UserInterface } from "@shared/interfaces/user.interface";
import { MarketplaceUserListingsBasePageComponent } from "@features/equipment/pages/marketplace/user-listings-base/marketplace-user-listings-base-page.component";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";

@Component({
  selector: "astrobin-marketplace-user-sold-listings-page",
  templateUrl: "../listings-base/marketplace-listings-base-page.component.html",
  styleUrls: ["../listings-base/marketplace-listings-base-page.component.scss"]
})
export class MarketplaceUserSoldListingsPageComponent extends MarketplaceUserListingsBasePageComponent {
  public refresh(filterModel?: MarketplaceFilterModel) {
    const modifiedFilterModel = {
      ...filterModel,
      sold: true
    };

    super.refresh(modifiedFilterModel);
  }

  protected _getListingsFilterPredicate(currentUser: UserInterface | null): (listing: MarketplaceListingInterface) => boolean {
    return listing => (
      listing.lineItems.length > 0 &&
      listing.user === this.user.id &&
      listing.lineItems.some(lineItem => !!lineItem.sold)
    );
  }

  protected _setTitle(user: UserInterface) {
    if (!user) {
      return;
    }

    this.title = this.translateService.instant("{{0}}'s sold marketplace listings", { 0: user.displayName });
    this.titleService.setTitle(this.title);
  }

  protected _setBreadcrumbs(user: UserInterface) {
    if (!user) {
      return;
    }

    this.store$.dispatch(
      new SetBreadcrumb({
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
            label: this.translateService.instant("My interactions")
          },
          {
            label: this.translateService.instant("User listings (sold)")
          },
          {
            label: user.displayName
          }
        ]
      })
    );
  }
}
