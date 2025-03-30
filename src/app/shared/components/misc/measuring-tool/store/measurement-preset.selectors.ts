import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MeasurementPresetState } from './measurement-preset.reducer';

// Feature selector
export const selectMeasurementPresetState = createFeatureSelector<MeasurementPresetState>('measurementPreset');

// Selectors for individual pieces of state
export const selectShowSavedMeasurements = createSelector(
  selectMeasurementPresetState,
  (state: MeasurementPresetState) => state.showSavedMeasurements
);

export const selectAllMeasurementPresets = createSelector(
  selectMeasurementPresetState,
  (state: MeasurementPresetState) => state.presets
);

export const selectSelectedMeasurementPreset = createSelector(
  selectMeasurementPresetState,
  (state: MeasurementPresetState) => state.selectedPreset
);

export const selectMeasurementPresetsLoading = createSelector(
  selectMeasurementPresetState,
  (state: MeasurementPresetState) => state.loading
);

export const selectMeasurementPresetsError = createSelector(
  selectMeasurementPresetState,
  (state: MeasurementPresetState) => state.error
);