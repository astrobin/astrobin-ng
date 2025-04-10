import type { MainState } from "@app/store/state";
import type { LoadingService } from "@core/services/loading.service";
import type { Actions } from "@ngrx/effects";
import { createEffect, ofType } from "@ngrx/effects";
import type { Store } from "@ngrx/store";
import { select } from "@ngrx/store";
import type { Observable } from "rxjs";
import { finalize, of, timer } from "rxjs";
import { catchError, filter, map, mergeMap, switchMap, take, takeUntil, tap } from "rxjs/operators";

export function loadResourceEffect<T, K>(
  actions$: Actions,
  store$: Store<MainState>,
  actionType: string,
  resourceIdSelector: (action: any) => K, // Function to extract resource ID from action
  resourceSelector: (state: MainState, id: K) => T, // Selector function for the resource
  apiCall: (id: K) => Observable<T>, // API call function
  successActionCreator: (resource: T) => any, // Success action creator
  failureActionCreator: (resourceId: any, error: any) => any, // Failure action creator
  loadingService: LoadingService,
  loadingKeyPrefix: string
): Observable<any> {
  // The effect function
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
            if (resourceFromStore && !(action as any).payload.options?.skipStoreCache) {
              return of(successActionCreator(resourceFromStore));
            }

            if (loadingService.objectIsLoading(loadingKey)) {
              // Delay and retry mechanism
              return timer(500, 500).pipe(
                switchMap(() =>
                  store$.pipe(
                    select(state => resourceSelector(state, resourceId)),
                    take(1)
                  )
                ),
                takeUntil(timer(5000)), // 10 attempts with 500ms interval
                filter(resource => !!resource), // Filter out null or falsy values
                take(1),
                map(resource => successActionCreator(resource)),
                catchError(error => of(failureActionCreator(resourceId, error)))
              );
            }

            loadingService.setObjectLoading(loadingKey, true);
            return apiCall(resourceId).pipe(
              map(successActionCreator),
              catchError(error => of(failureActionCreator(resourceId, error))),
              finalize(() => loadingService.setObjectLoading(loadingKey, false))
            );
          })
        );
      })
    )
  );
}
