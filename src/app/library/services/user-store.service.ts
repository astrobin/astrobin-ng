import { Injectable } from "@angular/core";
import { UserProfileInterface } from "@lib/interfaces/user-profile.interface";
import { UserInterface } from "@lib/interfaces/user.interface";
import { UserStoreServiceInterface } from "@lib/services/user-store.service-interface";

@Injectable({
  providedIn: "root"
})
export class UserStoreService implements UserStoreServiceInterface {
  private _users: { [key: number]: UserInterface } = {};
  private _userProfiles: { [key: number]: UserProfileInterface } = {};

  addUser(user: UserInterface): void {
    this._users[user.id] = user;
  }

  addUserProfile(userProfile: UserProfileInterface): void {
    this._userProfiles[userProfile.id] = userProfile;
  }

  getUser(id: number): UserInterface {
    return this._users[id];
  }

  getUserProfile(id: number): UserProfileInterface {
    return this._userProfiles[id];
  }
}
