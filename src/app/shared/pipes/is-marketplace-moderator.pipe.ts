import { Pipe, PipeTransform } from "@angular/core";
import { UserInterface } from "@core/interfaces/user.interface";
import { UserService } from "@core/services/user.service";
import { Constants } from "@shared/constants";

@Pipe({
  name: "isMarketplaceModerator"
})
export class IsMarketplaceModeratorPipe implements PipeTransform {
  constructor(public userService: UserService) {
  }

  transform(user: UserInterface, args?: any): any {
    return this.userService.isInGroup(user, Constants.MARKETPLACE_MODERATORS_GROUP);
  }
}
