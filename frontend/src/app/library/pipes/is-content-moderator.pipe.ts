import { Pipe, PipeTransform } from "@angular/core";
import { UserService } from "@lib/services/user.service";
import { UserInterface } from "@lib/interfaces/user.interface";

@Pipe({
  name: "isContentModerator",
})
export class IsContentModeratorPipe implements PipeTransform {
  constructor(public userService: UserService) {
  }

  transform(user: UserInterface, args?: any): any {
    return this.userService.isInGroup(user, "content_moderators");
  }
}
