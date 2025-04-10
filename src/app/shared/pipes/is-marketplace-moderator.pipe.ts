import type { PipeTransform } from "@angular/core";
import { Pipe } from "@angular/core";
import type { UserInterface } from "@core/interfaces/user.interface";
import { UserService } from "@core/services/user.service";
import { Constants } from "@shared/constants";

@Pipe({
  name: "isMarketplaceModerator"
})
export class IsMarketplaceModeratorPipe implements PipeTransform {
  constructor(public userService: UserService) {}

  transform(user: UserInterface): boolean {
    return this.userService.isInGroup(user, Constants.MARKETPLACE_MODERATORS_GROUP);
  }
}
