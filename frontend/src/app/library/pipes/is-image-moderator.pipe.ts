import { Pipe, PipeTransform } from "@angular/core";
import { UserInterface } from "@lib/interfaces/user.interface";
import { UserService } from "@lib/services/user.service";

@Pipe({
  name: "isImageModerator",
})
export class IsImageModeratorPipe implements PipeTransform {
  constructor(public userService: UserService) {
  }

  transform(user: UserInterface, args?: any): any {
    return this.userService.isInGroup(user, "image_moderators");
  }
}
