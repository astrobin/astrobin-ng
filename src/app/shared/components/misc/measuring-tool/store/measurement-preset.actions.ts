import { Action } from "@ngrx/store";

import { MeasurementPresetInterface } from "../measurement-preset.interface";

export enum MeasurementPresetActionTypes {
  // Saved Measurements visibility
  TOGGLE_SAVED_MEASUREMENTS = "[Measurement Tool] Toggle Saved Measurements",
  SHOW_SAVED_MEASUREMENTS = "[Measurement Tool] Show Saved Measurements",
  HIDE_SAVED_MEASUREMENTS = "[Measurement Tool] Hide Saved Measurements",

  // Measurement presets
  LOAD_MEASUREMENT_PRESETS = "[Measurement Tool] Load Measurement Presets",
  LOAD_MEASUREMENT_PRESETS_SUCCESS = "[Measurement Tool] Load Measurement Presets Success",
  LOAD_MEASUREMENT_PRESETS_FAILURE = "[Measurement Tool] Load Measurement Presets Failure",

  CREATE_MEASUREMENT_PRESET = "[Measurement Tool] Create Measurement Preset",
  CREATE_MEASUREMENT_PRESET_SUCCESS = "[Measurement Tool] Create Measurement Preset Success",
  CREATE_MEASUREMENT_PRESET_FAILURE = "[Measurement Tool] Create Measurement Preset Failure",

  DELETE_MEASUREMENT_PRESET = "[Measurement Tool] Delete Measurement Preset",
  DELETE_MEASUREMENT_PRESET_SUCCESS = "[Measurement Tool] Delete Measurement Preset Success",
  DELETE_MEASUREMENT_PRESET_FAILURE = "[Measurement Tool] Delete Measurement Preset Failure",

  SELECT_MEASUREMENT_PRESET = "[Measurement Tool] Select Measurement Preset"
}

// Saved Measurements visibility actions
export class ToggleSavedMeasurements implements Action {
  readonly type = MeasurementPresetActionTypes.TOGGLE_SAVED_MEASUREMENTS;
}

export class ShowSavedMeasurements implements Action {
  readonly type = MeasurementPresetActionTypes.SHOW_SAVED_MEASUREMENTS;
}

export class HideSavedMeasurements implements Action {
  readonly type = MeasurementPresetActionTypes.HIDE_SAVED_MEASUREMENTS;
}

// Measurement presets actions
export class LoadMeasurementPresets implements Action {
  readonly type = MeasurementPresetActionTypes.LOAD_MEASUREMENT_PRESETS;
  constructor(public payload: { userId: number }) {}
}

export class LoadMeasurementPresetsSuccess implements Action {
  readonly type = MeasurementPresetActionTypes.LOAD_MEASUREMENT_PRESETS_SUCCESS;
  constructor(public payload: { presets: MeasurementPresetInterface[] }) {}
}

export class LoadMeasurementPresetsFailure implements Action {
  readonly type = MeasurementPresetActionTypes.LOAD_MEASUREMENT_PRESETS_FAILURE;
  constructor(public payload: { error: any }) {}
}

export class CreateMeasurementPreset implements Action {
  readonly type = MeasurementPresetActionTypes.CREATE_MEASUREMENT_PRESET;
  constructor(public payload: { preset: MeasurementPresetInterface }) {}
}

export class CreateMeasurementPresetSuccess implements Action {
  readonly type = MeasurementPresetActionTypes.CREATE_MEASUREMENT_PRESET_SUCCESS;
  constructor(public payload: { preset: MeasurementPresetInterface }) {}
}

export class CreateMeasurementPresetFailure implements Action {
  readonly type = MeasurementPresetActionTypes.CREATE_MEASUREMENT_PRESET_FAILURE;
  constructor(public payload: { error: any }) {}
}

export class DeleteMeasurementPreset implements Action {
  readonly type = MeasurementPresetActionTypes.DELETE_MEASUREMENT_PRESET;
  constructor(public payload: { presetId: number }) {}
}

export class DeleteMeasurementPresetSuccess implements Action {
  readonly type = MeasurementPresetActionTypes.DELETE_MEASUREMENT_PRESET_SUCCESS;
  constructor(public payload: { presetId: number }) {}
}

export class DeleteMeasurementPresetFailure implements Action {
  readonly type = MeasurementPresetActionTypes.DELETE_MEASUREMENT_PRESET_FAILURE;
  constructor(public payload: { error: any }) {}
}

export class SelectMeasurementPreset implements Action {
  readonly type = MeasurementPresetActionTypes.SELECT_MEASUREMENT_PRESET;
  constructor(public payload: { preset: MeasurementPresetInterface }) {}
}

export type MeasurementPresetActions =
  | ToggleSavedMeasurements
  | ShowSavedMeasurements
  | HideSavedMeasurements
  | LoadMeasurementPresets
  | LoadMeasurementPresetsSuccess
  | LoadMeasurementPresetsFailure
  | CreateMeasurementPreset
  | CreateMeasurementPresetSuccess
  | CreateMeasurementPresetFailure
  | DeleteMeasurementPreset
  | DeleteMeasurementPresetSuccess
  | DeleteMeasurementPresetFailure
  | SelectMeasurementPreset;
