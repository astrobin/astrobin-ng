import { UserInterface } from "@lib/interfaces/user.interface";

export interface UserServiceInterface {
  isInGroup(user: UserInterface, name: string): boolean;
}
