import type { OnInit } from "@angular/core";
import { Component, Input } from "@angular/core";
import type { Router } from "@angular/router";
import type { MainState } from "@app/store/state";
import type { CountryService } from "@core/services/country.service";
import type { EquipmentItemService } from "@core/services/equipment-item.service";
import type { EquipmentMarketplaceService } from "@core/services/equipment-marketplace.service";
import { selectMarketplaceListing } from "@features/equipment/store/equipment.selectors";
import type { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { MarketplaceListingType } from "@features/equipment/types/marketplace-listing.interface";
import { MarketplaceOfferStatus } from "@features/equipment/types/marketplace-offer-status.type";
import type { Store } from "@ngrx/store";
import type { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-marketplace-listing-card",
  templateUrl: "./marketplace-listing-card.component.html",
  styleUrls: ["./marketplace-listing-card.component.scss"]
})
export class MarketplaceListingCardComponent extends BaseComponentDirective implements OnInit {
  readonly MarketplaceListingType = MarketplaceListingType;

  @Input()
  listing: MarketplaceListingInterface;

  totalPrice: number;
  displayName: string;
  imageCount: number;
  hasUnassociatedItems: boolean;
  offersCount: number;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly equipmentMarketplaceService: EquipmentMarketplaceService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly countryService: CountryService,
    public readonly router: Router,
    public readonly translateService: TranslateService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.store$.select(selectMarketplaceListing, { id: this.listing.id }).subscribe(() => {
      this._buildDisplayName();
      this._buildImagesCount();
      this._buildTotalPrice();
      this._buildHasUnassociatedItems();
      this._buildOffersCount();
    });
  }

  _buildDisplayName() {
    if (this.listing.title) {
      this.displayName = this.listing.title;
    } else {
      this.displayName = this.listing.lineItems
        .map(lineItem => lineItem.itemName || lineItem.itemPlainText)
        .join(" / ");
    }
  }

  _buildImagesCount() {
    this.imageCount = this.listing.lineItems.reduce((acc, lineItem) => acc + lineItem.images.length, 0);
  }

  _buildTotalPrice() {
    const singleCurrency = this.listing.lineItems.every(
      lineItem => lineItem.currency === this.listing.lineItems[0].currency
    );
    if (singleCurrency) {
      this.totalPrice = this.listing.lineItems.reduce((acc, lineItem) => acc + +lineItem.price, 0);
    } else {
      this.totalPrice = null;
    }
  }

  _buildHasUnassociatedItems() {
    this.hasUnassociatedItems = this.listing.lineItems.some(lineItem => !lineItem.itemObjectId);
  }

  _buildOffersCount() {
    this.offersCount = this.listing.lineItems.reduce((acc, lineItem) => {
      return acc + lineItem.offers.filter(offer => offer.status === MarketplaceOfferStatus.PENDING).length;
    }, 0);
  }
}
