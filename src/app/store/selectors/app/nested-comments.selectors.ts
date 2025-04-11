import { AppState } from "@app/store/reducers/app.reducers";
import { selectApp } from "@app/store/selectors/app/app.selectors";
import { ContentTypeInterface } from "@core/interfaces/content-type.interface";
import { NestedCommentInterface } from "@core/interfaces/nested-comment.interface";
import { createSelector } from "@ngrx/store";

export const selectNestedComments = createSelector(
  selectApp,
  (state: AppState): NestedCommentInterface[] => state.nestedComments
);

export const selectNestedCommentsByContentTypeIdAndObjectId = (
  contentTypeId: ContentTypeInterface["id"],
  objectId: number
) =>
  createSelector(selectNestedComments, nestedComments => {
    if (nestedComments === null || nestedComments === undefined) {
      return null;
    }

    return nestedComments.filter(
      nestedComment => nestedComment.contentType === contentTypeId && nestedComment.objectId === objectId
    );
  });

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
