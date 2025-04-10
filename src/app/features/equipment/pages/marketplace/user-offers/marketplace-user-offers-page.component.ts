import { OnInit, Component } from "@angular/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { UserInterface } from "@core/interfaces/user.interface";
import {
  MarketplaceFilterModel,
  MarketplaceRefreshOptions
} from "@features/equipment/components/marketplace-filter/marketplace-filter.component";
import { MarketplaceListingsBasePageComponent } from "@features/equipment/pages/marketplace/listings-base/marketplace-listings-base-page.component";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-marketplace-my-offers-page",
  templateUrl: "../listings-base/marketplace-listings-base-page.component.html",
  styleUrls: ["../listings-base/marketplace-listings-base-page.component.scss"]
})
export class MarketplaceUserOffersPageComponent extends MarketplaceListingsBasePageComponent implements OnInit {
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
        offersByUser: currentUser.id
      };

      super.refresh(modifiedFilterModel, options);
    });
  }

  protected _setTitle(user: UserInterface) {
    this.title = this.translateService.instant("Offers");
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
            label: this.translateService.instant("Marketplace"),
            link: "/equipment/marketplace"
          },
          {
            label: this.translateService.instant("My interactions")
          },
          {
            label: this.translateService.instant("Offers")
          }
        ]
      })
    );
  }

  protected _getListingsFilterPredicate(
    currentUser: UserInterface | null
  ): (listing: MarketplaceListingInterface) => boolean {
    return listing => listing.lineItems.some(lineItem => lineItem.offers.some(offer => offer.user === currentUser?.id));
  }
}
