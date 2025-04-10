import { ImageActions, ImageActionTypes } from "./image.actions";

export const imageFeatureKey = "image";

export interface ImageState {
  editor: {
    cropperShown: boolean;
  };
}

export const initialImageState: ImageState = {
  editor: {
    cropperShown: false
  }
};

export function imageReducer(state = initialImageState, action: ImageActions): ImageState {
  switch (action.type) {
    case ImageActionTypes.SET_CROPPER_SHOWN:
      const editor = {
        ...state.editor,
        cropperShown: action.payload
      };

      return { ...state, editor };

    default:
      return state;
  }
}
