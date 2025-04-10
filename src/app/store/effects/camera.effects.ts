import { Injectable } from "@angular/core";
import type { All } from "@app/store/actions/app.actions";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { LoadCameraSuccess } from "@app/store/actions/camera.actions";
import { selectCamera } from "@app/store/selectors/app/camera.selectors";
import type { MainState } from "@app/store/state";
import type { CameraApiService } from "@core/services/api/classic/gear/camera/camera-api.service";
import type { Actions } from "@ngrx/effects";
import { createEffect, ofType } from "@ngrx/effects";
import type { Store } from "@ngrx/store";
import type { Observable } from "rxjs";
import { EMPTY, of } from "rxjs";
import { catchError, map, mergeMap, switchMap, take } from "rxjs/operators";

@Injectable()
export class CameraEffects {
  LoadCamera: Observable<LoadCameraSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.LOAD_CAMERA),
      mergeMap(action =>
        this.store$.select(selectCamera, action.payload).pipe(
          switchMap(cameraFromStore =>
            cameraFromStore !== null
              ? of(cameraFromStore).pipe(
                  take(1),
                  map(camera => new LoadCameraSuccess(camera))
                )
              : this.cameraApiService.get(action.payload).pipe(
                  map(camera => new LoadCameraSuccess(camera)),
                  catchError(error => EMPTY)
                )
          )
        )
      )
    )
  );

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions<All>,
    public readonly cameraApiService: CameraApiService
  ) {}
}
