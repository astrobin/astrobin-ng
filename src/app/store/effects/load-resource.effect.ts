import { Actions, createEffect, ofType } from "@ngrx/effects";
import { select, Store } from "@ngrx/store";
import { finalize, Observable, of, timer } from "rxjs";
import { LoadingService } from "@shared/services/loading.service";
import { catchError, map, mergeMap, switchMap, take, takeUntil } from "rxjs/operators";
import { State } from "@app/store/state";

export function loadResourceEffect<T, K>(
  actions$: Actions,
  store$: Store<State>,
  actionType: string,
  resourceIdSelector: (action: any) => K, // Function to extract resource ID from action
  resourceSelector: (state: State, id: K) => T, // Selector function for the resource
  apiCall: (id: K) => Observable<T>, // API call function
  successActionCreator: (resource: T) => any, // Success action creator
  failureActionCreator: (error: any) => any, // Failure action creator
  loadingService: LoadingService,
  loadingKeyPrefix: string
): Observable<any> { // The effect function
  return createEffect(() =>
    actions$.pipe(
      ofType(actionType),
      mergeMap(action => {
        const resourceId = resourceIdSelector(action);
        const loadingKey = `${loadingKeyPrefix}-${resourceId}`;

        return store$.pipe(
          select(state => resourceSelector(state, resourceId)),
          take(1),
          switchMap(resourceFromStore => {
            if (resourceFromStore) {
              return of(failureActionCreator(null));
            }

            if (loadingService.objectIsLoading(loadingKey)) {
              // Delay and retry mechanism
              return timer(500, 500).pipe(
                switchMap(() => store$.pipe(select(state => resourceSelector(state, resourceId)), take(1))),
                takeUntil(timer(2500)), // 5 attempts with 500ms interval
                map(resource => resource ? successActionCreator(resource) : failureActionCreator(null)),
                catchError(() => of(failureActionCreator(null)))
              );
            }

            loadingService.setObjectLoading(loadingKey, true);
            return apiCall(resourceId).pipe(
              map(successActionCreator),
              catchError(error => of(failureActionCreator(error))),
              finalize(() => loadingService.setObjectLoading(loadingKey, false))
            );
          })
        );
      })
    )
  );
}
