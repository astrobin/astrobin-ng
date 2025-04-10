import type { AuthGroupInterface } from "@core/interfaces/auth-group.interface";
import type { GroupInterface } from "@core/interfaces/group.interface";
import type { PermissionInterface } from "@core/interfaces/permission.interface";
import type { UserProfileInterface } from "@core/interfaces/user-profile.interface";

export interface UserInterface {
  id: number;
  userProfile: UserProfileInterface["id"];
  username: string;
  firstName: string;
  displayName: string;
  avatarId: number;
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
