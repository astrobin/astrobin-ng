import { Injectable } from "@angular/core";
import { All, AppActionTypes } from "@app/store/actions/app.actions";
import { LoadImage } from "@app/store/actions/image.actions";
import { LoadThumbnail, LoadThumbnailCancel, LoadThumbnailSuccess } from "@app/store/actions/thumbnail.actions";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { selectThumbnail } from "@app/store/selectors/app/thumbnail.selectors";
import { MainState } from "@app/store/state";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { ImageApiService } from "@shared/services/api/classic/images/image/image-api.service";
import { EMPTY, Observable, of, Subject } from "rxjs";
import { catchError, delay, filter, map, mergeMap, take, takeUntil, tap } from "rxjs/operators";
import { ImageThumbnailInterface } from "@shared/interfaces/image-thumbnail.interface";

@Injectable()
export class ThumbnailEffects {
  private _loadThumbnailCancelSubject: Subject<Omit<ImageThumbnailInterface, "url">> =
    new Subject<Omit<ImageThumbnailInterface, "url">>();
  LoadThumbnail: Observable<LoadThumbnailSuccess | LoadThumbnail> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.LOAD_THUMBNAIL),
      takeUntil(this._loadThumbnailCancelSubject),
      mergeMap(action =>
        this.store$.select(selectThumbnail, action.payload.data).pipe(
          mergeMap(thumbnailFromStore =>
            (
              thumbnailFromStore !== null &&
              thumbnailFromStore.url &&
              thumbnailFromStore.url.indexOf("placeholder") === -1
            ) ? of(thumbnailFromStore)
              : this.store$.select(selectImage, action.payload.data.id).pipe(
                take(1),
                mergeMap(imageFromStore => {
                  if (imageFromStore !== null) {
                    return this.imageApiService.getThumbnail(
                      imageFromStore.hash || imageFromStore.pk,
                      action.payload.data.revision,
                      action.payload.data.alias,
                      action.payload.bustCache
                    );
                  }

                  this.store$.dispatch(new LoadImage({ imageId: action.payload.data.id }));

                  return this.store$.select(selectImage, action.payload.data.id).pipe(
                    filter(image => !!image),
                    mergeMap(image =>
                      this.imageApiService.getThumbnail(
                        image.hash || image.pk,
                        action.payload.data.revision,
                        action.payload.data.alias,
                        action.payload.bustCache
                      )
                    )
                  );
                })
              )
          )
        )
      ),
      mergeMap(thumbnail => {
        if (thumbnail.url.toLowerCase().indexOf("placeholder") !== -1) {
          return of(void 0).pipe(
            delay(1000),
            map(() =>
              new LoadThumbnail({
                data: { id: thumbnail.id, revision: thumbnail.revision, alias: thumbnail.alias },
                bustCache: true
              }))
          );
        } else {
          return of(thumbnail).pipe(
            map(() => new LoadThumbnailSuccess(thumbnail)),
            catchError(() => EMPTY)
          );
        }
      })
    )
  );

  LoadThumbnailCancel: Observable<Omit<ImageThumbnailInterface, "url">> = createEffect(() =>
      this.actions$.pipe(
        ofType(AppActionTypes.LOAD_THUMBNAIL_CANCEL),
        map((action: LoadThumbnailCancel) => action.payload.thumbnail),
        tap(thumbnail => this._loadThumbnailCancelSubject.next(thumbnail))
      ),
    { dispatch: false }
  );

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions<All>,
    public readonly imageApiService: ImageApiService
  ) {
  }
}
