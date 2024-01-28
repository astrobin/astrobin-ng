import { UserInterface } from "@shared/interfaces/user.interface";
import { MarketplaceFilterModel } from "@features/equipment/components/marketplace-filter/marketplace-filter.component";

export type MarketplaceListingQueryOptionsInterface = {
  page: number;
  user?: UserInterface | null;
} & MarketplaceFilterModel;
