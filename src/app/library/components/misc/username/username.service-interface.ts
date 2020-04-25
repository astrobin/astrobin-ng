import { UserInterface } from "@lib/interfaces/user.interface";

export interface UsernameServiceInterface {
  getDisplayName(user: UserInterface): string;
}
