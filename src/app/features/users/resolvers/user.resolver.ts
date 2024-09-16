import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, ResolveFn, Router, RouterStateSnapshot } from "@angular/router";
import { Store } from "@ngrx/store";
import { Location } from "@angular/common";
import { Observable, Subscriber } from "rxjs";
import { map, take } from "rxjs/operators";
import { MainState } from "@app/store/state";
import { UserInterface } from "@shared/interfaces/user.interface";
import { AuthActionTypes, LoadUser, LoadUserProfile, LoadUserProfileSuccess, LoadUserSuccess } from "@features/account/store/auth.actions";
import { Actions, ofType } from "@ngrx/effects";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";

export const UserResolver: ResolveFn<{ user: UserInterface, userProfile: UserProfileInterface } | null> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<{ user: UserInterface, userProfile: UserProfileInterface } | null> => {
  const router = inject(Router);
  const location = inject(Location);
  const store$ = inject(Store<MainState>);
  const actions$ = inject(Actions);
  const username = route.paramMap.get("username");

  const onError = (observer: Subscriber<{user: UserInterface, userProfile: UserProfileInterface} | null >) => {
    router.navigateByUrl("/404", { skipLocationChange: true }).then(() => {
      location.replaceState(state.url);
      observer.next(null);
      observer.complete();
    });
  };

  return new Observable<{ user: UserInterface, userProfile: UserProfileInterface } | null>(observer => {
    actions$.pipe(
      ofType(AuthActionTypes.LOAD_USER_SUCCESS),
      map((action: LoadUserSuccess) => action.payload.user),
      take(1)
    ).subscribe(user => {
      actions$.pipe(
        ofType(AuthActionTypes.LOAD_USER_PROFILE_SUCCESS),
        map((action: LoadUserProfileSuccess) => action.payload.userProfile),
        take(1)
      ).subscribe(userProfile => {
        observer.next({ user, userProfile });
        observer.complete();
      });

      actions$.pipe(
        ofType(AuthActionTypes.LOAD_USER_PROFILE_FAILURE),
        take(1)
      ).subscribe(() => {
        onError(observer)
      });

      store$.dispatch(new LoadUserProfile({ id: user.userProfile }));
    });

    actions$.pipe(
      ofType(AuthActionTypes.LOAD_USER_FAILURE),
      take(1)
    ).subscribe(() => {
      onError(observer)
    });

    store$.dispatch(new LoadUser({ username }));
  });
};
