import { PipeTransform, Pipe } from "@angular/core";
import { UserInterface } from "@core/interfaces/user.interface";

@Pipe({
  name: "isSuperUser"
})
export class IsSuperUserPipe implements PipeTransform {
  transform(user: UserInterface, args?: any): any {
    return user.isSuperUser;
  }
}
