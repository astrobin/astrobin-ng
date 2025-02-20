export enum NotificationContext {
  IMAGE = "image",
  USER = "user",
  FORUM = "forum",
  MARKETPLACE = "marketplace",
  GROUPS = "groups",
  IOTD = "iotd",
  EQUIPMENT = "equipment",
  SUBSCRIPTIONS = "subscriptions",
  AUTHENTICATION = "authentication",
  API = "api"
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
