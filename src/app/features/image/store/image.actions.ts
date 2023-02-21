/* eslint-disable max-classes-per-file */

import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import { Action } from "@ngrx/store";
import { DeepSkyAcquisitionPresetInterface } from "@shared/interfaces/deep-sky-acquisition-preset.interface";
import { SolarSystemAcquisitionPresetInterface } from "@shared/interfaces/solar-system-acquisition-preset.interface";

export enum ImageActionTypes {
  SET_CROPPER_SHOWN = "[Image] Set cropper shown",

  // Deep sky acquisition presets

  FIND_DEEP_SKY_ACQUISITION_PRESETS = "[Image] Find deep sky acquisition presets",
  FIND_DEEP_SKY_ACQUISITION_PRESETS_SUCCESS = "[Image] Find deep sky acquisition presets success",
  CREATE_DEEP_SKY_ACQUISITION_PRESET = "[Image] Create deep sky acquisition preset",
  CREATE_DEEP_SKY_ACQUISITION_PRESET_SUCCESS = "[Image] Create deep sky acquisition preset success",
  // UPDATE_DEEP_SKY_ACQUISITION_PRESET = "[Image] Update deep sky acquisition preset",
  // UPDATE_DEEP_SKY_ACQUISITION_PRESET_SUCCESS = "[Image] Update deep sky acquisition preset success",
  DELETE_DEEP_SKY_ACQUISITION_PRESET = "[Image] Delete deep sky acquisition preset",
  DELETE_DEEP_SKY_ACQUISITION_PRESET_SUCCESS = "[Image] Delete deep sky acquisition preset success",

  // Solar system acquisition presets

  FIND_SOLAR_SYSTEM_ACQUISITION_PRESETS = "[Image] Find solar system acquisition presets",
  FIND_SOLAR_SYSTEM_ACQUISITION_PRESETS_SUCCESS = "[Image] Find solar system acquisition presets success",
  CREATE_SOLAR_SYSTEM_ACQUISITION_PRESET = "[Image] Create solar system acquisition preset",
  CREATE_SOLAR_SYSTEM_ACQUISITION_PRESET_SUCCESS = "[Image] Create solar system acquisition preset success",
  // UPDATE_SOLAR_SYSTEM_ACQUISITION_PRESET = "[Image] Update solar system acquisition preset",
  // UPDATE_SOLAR_SYSTEM_ACQUISITION_PRESET_SUCCESS = "[Image] Update solar system acquisition preset success",
  DELETE_SOLAR_SYSTEM_ACQUISITION_PRESET = "[Image] Delete solar system acquisition preset",
  DELETE_SOLAR_SYSTEM_ACQUISITION_PRESET_SUCCESS = "[Image] Delete solar system acquisition preset success",
}

export class ImageEditorSetCropperShown implements PayloadActionInterface {
  readonly type = ImageActionTypes.SET_CROPPER_SHOWN;

  constructor(public payload: boolean) {
  }
}

/**********************************************************************************************************************
 * Deep sky acquisition presets
 *********************************************************************************************************************/

export class FindDeepSkyAcquisitionPresets implements Action {
  readonly type = ImageActionTypes.FIND_DEEP_SKY_ACQUISITION_PRESETS;
}

export class FindDeepSkyAcquisitionPresetsSuccess implements PayloadActionInterface {
  readonly type = ImageActionTypes.FIND_DEEP_SKY_ACQUISITION_PRESETS_SUCCESS;

  constructor(public payload: { presets: DeepSkyAcquisitionPresetInterface[] }) {
  }
}

export class CreateDeepSkyAcquisitionPreset implements PayloadActionInterface {
  readonly type = ImageActionTypes.CREATE_DEEP_SKY_ACQUISITION_PRESET;

  constructor(public payload: { presetItems: DeepSkyAcquisitionPresetInterface[] }) {
  }
}

export class CreateDeepSkyAcquisitionPresetSuccess implements PayloadActionInterface {
  readonly type = ImageActionTypes.CREATE_DEEP_SKY_ACQUISITION_PRESET_SUCCESS;

  constructor(public payload: { presetItems: DeepSkyAcquisitionPresetInterface[] }) {
  }
}

// export class UpdateDeepSkyAcquisitionPreset implements PayloadActionInterface {
//   readonly type = ImageActionTypes.UPDATE_DEEP_SKY_ACQUISITION_PRESET;
//
//   constructor(public payload: { preset: DeepSkyAcquisitionPresetInterface[] }) {
//   }
// }

