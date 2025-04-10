import type { ContentTypeInterface } from "@core/interfaces/content-type.interface";
import type { UserInterface } from "@core/interfaces/user.interface";

export interface NestedCommentInterface {
  id: number;
  contentType: ContentTypeInterface["id"];
  objectId: number;
  author: UserInterface["id"];
  authorUsername: string;
  authorDisplayName: string;
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
  detectedLanguage: string | null;
}
