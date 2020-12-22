import { Injectable } from "@angular/core";
import { All, AppActionTypes } from "@app/store/actions/app.actions";
import { LoadImageSuccess } from "@app/store/actions/image.actions";
import { AppState } from "@app/store/app.states";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { ImageApiService } from "@shared/services/api/classic/images/image/image-api.service";
import { Observable } from "rxjs";
import { map, switchMap } from "rxjs/operators";

@Injectable()
export class ImageEffects {
  @Effect()
  LoadImage: Observable<LoadImageSuccess> = this.actions$.pipe(
    ofType(AppActionTypes.LOAD_IMAGE),
    map(action => action.payload),
    switchMap(payload => this.imageApiService.getImage(payload).pipe(map(image => new LoadImageSuccess(image))))
  );

  @Effect({ dispatch: false })
  LoadImageSuccess: Observable<void> = this.actions$.pipe(ofType(AppActionTypes.LOAD_IMAGE_SUCCESS));

  constructor(
    public readonly store$: Store<AppState>,
    public readonly actions$: Actions<All>,
    public readonly imageApiService: ImageApiService
  ) {}
}
