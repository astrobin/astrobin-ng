import { Injectable } from "@angular/core";
import { All, AppActionTypes } from "@app/store/actions/app.actions";
import { LoadImageSuccess } from "@app/store/actions/image.actions";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { State } from "@app/store/state";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { ImageApiService } from "@shared/services/api/classic/images/image/image-api.service";
import { EMPTY, Observable, of } from "rxjs";
import { catchError, map, mergeMap, switchMap, withLatestFrom } from "rxjs/operators";

@Injectable()
export class ImageEffects {
  @Effect()
  LoadImage: Observable<LoadImageSuccess> = this.actions$.pipe(
    ofType(AppActionTypes.LOAD_IMAGE),
    withLatestFrom(action =>
      this.store$.select(selectImage, action.payload).pipe(map(imageFromStore => ({ action, result: imageFromStore })))
    ),
    switchMap(observable => observable),
    mergeMap(({ action, result: imageFromStore }) =>
      imageFromStore !== null
        ? of(imageFromStore).pipe(map(image => new LoadImageSuccess(image)))
        : this.imageApiService.getImage(action.payload).pipe(
            map(image => new LoadImageSuccess(image)),
            catchError(error => EMPTY)
          )
    )
  );

  @Effect({ dispatch: false })
  LoadImageSuccess: Observable<void> = this.actions$.pipe(ofType(AppActionTypes.LOAD_IMAGE_SUCCESS));

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions<All>,
    public readonly imageApiService: ImageApiService
  ) {}
}
