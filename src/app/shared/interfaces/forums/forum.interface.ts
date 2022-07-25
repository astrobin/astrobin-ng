import { UserInterface } from "@shared/interfaces/user.interface";
import { CategoryInterface } from "@shared/interfaces/forums/category.interface";

export interface ForumInterface {
  id: number;
  name: string;
  position: number;
  description: string;
  updated: string;
  postCount: number;
  topicCount: 10;
  headline: string | null;
  slug: string;
  category: CategoryInterface["id"];
  parent: ForumInterface["id"] | null;
  moderators: UserInterface["id"][];
  readedBy: UserInterface["id"][];
}
