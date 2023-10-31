import { AuthGroupInterface } from "@shared/interfaces/auth-group.interface";
import { PermissionInterface } from "@shared/interfaces/permission.interface";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";

export interface UserInterface {
  id: number;
  userProfile: UserProfileInterface["id"];
  username: string;
  firstName: string;
  displayName: string;
  avatar: string;
  largeAvatar: string;
  lastLogin: string;
  dateJoined: string;
  isSuperUser: boolean;
  isStaff: boolean;
  isActive: boolean;
  groups: AuthGroupInterface[];
  userPermissions: PermissionInterface[];
}
