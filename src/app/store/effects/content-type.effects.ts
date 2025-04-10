import { Injectable } from "@angular/core";
import type { All } from "@app/store/actions/app.actions";
import { AppActionTypes } from "@app/store/actions/app.actions";
import type { LoadContentTypeById } from "@app/store/actions/content-type.actions";
import { LoadContentTypeSuccess } from "@app/store/actions/content-type.actions";
import { selectContentType, selectContentTypeById } from "@app/store/selectors/app/content-type.selectors";
import type { MainState } from "@app/store/state";
import type { CommonApiService } from "@core/services/api/classic/common/common-api.service";
import type { Actions } from "@ngrx/effects";
import { createEffect, ofType } from "@ngrx/effects";
import type { Store } from "@ngrx/store";
import type { Observable } from "rxjs";
import { EMPTY, of } from "rxjs";
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
