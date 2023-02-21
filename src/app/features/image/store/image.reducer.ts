import { ImageActions, ImageActionTypes } from "./image.actions";
import { DeepSkyAcquisitionPresetInterface } from "@shared/interfaces/deep-sky-acquisition-preset.interface";
import { SolarSystemAcquisitionPresetInterface } from "@shared/interfaces/solar-system-acquisition-preset.interface";
import { UtilsService } from "@shared/services/utils/utils.service";

export const imageFeatureKey = "image";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ImageState {
  editor: {
    cropperShown: boolean;
    deepSkyAcquisitionPresets: DeepSkyAcquisitionPresetInterface[];
    solarSystemAcquisitionPresets: SolarSystemAcquisitionPresetInterface[];
  };
}

export const initialImageState: ImageState = {
  editor: {
    cropperShown: false,
    deepSkyAcquisitionPresets: [],
    solarSystemAcquisitionPresets: []
  }
};

export function reducer(state = initialImageState, action: ImageActions): ImageState {
  switch (action.type) {
    case ImageActionTypes.SET_CROPPER_SHOWN:
      const editor = {
        ...state.editor,
        cropperShown: action.payload
      };

      return { ...state, editor };

    case ImageActionTypes.FIND_DEEP_SKY_ACQUISITION_PRESETS_SUCCESS: {
      const editor = {
        ...state.editor,
        deepSkyAcquisitionPresets: UtilsService.arrayUniqueObjects([...state.editor.deepSkyAcquisitionPresets, ...action.payload.presets], "id")
      };

      return { ...state, editor };
    }

    case ImageActionTypes.CREATE_DEEP_SKY_ACQUISITION_PRESET_SUCCESS: {
      // case ImageActionTypes.CREATE_DEEP_SKY_ACQUISITION_PRESET_SUCCESS:
      // case ImageActionTypes.UPDATE_DEEP_SKY_ACQUISITION_PRESET_SUCCESS: {
      const editor = {
        ...state.editor,
        deepSkyAcquisitionPresets: UtilsService.arrayUniqueObjects([...state.editor.deepSkyAcquisitionPresets, ...action.payload.presetItems], "id")
      };

      return { ...state, editor };
    }

    case ImageActionTypes.DELETE_DEEP_SKY_ACQUISITION_PRESET_SUCCESS: {
      let editor;

      action.payload.presetItems.forEach(presetItem => {
        editor = {
          ...state.editor,
          deepSkyAcquisitionPresets: state.editor.deepSkyAcquisitionPresets.filter(preset => preset.id !== presetItem.id)
        };
      });

      return { ...state, editor };
    }

    case ImageActionTypes.FIND_SOLAR_SYSTEM_ACQUISITION_PRESETS_SUCCESS: {
      const editor = {
        ...state.editor,
        solarSystemAcquisitionPresets: UtilsService.arrayUniqueObjects([...state.editor.solarSystemAcquisitionPresets, ...action.payload.presetItems], "id")
      };

      return { ...state, editor };
    }

    case ImageActionTypes.CREATE_SOLAR_SYSTEM_ACQUISITION_PRESET_SUCCESS: {
      // case ImageActionTypes.CREATE_SOLAR_SYSTEM_ACQUISITION_PRESET_SUCCESS:
      // case ImageActionTypes.UPDATE_SOLAR_SYSTEM_ACQUISITION_PRESET_SUCCESS: {
      const editor = {
        ...state.editor,
        solarSystemAcquisitionPresets: UtilsService.arrayUniqueObjects([...state.editor.solarSystemAcquisitionPresets, ...action.payload.presetItems], "id")
      };

      return { ...state, editor };
    }

    case ImageActionTypes.DELETE_SOLAR_SYSTEM_ACQUISITION_PRESET_SUCCESS: {
      let editor;

      action.payload.presetItems.forEach(presetItem => {
        editor = {
          ...state.editor,
          solarSystemAcquisitionPresets: state.editor.solarSystemAcquisitionPresets.filter(preset => preset.id !== presetItem.id)
        };
      });

      return { ...state, editor };
    }

    default:
      return state;
  }
}
