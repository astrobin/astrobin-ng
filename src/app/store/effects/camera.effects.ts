import { Injectable } from "@angular/core";
import { All, AppActionTypes } from "@app/store/actions/app.actions";
import { LoadCameraSuccess } from "@app/store/actions/camera.actions";
import { AppState } from "@app/store/app.states";
import { selectCamera } from "@app/store/selectors/app/camera.selectors";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { CameraApiService } from "@shared/services/api/classic/gear/camera/camera-api.service";
import { EMPTY, Observable, of } from "rxjs";
import { catchError, map, mergeMap, switchMap, withLatestFrom } from "rxjs/operators";

@Injectable()
export class CameraEffects {
  @Effect()
  LoadCamera: Observable<LoadCameraSuccess> = this.actions$.pipe(
    ofType(AppActionTypes.LOAD_CAMERA),
    withLatestFrom(action =>
      this.store$
        .select(selectCamera, action.payload)
        .pipe(map(cameraFromStore => ({ action, result: cameraFromStore })))
    ),
    switchMap(observable => observable),
    mergeMap(({ action, result: cameraFromStore }) =>
      cameraFromStore !== null
        ? of(cameraFromStore).pipe(map(camera => new LoadCameraSuccess(camera)))
        : this.cameraApiService.getCamera(action.payload).pipe(
            map(camera => new LoadCameraSuccess(camera)),
            catchError(error => EMPTY)
          )
    )
  );

  @Effect({ dispatch: false })
  LoadCameraSuccess: Observable<void> = this.actions$.pipe(ofType(AppActionTypes.LOAD_CAMERA_SUCCESS));

  constructor(
    public readonly store$: Store<AppState>,
    public readonly actions$: Actions<All>,
    public readonly cameraApiService: CameraApiService
  ) {}
}
