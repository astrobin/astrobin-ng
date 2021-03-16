import { createFeatureSelector } from "@ngrx/store";
import * as fromImage from "./image.reducer";

export const selectImageState = createFeatureSelector<fromImage.ImageState>(fromImage.imageFeatureKey);
