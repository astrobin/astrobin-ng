import { UserInterface } from "@core/interfaces/user.interface";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";

export interface MarketplacePrivateConversationInterface {
  id?: number;
  created?: string;
  listing?: MarketplaceListingInterface["id"];
  user?: UserInterface["id"];
  userDisplayName?: string;
  userLastAccessed?: string;
  listingUserLastAccessed?: string;
  totalMessages?: number;
  unreadMessages?: number;
  lastMessageTimestamp?: string;
}
