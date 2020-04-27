import { UserInterface } from "@shared/interfaces/user.interface";
import { UserServiceInterface } from "@shared/services/user.service-interface";

export class UserServiceMock implements UserServiceInterface {
  isInGroup(user: UserInterface, name: string): boolean {
    return name === "found";
  }
}
