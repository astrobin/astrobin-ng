import { PollType } from "@shared/interfaces/forums/poll-type.enum";
import { ForumInterface } from "@shared/interfaces/forums/forum.interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { PostInterface } from "@shared/interfaces/forums/post.interface";

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
  forumName: ForumInterface["name"];
  user: UserInterface["id"];
  username: UserInterface["username"];
  userDisplayName: UserProfileInterface["realName"];
  read: boolean;
  lastPostUsername: UserInterface["username"];
  lastPostUserDisplayName: UserProfileInterface["realName"];
  lastPostTimestamp: string;
  lastPostId: number; // Avoid circular dependency
}
