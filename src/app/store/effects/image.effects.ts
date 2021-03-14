import { Injectable } from "@angular/core";
import { All, AppActionTypes } from "@app/store/actions/app.actions";
import {
  LoadImagesSuccess,
  LoadImageSuccess,
  SaveImageFailure,
  SaveImageSuccess
} from "@app/store/actions/image.actions";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { State } from "@app/store/state";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { ImageApiService } from "@shared/services/api/classic/images/image/image-api.service";
import { LoadingService } from "@shared/services/loading.service";
import { EMPTY, Observable, of } from "rxjs";
import { catchError, delay, map, mergeMap, tap } from "rxjs/operators";

@Injectable()
export class ImageEffects {
  LoadImage: Observable<LoadImageSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.LOAD_IMAGE),
      mergeMap(action =>
        this.store$.select(selectImage, action.payload).pipe(
          mergeMap(imageFromStore =>
            imageFromStore !== null
              ? of(imageFromStore).pipe(map(image => new LoadImageSuccess(image)))
              : this.imageApiService.getImage(action.payload).pipe(
                  map(image => new LoadImageSuccess(image)),
                  catchError(() => EMPTY)
                )
          )
        )
      )
    )
  );

  LoadImages: Observable<LoadImagesSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.LOAD_IMAGES),
      mergeMap(action =>
        this.imageApiService.getImages(action.payload).pipe(
          map(response => new LoadImagesSuccess(response)),
          catchError(() => EMPTY)
        )
      )
    )
  );

  SaveImage: Observable<SaveImageSuccess | SaveImageFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.SAVE_IMAGE),
      mergeMap(action =>
        this.imageApiService.updateImage(action.payload.pk, action.payload.data).pipe(
          tap(() => this.loadingService.setLoading(true)),
          map(() => new SaveImageSuccess({ image: action.payload.data })),
          catchError(error => of(new SaveImageFailure({ error })))
        )
      )
    )
  );

  SaveImageSuccess: Observable<SaveImageSuccess> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AppActionTypes.SAVE_IMAGE_SUCCESS),
        tap(() => this.loadingService.setLoading(false))
      ),
    {
      dispatch: false
    }
  );

  SaveImageFailure: Observable<SaveImageFailure> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AppActionTypes.SAVE_IMAGE_FAILURE),
        tap(() => this.loadingService.setLoading(false))
      ),
    {
      dispatch: false
    }
  );

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions<All>,
    public readonly imageApiService: ImageApiService,
    public readonly loadingService: LoadingService
  ) {}
}