// export class UpdateDeepSkyAcquisitionPresetSuccess implements PayloadActionInterface {
//   readonly type = ImageActionTypes.UPDATE_DEEP_SKY_ACQUISITION_PRESET_SUCCESS;
//
//   constructor(public payload: { preset: DeepSkyAcquisitionPresetInterface[] }) {
//   }
// }

export class DeleteDeepSkyAcquisitionPreset implements PayloadActionInterface {
  readonly type = ImageActionTypes.DELETE_DEEP_SKY_ACQUISITION_PRESET;

  constructor(public payload: { presetItems: DeepSkyAcquisitionPresetInterface[] }) {
  }
}

export class DeleteDeepSkyAcquisitionPresetSuccess implements PayloadActionInterface {
  readonly type = ImageActionTypes.DELETE_DEEP_SKY_ACQUISITION_PRESET_SUCCESS;

  constructor(public payload: { presetItems: DeepSkyAcquisitionPresetInterface[] }) {
  }
}

/**********************************************************************************************************************
 * Solar system acquisition presets
 *********************************************************************************************************************/

export class FindSolarSystemAcquisitionPresets implements Action {
  readonly type = ImageActionTypes.FIND_SOLAR_SYSTEM_ACQUISITION_PRESETS;
}

export class FindSolarSystemAcquisitionPresetsSuccess implements PayloadActionInterface {
  readonly type = ImageActionTypes.FIND_SOLAR_SYSTEM_ACQUISITION_PRESETS_SUCCESS;

  constructor(public payload: { presetItems: SolarSystemAcquisitionPresetInterface[] }) {
  }
}

export class CreateSolarSystemAcquisitionPreset implements PayloadActionInterface {
  readonly type = ImageActionTypes.CREATE_SOLAR_SYSTEM_ACQUISITION_PRESET;

  constructor(public payload: { presetItems: SolarSystemAcquisitionPresetInterface[] }) {
  }
}

export class CreateSolarSystemAcquisitionPresetSuccess implements PayloadActionInterface {
  readonly type = ImageActionTypes.CREATE_SOLAR_SYSTEM_ACQUISITION_PRESET_SUCCESS;

  constructor(public payload: { presetItems: SolarSystemAcquisitionPresetInterface[] }) {
  }
}

// export class UpdateSolarSystemAcquisitionPreset implements PayloadActionInterface {
//   readonly type = ImageActionTypes.UPDATE_SOLAR_SYSTEM_ACQUISITION_PRESET;
//
//   constructor(public payload: { preset: SolarSystemAcquisitionPresetInterface[] }) {
//   }
// }
//
// export class UpdateSolarSystemAcquisitionPresetSuccess implements PayloadActionInterface {
//   readonly type = ImageActionTypes.UPDATE_SOLAR_SYSTEM_ACQUISITION_PRESET_SUCCESS;
//
//   constructor(public payload: { preset: SolarSystemAcquisitionPresetInterface[] }) {
//   }
// }

export class DeleteSolarSystemAcquisitionPreset implements PayloadActionInterface {
  readonly type = ImageActionTypes.DELETE_SOLAR_SYSTEM_ACQUISITION_PRESET;

  constructor(public payload: { presetItems: SolarSystemAcquisitionPresetInterface[] }) {
  }
}

export class DeleteSolarSystemAcquisitionPresetSuccess implements PayloadActionInterface {
  readonly type = ImageActionTypes.DELETE_SOLAR_SYSTEM_ACQUISITION_PRESET_SUCCESS;

  constructor(public payload: { presetItems: SolarSystemAcquisitionPresetInterface[] }) {
  }
}

export type ImageActions =
  | ImageEditorSetCropperShown

  // Deep sky acquisition presets
  | FindDeepSkyAcquisitionPresets
  | FindDeepSkyAcquisitionPresetsSuccess
  | CreateDeepSkyAcquisitionPreset
  | CreateDeepSkyAcquisitionPresetSuccess
  // | UpdateDeepSkyAcquisitionPreset
  // | UpdateDeepSkyAcquisitionPresetSuccess
  | DeleteDeepSkyAcquisitionPreset
  | DeleteDeepSkyAcquisitionPresetSuccess

  // Solar system acquisition presets
  | FindSolarSystemAcquisitionPresets
  | FindSolarSystemAcquisitionPresetsSuccess
  | CreateSolarSystemAcquisitionPreset
  | CreateSolarSystemAcquisitionPresetSuccess
  // | UpdateSolarSystemAcquisitionPreset
  // | UpdateSolarSystemAcquisitionPresetSuccess
  | DeleteSolarSystemAcquisitionPreset
  | DeleteSolarSystemAcquisitionPresetSuccess;
