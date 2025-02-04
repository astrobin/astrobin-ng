export enum NotificationContext {
  SUBSCRIPTIONS = "subscriptions",
  API = "api",
  AUTHENTICATION = "authentication",
  USER = "user",
  GROUPS = "groups",
  FORUM = "forum",
  MARKETPLACE = "marketplace",
  IOTD = "iotd",
  EQUIPMENT = "equipment",
  IMAGE = "image"
}

export interface NotificationInterface {
  id: number;
  user: number;
  fromUser?: number;
  subject: string;
  message: string;
  level: number;
  extraTags: string;
  created: string;
  modified: string;
  read: boolean;
  expires?: string;
  closeTimeout?: number;
}
