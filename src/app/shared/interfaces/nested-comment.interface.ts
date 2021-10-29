import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { UserInterface } from "@shared/interfaces/user.interface";

export interface NestedCommentInterface {
  id: number;
  contentType: ContentTypeInterface["id"];
  objectId: number;
  author: UserInterface["id"];
  authorAvatar: string;
  text: string;
  html: string;
  created: string;
  updated: string;
  parent: NestedCommentInterface["id"] | null;
  deleted: boolean;
  pendingModeration?: boolean;
  moderator?: UserInterface["id"] | null;
  likes?: UserInterface["id"][];
  depth: number;
}
