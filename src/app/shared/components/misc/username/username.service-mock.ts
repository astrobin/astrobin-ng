import { Injectable } from "@angular/core";
import { UsernameServiceInterface } from "@shared/components/misc/username/username.service-interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseService } from "@shared/services/base.service";

@Injectable({
  providedIn: "root"
})
export class UsernameServiceMock extends BaseService implements UsernameServiceInterface {
  getDisplayName(user: UserInterface): string {
    return "astrobin_dev";
  }
}
