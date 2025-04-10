import { Injectable } from "@angular/core";
import { All, AppActionTypes } from "@app/store/actions/app.actions";
import {
  LoadRemoteSourceAffiliatesFailure,
  LoadRemoteSourceAffiliatesSuccess
} from "@app/store/actions/remote-source-affiliates.actions";
import { selectRemoteSourceAffiliates } from "@app/store/selectors/app/remote-source-affiliates.selectors";
import { MainState } from "@app/store/state";
import { RemoteSourceAffiliateApiService } from "@core/services/api/classic/remote-source-affiliation/remote-source-affiliate-api.service";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store, select } from "@ngrx/store";
import { Observable, of } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";

@Injectable()
export class RemoteSourceAffiliatesEffects {
  LoadRemoteSourceAffiliates: Observable<LoadRemoteSourceAffiliatesSuccess | LoadRemoteSourceAffiliatesFailure> =
    createEffect(() =>
      this.actions$.pipe(
        ofType(AppActionTypes.LOAD_REMOTE_SOURCE_AFFILIATES),
        switchMap(() =>
          this.store$.pipe(
            select(selectRemoteSourceAffiliates),
            switchMap(affiliatesFromStore =>
              affiliatesFromStore && affiliatesFromStore.length > 0
                ? of(new LoadRemoteSourceAffiliatesSuccess({ affiliates: affiliatesFromStore }))
                : this.remoteDataSourceAffiliateApiService.getAll().pipe(
                    map(affiliates => new LoadRemoteSourceAffiliatesSuccess({ affiliates })),
                    catchError(error => of(new LoadRemoteSourceAffiliatesFailure({ error })))
                  )
            )
          )
        )
      )
    );

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions<All>,
    public readonly remoteDataSourceAffiliateApiService: RemoteSourceAffiliateApiService
  ) {}
}
