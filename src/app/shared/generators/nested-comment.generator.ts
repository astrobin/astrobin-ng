import { NestedCommentInterface } from "@shared/interfaces/nested-comment.interface";

export class NestedCommentGenerator {
  static nestedComment(source: Partial<NestedCommentInterface> = {}): NestedCommentInterface {
    return {
      id: source.id || 1,
      contentType: source.contentType || 1,
      objectId: source.objectId || 1,
      author: source.author || null,
      authorAvatar: source.authorAvatar || null,
      text: source.text || "Test comment",
      html: source.html || "Test comment",
      created: source.created || "1970-01-01",
      updated: source.updated || "1970-01-01",
      parent: source.parent || null,
      deleted: source.deleted || false,
      pendingModeration: source.pendingModeration || false,
      moderator: source.moderator || null,
      likes: source.likes || [],
      depth: source.depth || 1
    };
  }
}
