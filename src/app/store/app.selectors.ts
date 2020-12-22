import { AppState } from "@app/store/app.states";
import { State } from "@app/store/reducers/app.reducers";
import { createSelector } from "@ngrx/store";
import { CameraInterface } from "@shared/interfaces/camera.interface";
import { TelescopeInterface } from "@shared/interfaces/telescope.interface";

export const selectApp = (state: AppState) => state.app;

export const selectTelescopes = createSelector(selectApp, (state: State) => state.telescopes);
export const selectTelescope = createSelector(selectTelescopes, (telescopes: TelescopeInterface[], pk: number) => {
  const matching = telescopes.filter(telescope => telescope.pk === pk);
  return matching.length > 0 ? matching[0] : null;
});

export const selectCameras = createSelector(selectApp, (state: State) => state.cameras);
export const selectCamera = createSelector(selectCameras, (cameras: CameraInterface[], pk: number) => {
  const matching = cameras.filter(camera => camera.pk === pk);
  return matching.length > 0 ? matching[0] : null;
});
