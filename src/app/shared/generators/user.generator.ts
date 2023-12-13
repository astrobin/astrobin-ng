import { AuthGroupGenerator } from "@shared/generators/auth-group.generator";
import { UserInterface } from "@shared/interfaces/user.interface";

export class UserGenerator {
  static user(): UserInterface {
    return {
      id: 1,
      userProfile: 1,
      username: "Test",
      firstName: "Test",
      displayName: "Test",
      avatar: null,
      largeAvatar: null,
      lastLogin: "2010-01-01",
      dateJoined: "2010-01-01",
      isSuperUser: false,
      isStaff: false,
      isActive: true,
      groups: [AuthGroupGenerator.group()],
      userPermissions: [],
      marketplaceAccuracyFeedback: null,
      marketplaceCommunicationFeedback: null,
      marketplacePackagingFeedback: null,
      marketplaceSpeedFeedback: null,
      marketplaceFeedbackCount: 0
    };
  }
}
