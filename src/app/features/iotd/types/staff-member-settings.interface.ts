import { UserInterface } from "@shared/interfaces/user.interface";

export enum QueueSortOrder {
  NEWEST_FIRST = "NEWEST_FIRST",
  OLDEST_FIRST = "OLDEST_FIRST"
}

export interface StaffMemberSettingsInterface {
  user: UserInterface["id"];
  queueSortOrder: QueueSortOrder;
}
