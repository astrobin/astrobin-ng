/* eslint-disable max-classes-per-file */

import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { ContentTypeInterface } from "@core/interfaces/content-type.interface";
import { NestedCommentInterface } from "@core/interfaces/nested-comment.interface";

export class LoadNestedComments implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_NESTED_COMMENTS;

  constructor(public payload: { contentTypeId: ContentTypeInterface["id"]; objectId: number }) {
  }
}

export class LoadNestedCommentsSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_NESTED_COMMENTS_SUCCESS;

  constructor(public payload: {
    contentTypeId: ContentTypeInterface["id"];
    objectId: number;
    nestedComments: NestedCommentInterface[]
  }) {
  }
}

export class LoadNestedComment implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_NESTED_COMMENT;

  constructor(public payload: { id: NestedCommentInterface["id"] }) {
  }
}

export class LoadNestedCommentSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_NESTED_COMMENT_SUCCESS;

  constructor(public payload: { nestedComment: NestedCommentInterface }) {
  }
}

export class LoadNestedCommentFailure implements PayloadActionInterface {
  readonly type = AppActionTypes.LOAD_NESTED_COMMENT_FAILURE;

  constructor(public payload: { id: NestedCommentInterface["id"] }) {
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

export class UpdateNestedComment implements PayloadActionInterface {
  readonly type = AppActionTypes.UPDATE_NESTED_COMMENT;

  constructor(public payload: { nestedComment: NestedCommentInterface }) {
  }
}

export class UpdateNestedCommentSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.UPDATE_NESTED_COMMENT_SUCCESS;

  constructor(public payload: { nestedComment: NestedCommentInterface }) {
  }
}

export class UpdateNestedCommentFailure implements PayloadActionInterface {
  readonly type = AppActionTypes.UPDATE_NESTED_COMMENT_FAILURE;

  constructor(public payload: { nestedComment: NestedCommentInterface }) {
  }
}

export class ApproveNestedComment implements PayloadActionInterface {
  readonly type = AppActionTypes.APPROVE_NESTED_COMMENT;

  constructor(public payload: { id: NestedCommentInterface["id"] }) {
  }
}

export class ApproveNestedCommentSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.APPROVE_NESTED_COMMENT_SUCCESS;

  constructor(public payload: { nestedComment: NestedCommentInterface }) {
  }
}

export class ApproveNestedCommentFailure implements PayloadActionInterface {
  readonly type = AppActionTypes.APPROVE_NESTED_COMMENT_FAILURE;

  constructor(public payload: { id: NestedCommentInterface["id"], error: any }) {
  }
}

export class DeleteNestedComment implements PayloadActionInterface {
  readonly type = AppActionTypes.DELETE_NESTED_COMMENT;

  constructor(public payload: { id: NestedCommentInterface["id"] }) {
  }
}

export class DeleteNestedCommentSuccess implements PayloadActionInterface {
  readonly type = AppActionTypes.DELETE_NESTED_COMMENT_SUCCESS;

  constructor(public payload: { id: NestedCommentInterface["id"] }) {
  }
}

export class DeleteNestedCommentFailure implements PayloadActionInterface {
  readonly type = AppActionTypes.DELETE_NESTED_COMMENT_FAILURE;

  constructor(public payload: { id: NestedCommentInterface["id"], error: any }) {
  }
}
