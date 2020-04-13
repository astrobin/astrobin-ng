import { GroupGenerator } from "@lib/generators/group.generator";
import { UserInterface } from "@lib/interfaces/user.interface";

export class UserGenerator {
  static user(): UserInterface {
    return {
      id: 1,
      userProfile: 1,
      username: "Test",
      firstName: "Test",
      avatar: null,
      lastLogin: new Date("2010-01-01"),
      dateJoined: new Date("2010-01-01"),
      isSuperUser: false,
      isStaff: false,
      isActive: true,
      groups: [GroupGenerator.group()],
      userPermissions: []
    };
  }
}
