import { AuthGroupGenerator } from "@shared/generators/auth-group.generator";
import { UserInterface } from "@shared/interfaces/user.interface";

export class UserGenerator {
  static user(source: Partial<UserInterface> = {}): UserInterface {
    let groups;

    if (!!source.groups) {
      groups = source.groups;
    } else {
      groups = [AuthGroupGenerator.group()];
    }

    return {
      id: source.id || 1,
      userProfile: source.userProfile || 1,
      username: source.username || "Test",
      firstName: source.firstName || "Test",
      displayName: source.displayName || "Test",
      avatar: source.avatar || null,
      largeAvatar: source.largeAvatar || null,
      lastLogin: source.lastLogin || "2010-01-01",
      dateJoined: source.dateJoined || "2010-01-01",
      isSuperUser: source.isSuperUser || false,
      isStaff: source.isStaff || false,
      isActive: source.isActive || true,
      groups,
      userPermissions: source.userPermissions || [],
      marketplaceAccuracyFeedback: source.marketplaceAccuracyFeedback || null,
      marketplaceCommunicationFeedback: source.marketplaceCommunicationFeedback || null,
      marketplacePackagingFeedback: source.marketplacePackagingFeedback || null,
      marketplaceSpeedFeedback: source.marketplaceSpeedFeedback || null,
      marketplaceFeedbackCount: source.marketplaceFeedbackCount || 0,
    };
  }
}
