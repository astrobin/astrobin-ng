import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { setTimeagoIntl } from "@app/translate-loader";
import {
  AuthActionTypes,
  InitializeAuthSuccess,
  LoadUser,
  LoadUserProfile,
  LoadUserProfileSuccess,
  LoadUserSuccess,
  Login,
  LoginFailure,
  LoginSuccess,
  UpdateCurrentUserProfile,
  UpdateCurrentUserProfileSuccess
} from "@features/account/store/auth.actions";
import { LoginSuccessInterface } from "@features/account/store/auth.actions.interfaces";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { TranslateService } from "@ngx-translate/core";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { UserSubscriptionInterface } from "@shared/interfaces/user-subscription.interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import { CommonApiService } from "@shared/services/api/classic/common/common-api.service";
import { AuthService } from "@shared/services/auth.service";
import { LoadingService } from "@shared/services/loading.service";
import { UserStoreService } from "@shared/services/user-store.service";
import { CookieService } from "ngx-cookie-service";
import { TimeagoIntl } from "ngx-timeago";
import { EMPTY, forkJoin, Observable, of } from "rxjs";
import { catchError, map, mergeMap, switchMap, take, tap } from "rxjs/operators";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { selectCurrentUserProfile, selectUser, selectUserProfile } from "@features/account/store/auth.selectors";

