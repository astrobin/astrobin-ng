import { createFeatureSelector, createSelector } from "@ngrx/store";
import * as fromImage from "./image.reducer";

export const selectImageState = createFeatureSelector<fromImage.ImageState>(fromImage.imageFeatureKey);

export const selectImageEditorState = createSelector(selectImageState, state => state.editor);

export const selectDeepSkyAcquisitionPresets = createSelector(
  selectImageEditorState,
  state => state.deepSkyAcquisitionPresets
);

export const selectSolarSystemAcquisitionPresets = createSelector(
  selectImageEditorState,
  state => state.solarSystemAcquisitionPresets
);
