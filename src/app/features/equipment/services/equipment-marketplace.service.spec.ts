import { TestBed } from "@angular/core/testing";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { EquipmentMarketplaceService } from "@features/equipment/services/equipment-marketplace.service";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { MarketplaceGenerator } from "@features/equipment/generators/marketplace.generator";

describe("EquipmentMarketplaceService", () => {
  let service: EquipmentMarketplaceService;

  beforeEach(async () => {
    await MockBuilder(EquipmentMarketplaceService, AppModule);
    service = TestBed.inject(EquipmentMarketplaceService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("compareLineItems", () => {
    let mockListing: MarketplaceListingInterface;
    let mockLineItem: MarketplaceLineItemInterface;

    beforeEach(() => {
      mockListing = MarketplaceGenerator.listing();
      mockLineItem = MarketplaceGenerator.lineItem();
    });

    it("should identify added/preserved line items", () => {
      const previousListing: MarketplaceListingInterface = { ...mockListing, lineItems: [mockLineItem] };
      const newLineItem: MarketplaceLineItemInterface = MarketplaceGenerator.lineItem({ id: 2 });
      const updatedListing: MarketplaceListingInterface = { ...mockListing, lineItems: [mockLineItem, newLineItem] };

      const [preserved, added, removed] = service.compareLineItems(updatedListing, previousListing);

      expect(preserved).toEqual([mockLineItem]);
      expect(added).toEqual([newLineItem]);
      expect(removed).toEqual([]);
    });

    it("should identify removed line items", () => {
      const previousListing: MarketplaceListingInterface = { ...mockListing, lineItems: [mockLineItem] };
      const updatedListing: MarketplaceListingInterface = { ...mockListing, lineItems: [] };

      const [preserved, added, removed] = service.compareLineItems(updatedListing, previousListing);

      expect(preserved).toEqual([]);
      expect(added).toEqual([]);
      expect(removed).toEqual([mockLineItem]);
    });

    it("should handle empty line items in both listings", () => {
      const previousListing: MarketplaceListingInterface = { ...mockListing, lineItems: [] };
      const updatedListing: MarketplaceListingInterface = { ...mockListing, lineItems: [] };

      const [preserved, added, removed] = service.compareLineItems(updatedListing, previousListing);

      expect(preserved).toEqual([]);
      expect(added).toEqual([]);
      expect(removed).toEqual([]);
    });

    it("should handle null or undefined line items", () => {
      const previousListing: MarketplaceListingInterface = { ...mockListing, lineItems: undefined };
      const updatedListing: MarketplaceListingInterface = { ...mockListing, lineItems: null };

      const [preserved, added, removed] = service.compareLineItems(updatedListing, previousListing);

      expect(preserved).toEqual([]);
      expect(added).toEqual([]);
      expect(removed).toEqual([]);
    });

    it("should identify no changes for identical listings", () => {
      const listing: MarketplaceListingInterface = { ...mockListing, lineItems: [mockLineItem] };

      const [preserved, added, removed] = service.compareLineItems(listing, listing);

      expect(preserved).toEqual([mockLineItem]);
      expect(added).toEqual([]);
      expect(removed).toEqual([]);
    });

    it("should handle new line items without IDs", () => {
      const previousListing: MarketplaceListingInterface = { ...mockListing, lineItems: [mockLineItem] };
      const newLineItem: MarketplaceLineItemInterface = { ...MarketplaceGenerator.lineItem(), id: undefined }; // No ID
      const updatedListing: MarketplaceListingInterface = { ...mockListing, lineItems: [mockLineItem, newLineItem] };

      const [preserved, added, removed] = service.compareLineItems(updatedListing, previousListing);

      expect(preserved).toEqual([mockLineItem]);
      expect(added).toContainEqual(newLineItem);
      expect(removed).toEqual([]);
    });
  });
});
