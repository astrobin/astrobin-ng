import { MeasurementPresetInterface } from "../measurement-preset.interface";
import { MeasurementPresetActionTypes, MeasurementPresetActions } from "./measurement-preset.actions";

export interface MeasurementPresetState {
  showSavedMeasurements: boolean;
  presets: MeasurementPresetInterface[];
  selectedPreset: MeasurementPresetInterface | null;
  loading: boolean;
  error: any;
}

export const initialMeasurementPresetState: MeasurementPresetState = {
  showSavedMeasurements: false,
  presets: [],
  selectedPreset: null,
  loading: false,
  error: null
};

export function measurementPresetReducer(
  state = initialMeasurementPresetState,
  action: MeasurementPresetActions
): MeasurementPresetState {
  switch (action.type) {
    // Saved Measurements visibility
    case MeasurementPresetActionTypes.TOGGLE_SAVED_MEASUREMENTS:
      return {
        ...state,
        showSavedMeasurements: !state.showSavedMeasurements
      };
      
    case MeasurementPresetActionTypes.SHOW_SAVED_MEASUREMENTS:
      return {
        ...state,
        showSavedMeasurements: true
      };
      
    case MeasurementPresetActionTypes.HIDE_SAVED_MEASUREMENTS:
      return {
        ...state,
        showSavedMeasurements: false
      };
    
    // Load measurement presets
    case MeasurementPresetActionTypes.LOAD_MEASUREMENT_PRESETS:
      return {
        ...state,
        loading: true,
        error: null
      };
      
    case MeasurementPresetActionTypes.LOAD_MEASUREMENT_PRESETS_SUCCESS:
      return {
        ...state,
        presets: action.payload.presets,
        loading: false,
        error: null
      };
      
    case MeasurementPresetActionTypes.LOAD_MEASUREMENT_PRESETS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };
    
    // Create measurement preset
    case MeasurementPresetActionTypes.CREATE_MEASUREMENT_PRESET:
      return {
        ...state,
        loading: true,
        error: null
      };
      
    case MeasurementPresetActionTypes.CREATE_MEASUREMENT_PRESET_SUCCESS:
      return {
        ...state,
        presets: [...state.presets, action.payload.preset],
        loading: false,
        error: null
      };
      
    case MeasurementPresetActionTypes.CREATE_MEASUREMENT_PRESET_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };
    
    // Delete measurement preset
    case MeasurementPresetActionTypes.DELETE_MEASUREMENT_PRESET:
      return {
        ...state,
        loading: true,
        error: null
      };
      
    case MeasurementPresetActionTypes.DELETE_MEASUREMENT_PRESET_SUCCESS:
      return {
        ...state,
        presets: state.presets.filter(preset => preset.id !== action.payload.presetId),
        loading: false,
        error: null
      };
      
    case MeasurementPresetActionTypes.DELETE_MEASUREMENT_PRESET_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload.error
      };
    
    // Select measurement preset
    case MeasurementPresetActionTypes.SELECT_MEASUREMENT_PRESET:
      return {
        ...state,
        selectedPreset: action.payload.preset
      };
      
    default:
      return state;
  }
}