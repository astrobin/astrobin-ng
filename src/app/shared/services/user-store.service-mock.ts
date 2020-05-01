import { UserProfileGenerator } from "@shared/generators/user-profile.generator";
import { UserGenerator } from "@shared/generators/user.generator";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseService } from "@shared/services/base.service";
import { UserStoreServiceInterface } from "@shared/services/user-store.service-interface";

export class UserStoreServiceMock extends BaseService implements UserStoreServiceInterface {
  addUser(user: UserInterface): void {}

  addUserProfile(userProfile: UserProfileInterface): void {}

  getUser(id: number): UserInterface {
    return UserGenerator.user();
  }

  getUserProfile(id: number): UserProfileInterface {
    return UserProfileGenerator.userProfile();
  }
}
