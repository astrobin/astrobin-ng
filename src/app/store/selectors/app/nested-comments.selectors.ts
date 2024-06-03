import { AppState } from "@app/store/reducers/app.reducers";
import { selectApp } from "@app/store/selectors/app/app.selectors";
import { createSelector } from "@ngrx/store";
import { NestedCommentInterface } from "@shared/interfaces/nested-comment.interface";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";

export const selectNestedComments = createSelector(
  selectApp,
  (state: AppState): NestedCommentInterface[] => state.nestedComments
);

export const selectNestedCommentsByContentTypeIdAndObjectId = createSelector(
  selectNestedComments,
  (
    nestedComments: NestedCommentInterface[],
    data: { contentTypeId: ContentTypeInterface["id"]; objectId: number }
  ): NestedCommentInterface[] | null => {
    if (nestedComments === null || nestedComments === undefined) {
      return null;
    }

    return nestedComments.filter(
      nestedComment => nestedComment.contentType === data.contentTypeId && nestedComment.objectId === data.objectId
    );
  }
);

export const selectNestedCommentById = createSelector(
  selectNestedComments,
  (nestedComments: NestedCommentInterface[], id: NestedCommentInterface["id"]): NestedCommentInterface | null => {
    if (nestedComments === null || nestedComments === undefined) {
      return null;
    }

    const matching = nestedComments.filter(nestedComment => nestedComment.id === id);

    if (matching && matching.length > 0) {
      return matching[0];
    }

    return null;
  }
);
