import { Injectable } from "@angular/core";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { LoadGroups, LoadGroupsFailure, LoadGroupsSuccess } from "@app/store/actions/group.actions";
import { selectGroupsByParams } from "@app/store/selectors/app/group.selectors";
import { MainState } from "@app/store/state";
import { GroupApiService } from "@core/services/api/classic/groups/group-api.service";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store, select } from "@ngrx/store";
import { of } from "rxjs";
import { catchError, map, switchMap, take } from "rxjs/operators";

@Injectable()
export class GroupEffects {
  loadGroups$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.LOAD_GROUPS),
      switchMap((action: LoadGroups) =>
        this.store.pipe(
          select(selectGroupsByParams(action.payload.params)),
          take(1),
          switchMap(storedGroups =>
            storedGroups && storedGroups.length > 0
              ? of(new LoadGroupsSuccess({ params: action.payload.params, groups: storedGroups }))
              : this.groupApiService.fetchGroups(action.payload.params).pipe(
                  map(groups => new LoadGroupsSuccess({ params: action.payload.params, groups })),
                  catchError(error => of(new LoadGroupsFailure({ params: action.payload.params, error })))
                )
          )
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private store: Store<MainState>,
    private groupApiService: GroupApiService
  ) {}
}