@Injectable()
export class AuthEffects {
  InitializeSuccess: Observable<InitializeAuthSuccess> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActionTypes.INITIALIZE_SUCCESS),
        tap((action: InitializeAuthSuccess) => {
          if (action.payload.user && action.payload.userProfile) {
            this.userStore.addUserProfile(action.payload.userProfile);
            this.userStore.addUser(action.payload.user);
          }
        })
      ),
    { dispatch: false }
  );

  Login: Observable<LoginSuccess | LoginFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActionTypes.LOGIN),
      map((action: Login) => action),
      tap(action => {
        this.loadingService.setLoading(true);
        return action;
      }),
      switchMap(action =>
        this.authService.login(action.payload.handle, action.payload.password, action.payload.redirectUrl).pipe(
          tap(token => {
            this.cookieService.set(AuthService.CLASSIC_AUTH_TOKEN_COOKIE, token, 180, "/");
          }),
          switchMap(() =>
            this._getData$.pipe(
              map(data => ({
                user: data.user,
                userProfile: data.userProfile,
                userSubscriptions: data.userSubscriptions,
                redirectUrl: action.payload.redirectUrl
              }))
            )
          ),
          map(payload => new LoginSuccess(payload)),
          catchError(error => of(new LoginFailure({ error })))
        )
      )
    )
  );

  LoginSuccess: Observable<LoginSuccess> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActionTypes.LOGIN_SUCCESS),
        tap((action: LoginSuccess) => {
          this.userStore.addUserProfile(action.payload.userProfile);
          this.userStore.addUser(action.payload.user);

          this.loadingService.setLoading(false);

          this.router.navigate(["account", "logged-in"], { queryParams: { redirectUrl: action.payload.redirectUrl } });
        })
      ),
    { dispatch: false }
  );

  LoginFailure: Observable<void> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActionTypes.LOGIN_FAILURE),
        tap(() => {
          this.loadingService.setLoading(false);
        })
      ),
    { dispatch: false }
  );

  Logout: Observable<void> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActionTypes.LOGOUT),
        tap(() => {
          this.authService.logout();
        })
      ),
    { dispatch: false }
  );

  UpdateCurrentUserProfile: Observable<UpdateCurrentUserProfileSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActionTypes.UPDATE_CURRENT_USER_PROFILE),
      map((action: UpdateCurrentUserProfile) => action.payload),
      switchMap(payload =>
        this.store$.select(selectCurrentUserProfile).pipe(
          take(1),
          map(userProfile => ({
            userProfileId: userProfile.id,
            payload
          }))
        )
      ),
      switchMap(({ userProfileId, payload }) =>
        this.commonApiService
          .updateUserProfile(userProfileId, payload)
          .pipe(map(result => new UpdateCurrentUserProfileSuccess(result)))
      )
    )
  );

  LoadUser: Observable<LoadUserSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActionTypes.LOAD_USER),
      map((action: LoadUser) => action.payload),
      mergeMap(payload =>
        this.store$.select(selectUser, payload.id).pipe(
          mergeMap(userFromStore =>
            userFromStore !== null
              ? of(userFromStore).pipe(map(user => new LoadUserSuccess({ user: userFromStore })))
              : this.commonApiService.getUser(payload.id).pipe(
                  map(
                    user => new LoadUserSuccess({ user }),
                    catchError(error => EMPTY)
                  )
                )
          )
        )
      )
    )
  );

  LoadUserProfile: Observable<LoadUserProfileSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActionTypes.LOAD_USER_PROFILE),
      map((action: LoadUserProfile) => action.payload),
      mergeMap(payload =>
        this.store$.select(selectUserProfile, payload.id).pipe(
          mergeMap(userProfileFromStore =>
            userProfileFromStore !== null
              ? of(userProfileFromStore).pipe(
                  map(user => new LoadUserProfileSuccess({ userProfile: userProfileFromStore }))
                )
              : this.commonApiService.getUserProfile(payload.id).pipe(
                  map(
                    userProfile => new LoadUserProfileSuccess({ userProfile }),
                    catchError(error => EMPTY)
                  )
                )
          )
        )
      )
    )
  );

  private _getCurrentUserProfile$: Observable<UserProfileInterface> = this.commonApiService.getCurrentUserProfile();

  private _getCurrentUser$: Observable<UserInterface> = this._getCurrentUserProfile$.pipe(
    switchMap(userProfile => {
      if (userProfile !== null) {
        return this.commonApiService.getUser(userProfile.user);
      }

      return of(null);
    })
  );

  private _getUserSubscriptions$: Observable<UserSubscriptionInterface[]> = this._getCurrentUser$.pipe(
    switchMap(user => {
      if (user !== null) {
        return this.commonApiService.getUserSubscriptions(user);
      }

      return of(null);
    })
  );

  private _getData$ = forkJoin({
    user: this._getCurrentUser$,
    userProfile: this._getCurrentUserProfile$,
    userSubscriptions: this._getUserSubscriptions$
  }).pipe(
    switchMap(data => forkJoin([of(data), this._setLanguage(data.userProfile.language)])),
    map(result => result[0])
  );
  Initialize: Observable<InitializeAuthSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActionTypes.INITIALIZE),
      switchMap(() =>
        new Observable<LoginSuccessInterface>(observer => {
          if (this.cookieService.check(AuthService.CLASSIC_AUTH_TOKEN_COOKIE)) {
            this._getData$.subscribe(data => {
              const successPayload: LoginSuccessInterface = {
                user: data.user,
                userProfile: data.userProfile,
                userSubscriptions: data.userSubscriptions
              };

              observer.next(successPayload);
              observer.complete();
            });
          } else {
            observer.next({ user: null, userProfile: null, userSubscriptions: [] });
            observer.complete();
          }
        }).pipe(map(payload => new InitializeAuthSuccess(payload)))
      )
    )
  );

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly authService: AuthService,
    public readonly router: Router,
    public readonly cookieService: CookieService,
    public readonly loadingService: LoadingService,
    public readonly commonApiService: CommonApiService,
    public readonly userStore: UserStoreService,
    public readonly translate: TranslateService,
    public readonly timeagoIntl: TimeagoIntl
  ) {}

  private _setLanguage(language: string): Observable<any> {
    this.translate.setDefaultLang(language);
    return this.translate.use(language).pipe(
      map(() => {
        setTimeagoIntl(this.timeagoIntl, language);
      })
    );
  }
}
