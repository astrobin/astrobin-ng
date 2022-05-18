import { UserInterface } from "@shared/interfaces/user.interface";

export interface GearUserInfoInterface {
  id: number;
  alias: string | null;
  comment: string | null;
  modded: boolean;
  gear: number;
  user: UserInterface["id"];
}
