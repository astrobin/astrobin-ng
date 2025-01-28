import { Pipe, PipeTransform } from "@angular/core";
import { UserInterface } from "@core/interfaces/user.interface";
import { UserService } from "@core/services/user.service";
import { GroupInterface } from "@core/interfaces/group.interface";

@Pipe({
  name: "isInGroup"
})
export class IsInGroupPipe implements PipeTransform {
  constructor(public userService: UserService) {
  }

  transform(user: UserInterface, groupName: GroupInterface["name"]): boolean {
    return this.userService.isInGroup(user, groupName);
  }
}
