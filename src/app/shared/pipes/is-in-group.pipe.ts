import type { PipeTransform } from "@angular/core";
import { Pipe } from "@angular/core";
import type { GroupInterface } from "@core/interfaces/group.interface";
import type { UserInterface } from "@core/interfaces/user.interface";
import { UserService } from "@core/services/user.service";

@Pipe({
  name: "isInGroup"
})
export class IsInGroupPipe implements PipeTransform {
  constructor(public userService: UserService) {}

  transform(user: UserInterface, groupName: GroupInterface["name"]): boolean {
    return this.userService.isInGroup(user, groupName);
  }
}
