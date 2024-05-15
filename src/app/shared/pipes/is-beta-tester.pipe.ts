import { Pipe, PipeTransform } from "@angular/core";
import { UserInterface } from "@shared/interfaces/user.interface";
import { UserService } from "@shared/services/user.service";
import { Constants } from "@shared/constants";

@Pipe({
  name: "isBetaTester"
})
export class IsBetaTesterPipe implements PipeTransform {
  constructor(public userService: UserService) {
  }

  transform(user: UserInterface, args?: any): any {
    return this.userService.isInAstroBinGroup(user, Constants.BETA_TESTERS_ASTROBIN_GROUP);
  }
}
