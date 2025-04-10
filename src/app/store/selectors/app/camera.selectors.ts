import type { AppState } from "@app/store/reducers/app.reducers";
import { selectApp } from "@app/store/selectors/app/app.selectors";
import type { CameraInterface } from "@core/interfaces/camera.interface";
import { createSelector } from "@ngrx/store";

export const selectCameras = createSelector(selectApp, (state: AppState): CameraInterface[] => state.cameras);

export const selectCamera = createSelector(selectCameras, (cameras: CameraInterface[], pk: number): CameraInterface => {
  const matching = cameras.filter(camera => camera.pk === pk);
  return matching.length > 0 ? matching[0] : null;
});
