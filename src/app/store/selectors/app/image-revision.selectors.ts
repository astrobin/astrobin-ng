import { AppState } from "@app/store/reducers/app.reducers";
import { selectApp } from "@app/store/selectors/app/app.selectors";
import { createSelector } from "@ngrx/store";
import { ImageInterface, ImageRevisionInterface } from "@shared/interfaces/image.interface";

export const selectImageRevisions = createSelector(
  selectApp,
  (state: AppState): ImageRevisionInterface[] => state.imageRevisions
);

export const selectImageRevisionsForImage = createSelector(
  selectImageRevisions,
  (imageRevisions: ImageRevisionInterface[], imageId: ImageInterface["pk"]): ImageRevisionInterface[] => {
    if (!imageRevisions) {
      return [];
    }

    return imageRevisions.filter(imageRevision => imageRevision.image === +imageId);
  }
);
