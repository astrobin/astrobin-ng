import { Injectable } from "@angular/core";
import { UserInterface } from "@lib/interfaces/user.interface";
import { GroupInterface } from "@lib/interfaces/group.interface";
import { UserServiceInterface } from "@lib/services/user.service-interface";

@Injectable({
  providedIn: "root",
})
export class UserService implements UserServiceInterface {
  isInGroup(user: UserInterface, name: string): boolean {
    if (!user || !user.groups) {
      return false;
    }
    return user.groups.filter((group: GroupInterface) => group.name === name).length > 0;
  }
}
