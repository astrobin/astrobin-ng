import { MarketplaceFilterModel } from "@features/equipment/components/marketplace-filter/marketplace-filter.component";

export type MarketplaceListingQueryOptionsInterface = {
  page: number;
} & MarketplaceFilterModel;
