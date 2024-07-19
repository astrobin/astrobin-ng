import {
  MarketplaceListingInterface,
  MarketplaceListingType
} from "@features/equipment/types/marketplace-listing.interface";
import {
  MarketplaceLineItemInterface,
  MarketplaceListingCondition,
  MarketplaceShippingCostType
} from "@features/equipment/types/marketplace-line-item.interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import { UserGenerator } from "@shared/generators/user.generator";

export class MarketplaceGenerator {
  static listing(source: Partial<MarketplaceListingInterface> = {}): MarketplaceListingInterface {
    let lineItems: MarketplaceLineItemInterface[];
    let user: UserInterface["id"];

    if (source.lineItems) {
      lineItems = [...source.lineItems];
    } else {
      lineItems = [this.lineItem()];
    }

    if (source.user) {
      user = source.user;
    } else {
      user = UserGenerator.user().id;
    }

    return {
      id: source.id || 1,
      listingType: MarketplaceListingType.FOR_SALE,
      user,
      hash: source.hash || "abc123",
      created: source.created || "1970-01-01",
      updated: source.updated || "1970-01-01",
      expiration: source.expiration || "2070-01-01",
      description: source.description || "Test description",
      deliveryByBuyerPickUp: source.deliveryByBuyerPickUp || false,
      deliveryBySellerDelivery: source.deliveryBySellerDelivery || false,
      deliveryByShipping: source.deliveryByShipping || false,
      shippingMethod: source.shippingMethod || null,
      latitude: source.latitude || null,
      longitude: source.longitude || null,
      country: source.country || null,
      areaLevel1: source.areaLevel1 || null,
      city: source.city || null,
      lineItems,
      title: source.title || "Test title"
    };
  }

  static lineItem(source: Partial<MarketplaceLineItemInterface> = {}): MarketplaceLineItemInterface {
    return {
      id: source.id || 1,
      hash: source.hash || "abc123",
      user: source.user || 1,
      created: source.created || "1970-01-01",
      updated: source.updated || "1970-01-01",
      listing: source.listing || 1,
      sold: source.sold || null,
      soldTo: source.soldTo || null,
      reserved: source.reserved || null,
      reservedTo: source.reservedTo || null,
      price: source.price || 100,
      currency: source.currency || "USD",
      condition: source.condition || MarketplaceListingCondition.NEW,
      yearOfPurchase: source.yearOfPurchase || null,
      shippingCostType: source.shippingCostType || MarketplaceShippingCostType.FIXED,
      shippingCost: source.shippingCost || null,
      description: source.description || null,
      itemObjectId: source.itemObjectId || 1,
      itemContentType: source.itemContentType || 1,
      images: source.images || [],
      offers: source.offers || []
    };
  }
}
