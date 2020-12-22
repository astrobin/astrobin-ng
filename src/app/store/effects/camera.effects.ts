import { Injectable } from "@angular/core";
import { All, AppActionTypes } from "@app/store/actions/app.actions";
import { LoadCameraSuccess } from "@app/store/actions/camera.actions";
import { AppState } from "@app/store/app.states";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { CameraApiService } from "@shared/services/api/classic/gear/camera/camera-api.service";
import { Observable } from "rxjs";
import { map, switchMap } from "rxjs/operators";

@Injectable()
export class CameraEffects {
  @Effect()
  LoadCamera: Observable<LoadCameraSuccess> = this.actions$.pipe(
    ofType(AppActionTypes.LOAD_CAMERA),
    map(action => action.payload),
    switchMap(payload => this.cameraApiService.getCamera(payload).pipe(map(camera => new LoadCameraSuccess(camera))))
  );

  @Effect({ dispatch: false })
  LoadCameraSuccess: Observable<void> = this.actions$.pipe(ofType(AppActionTypes.LOAD_CAMERA_SUCCESS));

  constructor(
    public readonly store$: Store<AppState>,
    public readonly actions$: Actions<All>,
    public readonly cameraApiService: CameraApiService
  ) {}
}
