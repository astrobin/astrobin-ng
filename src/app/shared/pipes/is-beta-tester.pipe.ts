import type { PipeTransform } from "@angular/core";
import { Pipe } from "@angular/core";
import type { UserInterface } from "@core/interfaces/user.interface";
import { UserService } from "@core/services/user.service";
import { Constants } from "@shared/constants";

@Pipe({
  name: "isBetaTester"
})
export class IsBetaTesterPipe implements PipeTransform {
  constructor(public userService: UserService) {}

  transform(user: UserInterface): boolean {
    return this.userService.isInAstroBinGroup(user, Constants.BETA_TESTERS_ASTROBIN_GROUP);
  }
}
