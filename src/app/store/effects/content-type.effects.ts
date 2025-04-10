import { Injectable } from "@angular/core";
import { All, AppActionTypes } from "@app/store/actions/app.actions";
import { LoadContentTypeById, LoadContentTypeSuccess } from "@app/store/actions/content-type.actions";
import { selectContentType, selectContentTypeById } from "@app/store/selectors/app/content-type.selectors";
import { MainState } from "@app/store/state";
import { CommonApiService } from "@core/services/api/classic/common/common-api.service";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { Observable, EMPTY, of } from "rxjs";
import { catchError, map, mergeMap, take } from "rxjs/operators";

@Injectable()
export class ContentTypeEffects {
  LoadContentType: Observable<LoadContentTypeSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.LOAD_CONTENT_TYPE),
      mergeMap(action =>
        this.store$.select(selectContentType, action.payload).pipe(
          mergeMap(fromStore =>
            fromStore !== null
              ? of(fromStore).pipe(
                  take(1),
                  map(contentType => new LoadContentTypeSuccess(contentType))
                )
              : this.commonApiService.getContentType(action.payload.appLabel, action.payload.model).pipe(
                  map(contentType => new LoadContentTypeSuccess(contentType)),
                  catchError(error => EMPTY)
                )
          )
        )
      )
    )
  );

  LoadContentTypeById: Observable<LoadContentTypeSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.LOAD_CONTENT_TYPE_BY_ID),
      map((action: LoadContentTypeById) => action.payload),
      mergeMap(payload =>
        this.store$.select(selectContentTypeById, payload).pipe(
          mergeMap(fromStore =>
            fromStore !== null
              ? of(fromStore).pipe(
                  take(1),
                  map(contentType => new LoadContentTypeSuccess(contentType))
                )
              : this.commonApiService.getContentTypeById(payload.id).pipe(
                  map(contentType => new LoadContentTypeSuccess(contentType)),
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
    public readonly commonApiService: CommonApiService
  ) {}
}
