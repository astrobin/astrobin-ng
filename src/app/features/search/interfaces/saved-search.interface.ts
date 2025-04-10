import type { UserInterface } from "@core/interfaces/user.interface";

export interface SavedSearchInterface {
  id: number;
  user: UserInterface["id"];
  name: string;
  created: string;
  updated: string;
  params: string;
}
