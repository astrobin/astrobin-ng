import { Location } from "@angular/common";
import { inject } from "@angular/core";
import type { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from "@angular/router";
import { Router } from "@angular/router";
import type { MainState } from "@app/store/state";
import type { UserProfileInterface } from "@core/interfaces/user-profile.interface";
import type { UserInterface } from "@core/interfaces/user.interface";
import type { LoadUserProfileSuccess, LoadUserSuccess } from "@features/account/store/auth.actions";
import { AuthActionTypes, LoadUser, LoadUserProfile } from "@features/account/store/auth.actions";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import type { Subscriber } from "rxjs";
import { Observable } from "rxjs";
import { map, take } from "rxjs/operators";

export const UserResolver: ResolveFn<{ user: UserInterface; userProfile: UserProfileInterface } | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<{ user: UserInterface; userProfile: UserProfileInterface } | null> => {
  const router = inject(Router);
  const location = inject(Location);
  const store$ = inject(Store<MainState>);
  const actions$ = inject(Actions);
  const username = route.paramMap.get("username");

  const onError = (observer: Subscriber<{ user: UserInterface; userProfile: UserProfileInterface } | null>) => {
    router.navigateByUrl("/404", { skipLocationChange: true }).then(() => {
      location.replaceState(state.url);
      observer.next(null);
      observer.complete();
    });
  };

  return new Observable<{ user: UserInterface; userProfile: UserProfileInterface } | null>(observer => {
    actions$
      .pipe(
        ofType(AuthActionTypes.LOAD_USER_SUCCESS),
        map((action: LoadUserSuccess) => action.payload.user),
        take(1)
      )
      .subscribe(user => {
        actions$
          .pipe(
            ofType(AuthActionTypes.LOAD_USER_PROFILE_SUCCESS),
            map((action: LoadUserProfileSuccess) => action.payload.userProfile),
            take(1)
          )
          .subscribe(userProfile => {
            if (userProfile.suspended) {
              onError(observer);
              return;
            }

            observer.next({ user, userProfile });
            observer.complete();
          });

        actions$.pipe(ofType(AuthActionTypes.LOAD_USER_PROFILE_FAILURE), take(1)).subscribe(() => {
          onError(observer);
        });

        store$.dispatch(new LoadUserProfile({ id: user.userProfile }));
      });

    actions$.pipe(ofType(AuthActionTypes.LOAD_USER_FAILURE), take(1)).subscribe(() => {
      onError(observer);
    });

    store$.dispatch(new LoadUser({ username }));
  });
};
