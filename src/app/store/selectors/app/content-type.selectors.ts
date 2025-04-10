import type { AppState } from "@app/store/reducers/app.reducers";
import { selectApp } from "@app/store/selectors/app/app.selectors";
import type { ContentTypeInterface } from "@core/interfaces/content-type.interface";
import { createSelector } from "@ngrx/store";

export const selectContentTypes = createSelector(
  selectApp,
  (state: AppState): ContentTypeInterface[] => state.contentTypes
);

export const selectContentType = createSelector(
  selectContentTypes,
  (contentTypes: ContentTypeInterface[], data: { appLabel: string; model: string }): ContentTypeInterface => {
    const matching = contentTypes.filter(
      contentType => !!contentType && contentType.appLabel === data.appLabel && contentType.model === data.model
    );
    return matching.length > 0 ? matching[0] : null;
  }
);

export const selectContentTypeById = createSelector(
  selectContentTypes,
  (contentTypes: ContentTypeInterface[], data: { id: ContentTypeInterface["id"] }): ContentTypeInterface => {
    const matching = contentTypes.filter(contentType => !!contentType && contentType.id === data.id);
    return matching.length > 0 ? matching[0] : null;
  }
);
