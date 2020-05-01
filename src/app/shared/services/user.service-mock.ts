import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseService } from "@shared/services/base.service";
import { UserServiceInterface } from "@shared/services/user.service-interface";

export class UserServiceMock extends BaseService implements UserServiceInterface {
  isInGroup(user: UserInterface, name: string): boolean {
    return name === "found";
  }
}
