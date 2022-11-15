/* eslint-disable max-classes-per-file */

import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { NestedCommentInterface } from "@shared/interfaces/nested-comment.interface";

export class LoadNestedComments implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_NESTED_COMMENTS;

  constructor(public payload: { contentTypeId: ContentTypeInterface["id"]; objectId: number }) {
  }
}

export class LoadNestedCommentsSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_NESTED_COMMENTS_SUCCESS;

  constructor(public payload: { nestedComments: NestedCommentInterface[] }) {
  }
}

export class CreateNestedComment implements PayloadActionInterface {
  readonly type = AppActionTypes.CREATE_NESTED_COMMENT;

  constructor(public payload: { nestedComment: Partial<NestedCommentInterface> }) {
  }
}

export class CreateNestedCommentSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.CREATE_NESTED_COMMENT_SUCCESS;

  constructor(public payload: { nestedComment: NestedCommentInterface }) {
  }
}

export class CreateNestedCommentFailure implements PayloadActionInterface {
  readonly type = AppActionTypes.CREATE_NESTED_COMMENT_FAILURE;

  constructor(public payload: { nestedComment: Partial<NestedCommentInterface> }) {
  }
}
