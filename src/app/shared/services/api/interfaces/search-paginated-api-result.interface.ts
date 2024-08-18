import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { EquipmentBrandListingInterface, EquipmentItemListingInterface } from "@features/equipment/types/equipment-listings.interface";

export interface SearchPaginatedApiResultInterface<T> extends PaginatedApiResultInterface<T> {
  equipmentItemListings?: EquipmentItemListingInterface[];
  equipmentBrandListings?: EquipmentBrandListingInterface[];
  allowFullRetailerIntegration?: boolean;
}
