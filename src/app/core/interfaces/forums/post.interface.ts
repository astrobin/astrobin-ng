import type { TopicInterface } from "@core/interfaces/forums/topic.interface";
import type { UserInterface } from "@core/interfaces/user.interface";

export interface PostInterface {
  id: number;
  body: string;
  bodyHtml: string;
  bodyText: string;
  created: string;
  updated: string | null;
  userIp: string;
  onModeration: boolean;
  topic: TopicInterface["id"];
  user: UserInterface["id"];
}
