import type { PipeTransform } from "@angular/core";
import { Pipe } from "@angular/core";
import type { UserInterface } from "@core/interfaces/user.interface";

@Pipe({
  name: "isSuperUser"
})
export class IsSuperUserPipe implements PipeTransform {
  transform(user: UserInterface): boolean {
    return user.isSuperUser;
  }
}
