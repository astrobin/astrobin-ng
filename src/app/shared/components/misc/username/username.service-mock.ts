import { Injectable } from "@angular/core";
import { UsernameServiceInterface } from "@shared/components/misc/username/username.service-interface";
import { UserInterface } from "@shared/interfaces/user.interface";

@Injectable({
  providedIn: "root"
})
export class UsernameServiceMock implements UsernameServiceInterface {
  getDisplayName(user: UserInterface): string {
    return "astrobin_dev";
  }
}
