import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { of } from "rxjs";
import { catchError, map, mergeMap } from "rxjs/operators";
import { MainState } from "@app/store/state";
import { CollectionApiService } from "@shared/services/api/classic/collections/collection-api.service";
import { LoadCollections, LoadCollectionsFailure, LoadCollectionsSuccess } from "@app/store/actions/collection.actions";
import { AppActionTypes } from "@app/store/actions/app.actions";

@Injectable()
export class CollectionEffects {

  loadCollections$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.LOAD_COLLECTIONS),
      mergeMap((action: LoadCollections) =>
        this.collectionApiService.getAll(action.payload.params).pipe(
          map(collections => new LoadCollectionsSuccess({ params: action.payload.params, collections })),
          catchError(error => of(new LoadCollectionsFailure({ params: action.payload.params, error })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private store: Store<MainState>,
    private collectionApiService: CollectionApiService
  ) {
  }
}
