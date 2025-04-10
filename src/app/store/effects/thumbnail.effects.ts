import { Injectable } from "@angular/core";
import type { All } from "@app/store/actions/app.actions";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { LoadImage } from "@app/store/actions/image.actions";
import type { LoadThumbnailCancel } from "@app/store/actions/thumbnail.actions";
import { LoadThumbnail, LoadThumbnailSuccess } from "@app/store/actions/thumbnail.actions";
import { selectImage } from "@app/store/selectors/app/image.selectors";
import { selectThumbnail } from "@app/store/selectors/app/thumbnail.selectors";
import type { MainState } from "@app/store/state";
import type { ImageThumbnailInterface } from "@core/interfaces/image-thumbnail.interface";
import type { ImageApiService } from "@core/services/api/classic/images/image/image-api.service";
import type { Actions } from "@ngrx/effects";
import { createEffect, ofType } from "@ngrx/effects";
import type { Store } from "@ngrx/store";
import type { Observable } from "rxjs";
import { EMPTY, of, Subject } from "rxjs";
import { catchError, delay, filter, map, mergeMap, take, takeUntil, tap } from "rxjs/operators";

@Injectable()
export class ThumbnailEffects {
  private _thumbnailCancelSubjects: Map<string, Subject<void>> = new Map();

  LoadThumbnail: Observable<LoadThumbnailSuccess | LoadThumbnail> = createEffect(() => {
    return this.actions$.pipe(
      ofType(AppActionTypes.LOAD_THUMBNAIL),
      mergeMap(action => {
        const key = this._createThumbnailKey(action.payload.data); // Create a unique key for each thumbnail
        const cancelSubject = new Subject<void>(); // Create a cancel subject for this thumbnail load
        this._thumbnailCancelSubjects.set(key, cancelSubject); // Store the cancel subject

        return this.store$.select(selectThumbnail, action.payload.data).pipe(
          takeUntil(cancelSubject), // Cancel if the corresponding subject emits
          mergeMap(thumbnailFromStore =>
            thumbnailFromStore !== null &&
            thumbnailFromStore.url &&
            thumbnailFromStore.url.indexOf("placeholder") === -1
              ? of(thumbnailFromStore)
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
          ),
          mergeMap(thumbnail => {
            if (thumbnail.url.toLowerCase().indexOf("placeholder") !== -1) {
              return of(void 0).pipe(
                delay(1000),
                takeUntil(cancelSubject), // Cancel if the corresponding subject emits
                map(
                  () =>
                    new LoadThumbnail({
                      data: { id: thumbnail.id, revision: thumbnail.revision, alias: thumbnail.alias },
                      bustCache: true
                    })
                )
              );
            } else {
              return of(thumbnail).pipe(
                map(() => new LoadThumbnailSuccess(thumbnail)),
                catchError(() => EMPTY),
                tap(() => this._thumbnailCancelSubjects.delete(key)) // Clean up after success
              );
            }
          }),
          catchError(() => {
            this._thumbnailCancelSubjects.delete(key); // Clean up on error
            return EMPTY;
          })
        );
      })
    );
  });

  LoadThumbnailCancel: Observable<Omit<ImageThumbnailInterface, "url">> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AppActionTypes.LOAD_THUMBNAIL_CANCEL),
        map((action: LoadThumbnailCancel) => action.payload.thumbnail),
        tap(thumbnail => {
          const key = this._createThumbnailKey(thumbnail); // Create the composite key
          const cancelSubject = this._thumbnailCancelSubjects.get(key); // Get the cancel subject based on the key
          if (cancelSubject) {
            cancelSubject.next(); // Cancel the thumbnail load
            this._thumbnailCancelSubjects.delete(key); // Clean up after cancel
          }
        })
      ),
    { dispatch: false }
  );

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions<All>,
    public readonly imageApiService: ImageApiService
  ) {}

  private _createThumbnailKey(thumbnail: Omit<ImageThumbnailInterface, "url">): string {
    return `${thumbnail.id}_${thumbnail.alias}_${thumbnail.revision}`;
  }
}
