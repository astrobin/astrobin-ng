import type { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import type {
  EquipmentBrandListingInterface,
  EquipmentItemListingInterface
} from "@features/equipment/types/equipment-listings.interface";
import type { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";

export interface SearchPaginatedApiResultInterface<T> extends PaginatedApiResultInterface<T> {
  marketplaceLineItems?: MarketplaceLineItemInterface[];
  equipmentItemListings?: EquipmentItemListingInterface[];
  equipmentBrandListings?: EquipmentBrandListingInterface[];
  allowFullRetailerIntegration?: boolean;
}
