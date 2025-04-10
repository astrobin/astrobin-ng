import type { PipeTransform } from "@angular/core";
import { Pipe } from "@angular/core";
import type { UserInterface } from "@core/interfaces/user.interface";
import { UserService } from "@core/services/user.service";

@Pipe({
  name: "isContentModerator"
})
export class IsContentModeratorPipe implements PipeTransform {
  constructor(public userService: UserService) {}

  transform(user: UserInterface): boolean {
    return this.userService.isInGroup(user, "content_moderators");
  }
}
