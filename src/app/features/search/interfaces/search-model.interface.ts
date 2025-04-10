import type { UserInterface } from "@core/interfaces/user.interface";
import type {
  EquipmentItemType,
  EquipmentItemUsageType
} from "@features/equipment/types/equipment-item-base.interface";
import type { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import type { MatchType } from "@features/search/enums/match-type.enum";

export enum SearchType {
  IMAGE = "image",
  FORUM = "forums",
  COMMENTS = "comments",
  USERS = "users"
}

export interface SearchModelInterface {
  pageSize?: number;
  page?: number;

  searchType?: SearchType;
  ordering?: string;

  // Model fields.
  text?: {
    value: string;
    matchType?: MatchType;
    onlySearchInTitlesAndDescriptions?: boolean;
  };
  itemType?: EquipmentItemType;
  itemId?: EquipmentItem["id"];
  usageType?: EquipmentItemUsageType;
  username?: UserInterface["username"];
  subject?: string;
  telescope?: string | number;

  // Search fields.
  [key: string]: any;
}
