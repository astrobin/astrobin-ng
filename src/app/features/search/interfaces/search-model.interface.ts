import { EquipmentItemType, EquipmentItemUsageType } from "@features/equipment/types/equipment-item-base.interface";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { UserInterface } from "@shared/interfaces/user.interface";

export interface SearchModelInterface {
  text?: string;
  itemType?: EquipmentItemType;
  itemId?: EquipmentItem["id"];
  usageType?: EquipmentItemUsageType;
  ordering?: string;
  pageSize?: number;
  username?: UserInterface["username"];
  page?: number;
}
