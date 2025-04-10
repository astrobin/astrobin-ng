import { Injectable } from "@angular/core";
import { All, AppActionTypes } from "@app/store/actions/app.actions";
import { LoadCameraSuccess } from "@app/store/actions/camera.actions";
import { selectCamera } from "@app/store/selectors/app/camera.selectors";
import { MainState } from "@app/store/state";
import { CameraApiService } from "@core/services/api/classic/gear/camera/camera-api.service";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { Observable, EMPTY, of } from "rxjs";
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
