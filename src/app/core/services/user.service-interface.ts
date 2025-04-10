import { UserInterface } from "@core/interfaces/user.interface";

export interface UserServiceInterface {
  isInGroup(user: UserInterface, name: string): boolean;
}
