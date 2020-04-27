import { Injectable } from "@angular/core";
import { GroupInterface } from "@shared/interfaces/group.interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import { UserServiceInterface } from "@shared/services/user.service-interface";

@Injectable({
  providedIn: "root"
})
export class UserService implements UserServiceInterface {
  isInGroup(user: UserInterface, name: string): boolean {
    if (!user || !user.groups) {
      return false;
    }
    return user.groups.filter((group: GroupInterface) => group.name === name).length > 0;
  }
}
