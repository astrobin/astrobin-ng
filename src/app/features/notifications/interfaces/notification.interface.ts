export interface NotificationInterface {
  id: number;
  user: number;
  fromUser?: number;
  subject: string;
  message: string;
  level: number;
  extraTags: string;
  created: Date;
  modified: Date;
  read: boolean;
  expires?: Date;
  closeTimeout?: number;
}
