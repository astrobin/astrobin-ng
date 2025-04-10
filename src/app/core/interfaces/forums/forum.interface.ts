import { CategoryInterface } from "@core/interfaces/forums/category.interface";
import { UserInterface } from "@core/interfaces/user.interface";

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
