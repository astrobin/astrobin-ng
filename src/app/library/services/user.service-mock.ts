import { UserInterface } from "@lib/interfaces/user.interface";
import { UserServiceInterface } from "@lib/services/user.service-interface";

export class UserServiceMock implements UserServiceInterface {
  isInGroup(user: UserInterface, name: string): boolean {
    return name === "found";
  }
}
