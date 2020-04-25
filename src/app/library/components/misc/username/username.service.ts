import { Injectable } from "@angular/core";
import { UsernameServiceInterface } from "@lib/components/misc/username/username.service-interface";
import { UserInterface } from "@lib/interfaces/user.interface";
import { UserStoreService } from "@lib/services/user-store.service";

@Injectable()
export class UsernameService implements UsernameServiceInterface {
  constructor(public userStore: UserStoreService) {}

  getDisplayName(user: UserInterface): string {
    if (!user) {
      return "";
    }

    const userProfile = this.userStore.getUserProfile(user.userProfile);

    if (userProfile && userProfile.realName) {
      return userProfile.realName;
    }

    return user.username;
  }
}
