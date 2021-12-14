import { Injectable } from "@angular/core";
import { All, AppActionTypes } from "@app/store/actions/app.actions";
import {
  LoadImageFailure,
  LoadImageRevisionsSuccess,
  LoadImagesSuccess,
  LoadImageSuccess,
  SaveImageFailure,
  SaveImageSuccess
} from "@app/store/actions/image.actions";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { State } from "@app/store/state";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { ImageApiService } from "@shared/services/api/classic/images/image/image-api.service";
import { LoadingService } from "@shared/services/loading.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { EMPTY, Observable, of } from "rxjs";
import { catchError, map, mergeMap, switchMap, tap } from "rxjs/operators";

@Injectable()
export class ImageEffects {
  LoadImage: Observable<LoadImageSuccess | LoadImageFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.LOAD_IMAGE),
      mergeMap(action =>
        this.store$.select(selectImage, action.payload).pipe(
          switchMap(imageFromStore =>
            imageFromStore !== null
              ? of(imageFromStore).pipe(map(image => new LoadImageSuccess(image)))
              : this.imageApiService.getImage(action.payload).pipe(
                  map(image => new LoadImageSuccess(image)),
                  catchError(error => of(new LoadImageFailure(error)))
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
      tap(() => this.loadingService.setLoading(true)),
      mergeMap(action =>
        this.imageApiService.updateImage(action.payload.pk, action.payload.data).pipe(
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
        map(action => action.payload.error),
        tap(error => {
          this.loadingService.setLoading(false);
          this.popNotificationsService.error(
            this.translateService.instant("The server responded with an error: " + error.statusText)
          );
        })
      ),
    {
      dispatch: false
    }
  );

  LoadImageRevisions: Observable<LoadImageRevisionsSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.LOAD_IMAGE_REVISIONS),
      mergeMap(action =>
        this.imageApiService.getImageRevisions(action.payload.imageId).pipe(
          map(response => new LoadImageRevisionsSuccess({ imageRevisions: response })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions<All>,
    public readonly imageApiService: ImageApiService,
    public readonly loadingService: LoadingService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translateService: TranslateService
  ) {}
}
