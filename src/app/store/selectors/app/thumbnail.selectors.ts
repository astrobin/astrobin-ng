import { AppState } from "@app/store/reducers/app.reducers";
import { selectApp } from "@app/store/selectors/app/app.selectors";
import { ImageThumbnailInterface } from "@core/interfaces/image-thumbnail.interface";
import { createSelector } from "@ngrx/store";

export const selectThumbnails = createSelector(
  selectApp,
  (state: AppState): ImageThumbnailInterface[] => state.thumbnails
);

export const selectThumbnail = createSelector(
  selectThumbnails,
  (thumbnails: ImageThumbnailInterface[], payload: Omit<ImageThumbnailInterface, "url">): ImageThumbnailInterface => {
    const matching = thumbnails.filter(
      thumbnail =>
        thumbnail.id === payload.id && thumbnail.revision === payload.revision && thumbnail.alias === payload.alias
    );
    return matching.length > 0 ? matching[0] : null;
  }
);
