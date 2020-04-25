import { UserProfileInterface } from "@lib/interfaces/user-profile.interface";
import { UserInterface } from "@lib/interfaces/user.interface";

export interface UserStoreServiceInterface {
  addUser(user: UserInterface): void;

  addUserProfile(userProfile: UserProfileInterface): void;

  getUser(id: number): UserInterface;

  getUserProfile(id: number): UserProfileInterface;
}
