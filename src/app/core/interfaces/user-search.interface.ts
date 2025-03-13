export interface UserSearchInterface {
  username: string;
  displayName: string;
  avatarUrl: string;
  images: number;
  totalLikesReceived: number;
  followers: number;
  normalizedLikes: number;
  contributionIndex: number;
  integration?: number;
  topPickNominations?: number;
  topPicks?: number;
  iotds?: number;
  commentsWritten?: number;
  commentsReceived?: number;
  commentLikesReceived?: number;
  forumPosts?: number;
  forumPostLikesReceived?: number;
}
