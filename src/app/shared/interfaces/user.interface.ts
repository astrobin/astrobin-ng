import { AuthGroupInterface } from "@shared/interfaces/auth-group.interface";
import { PermissionInterface } from "@shared/interfaces/permission.interface";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";

export interface UserInterface {
  id: number;
  userProfile: UserProfileInterface["id"];
  username: string;
  firstName: string;
  avatar: string;
  largeAvatar: string;
  lastLogin: Date;
  dateJoined: Date;
  isSuperUser: boolean;
  isStaff: boolean;
  isActive: boolean;
  groups: AuthGroupInterface[];
  userPermissions: PermissionInterface[];
}
