import { UserServiceInterface } from "@lib/services/user.service-interface";
import { UserInterface } from "@lib/interfaces/user.interface";

export class UserServiceMock implements UserServiceInterface {
  isInGroup(user: UserInterface, name: string): boolean {
    return name === "found";
  }
}
