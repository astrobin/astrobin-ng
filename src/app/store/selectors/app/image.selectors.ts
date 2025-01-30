import { AppState } from "@app/store/reducers/app.reducers";
import { selectApp } from "@app/store/selectors/app/app.selectors";
import { createSelector } from "@ngrx/store";
import { ImageInterface } from "@core/interfaces/image.interface";
import { UtilsService } from "@core/services/utils/utils.service";

export const selectImages = createSelector(selectApp, (state: AppState): ImageInterface[] => state.images);

export const selectImage = createSelector(
  selectImages,
  (images: ImageInterface[], id: ImageInterface["hash"] | ImageInterface["pk"]): ImageInterface => {
    const matching = images.filter(
      image => (
        (UtilsService.isNumeric(id.toString()) && image.pk === +id) ||
        (!UtilsService.isNumeric(id.toString()) && image.hash === id)
      )
    );
    return matching.length > 0 ? matching[0] : null;
  }
);
