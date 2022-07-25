import { PollType } from "@shared/interfaces/forums/poll-type.enum";
import { ForumInterface } from "@shared/interfaces/forums/forum.interface";
import { UserInterface } from "@shared/interfaces/user.interface";

export interface TopicInterface {
  id: number;
  name: string;
  created: string;
  updated: string | null;
  views: number;
  sticky: boolean;
  closed: boolean;
  postCount: number;
  onModeration: boolean;
  pollType: PollType;
  pollQuestion: string | null;
  slug: string;
  forum: ForumInterface["id"];
  user: UserInterface["id"];
  subscribers: UserInterface["id"][];
  readedBy: UserInterface["id"][];
}
