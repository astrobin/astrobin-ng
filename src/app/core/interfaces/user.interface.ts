import { AuthGroupInterface } from "@core/interfaces/auth-group.interface";
import { PermissionInterface } from "@core/interfaces/permission.interface";
import { UserProfileInterface } from "@core/interfaces/user-profile.interface";
import { GroupInterface } from "@core/interfaces/group.interface";

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
  astrobinGroups: GroupInterface[];
  groups: AuthGroupInterface[];
  userPermissions: PermissionInterface[];
  marketplaceFeedback: number;
  marketplaceFeedbackCount: number;
  marketplaceListingCount: number;
  validSubscription: string | null;
}
