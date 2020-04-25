import { Injectable } from "@angular/core";
import { UsernameServiceInterface } from "@lib/components/misc/username/username.service-interface";
import { UserInterface } from "@lib/interfaces/user.interface";

@Injectable({
  providedIn: "root"
})
export class UsernameServiceMock implements UsernameServiceInterface {
  getDisplayName(user: UserInterface): string {
    return "astrobin_dev";
  }
}
