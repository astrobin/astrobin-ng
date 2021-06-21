import { AppState } from "@app/store/reducers/app.reducers";
import { selectApp } from "@app/store/selectors/app/app.selectors";
import { createSelector } from "@ngrx/store";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { ImageThumbnailInterface } from "@shared/interfaces/image-thumbnail.interface";

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

export const selectLoadingThumbnails = createSelector(
  selectApp,
  (state: AppState): Omit<ImageThumbnailInterface, "url">[] => state.loadingThumbnails
);

export const selectLoadingThumbnail = createSelector(
  selectLoadingThumbnails,
  (
    thumbnails: Omit<ImageThumbnailInterface, "url">[],
    payload: Omit<ImageThumbnailInterface, "url">
  ): Omit<ImageThumbnailInterface, "url"> => {
    const matching = thumbnails.filter(
      thumbnail =>
        thumbnail.id === payload.id && thumbnail.revision === payload.revision && thumbnail.alias === payload.alias
    );
    return matching.length > 0 ? matching[0] : null;
  }
);
