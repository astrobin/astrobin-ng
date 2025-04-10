import type { PipeTransform } from "@angular/core";
import { Pipe } from "@angular/core";
import type { UserInterface } from "@core/interfaces/user.interface";
import type { UserService } from "@core/services/user.service";

@Pipe({
  name: "isIotdJudge"
})
export class IsIotdJudgePipe implements PipeTransform {
  constructor(public userService: UserService) {}

  transform(user: UserInterface, args?: any): any {
    return this.userService.isInGroup(user, "iotd_judges");
  }
}
