import { GroupInterface, GroupCategory } from "@core/interfaces/group.interface";

export class AstroBinGroupGenerator {
  static group(): GroupInterface {
    return {
      id: 1,
      dateCreated: "2010-01-01",
      dateUpdated: "2010-01-01",
      creator: 1,
      owner: 1,
      name: "Test group",
      category: GroupCategory.OTHER,
      public: true,
      moderated: false,
      autosubmission: false,
      moderators: [],
      invitedUsers: [],
      joinRequests: [],
      images: [],
      forum: 1,
      members: [1]
    };
  }
}
