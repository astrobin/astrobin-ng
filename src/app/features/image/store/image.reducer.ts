import { ImageActions } from "./image.actions";

export const imageFeatureKey = "image";

// tslint:disable-next-line:no-empty-interface
export interface ImageState {}

export const initialImageState: ImageState = {};

export function reducer(state = initialImageState, action: ImageActions): ImageState {
  return state;
}
