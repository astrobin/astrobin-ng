import { UserProfileGenerator } from "@lib/generators/user-profile.generator";
import { UserGenerator } from "@lib/generators/user.generator";
import { UserProfileInterface } from "@lib/interfaces/user-profile.interface";
import { UserInterface } from "@lib/interfaces/user.interface";
import { UserStoreServiceInterface } from "@lib/services/user-store.service-interface";

export class UserStoreServiceMock implements UserStoreServiceInterface {
  addUser(user: UserInterface): void {}

  addUserProfile(userProfile: UserProfileInterface): void {}

  getUser(id: number): UserInterface {
    return UserGenerator.user();
  }

  getUserProfile(id: number): UserProfileInterface {
    return UserProfileGenerator.userProfile();
  }
}
