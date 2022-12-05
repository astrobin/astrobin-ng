import { Pipe, PipeTransform } from "@angular/core";
import { UserInterface } from "@shared/interfaces/user.interface";
import { UserService } from "@shared/services/user.service";
import { GroupInterface } from "@shared/interfaces/group.interface";

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
