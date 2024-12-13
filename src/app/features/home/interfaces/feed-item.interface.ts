export enum FeedItemVerb {
  VERB_UPLOADED_IMAGE = "VERB_UPLOADED_IMAGE",
  VERB_UPLOADED_REVISION = "VERB_UPLOADED_REVISION",
  VERB_LIKED_IMAGE = "VERB_LIKED_IMAGE",
  VERB_BOOKMARKED_IMAGE = "VERB_BOOKMARKED_IMAGE",
  VERB_COMMENTED_IMAGE = "VERB_COMMENTED_IMAGE",
  VERB_CREATED_PUBLIC_GROUP = "VERB_CREATED_PUBLIC_GROUP",
  VERB_JOINED_GROUP = "VERB_JOINED_GROUP",
  VERB_CREATED_MARKETPLACE_LISTING = "VERB_CREATED_MARKETPLACE_LISTING"
}

export interface FeedItemInterface {
  id: number;

  // Actor fields
  actorObjectId: string;
  actorDisplayName: string;
  actorUsername: string;
  actorAvatar: string;
  actorContentTypeName: string;
  actorContentType: number;

  // Target fields
  targetObjectId: string;
  targetDisplayName: string;
  targetUserUsername: string;
  targetUserDisplayName: string;
  targetUserAvatar: string;
  targetContentType: number;

  // Action object fields
  actionObjectObjectId: string;
  actionObjectDisplayName: string;
  actionObjectUrl: string;
  actionObjectUserUsername: string;
  actionObjectUserDisplayName: string;
  actionObjectUserAvatar: string;
  actionObjectContentType: number;

  image: string;
  imageW: number;
  imageH: number;
  thumbnail: string;
  verb: FeedItemVerb,
  description: string;
  timestamp: string;
  public: boolean;
  othersCount: number;
  data?: any;
}
