import type { PipeTransform } from "@angular/core";
import { Pipe } from "@angular/core";
import type { UserInterface } from "@core/interfaces/user.interface";
import { UserService } from "@core/services/user.service";

@Pipe({
  name: "isIotdReviewer"
})
export class IsIotdReviewerPipe implements PipeTransform {
  constructor(public userService: UserService) {}

  transform(user: UserInterface): boolean {
    return this.userService.isInGroup(user, "iotd_reviewers");
  }
}
