import { UserInterface } from "@shared/interfaces/user.interface";

export interface SavedSearchInterface {
  id: number;
  user: UserInterface["id"];
  name: string;
  created: string;
  updated: string;
  params: string;
}
