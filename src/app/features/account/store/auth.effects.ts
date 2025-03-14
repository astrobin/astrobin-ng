import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { setTimeagoIntl } from "@app/translate-loader";
import { AuthActionTypes, ChangeUserProfileGalleryHeaderImage, ChangeUserProfileGalleryHeaderImageFailure, ChangeUserProfileGalleryHeaderImageSuccess, DeleteAvatar, DeleteAvatarFailure, DeleteAvatarSuccess, InitializeAuthSuccess, LoadUser, LoadUserFailure, LoadUserProfile, LoadUserProfileFailure, LoadUserProfileSuccess, LoadUserSuccess, Login, LoginFailure, LoginSuccess, LogoutSuccess, RemoveShadowBanUserProfile, RemoveShadowBanUserProfileFailure, RemoveShadowBanUserProfileSuccess, ShadowBanUserProfile, ShadowBanUserProfileFailure, ShadowBanUserProfileSuccess, UpdateUserProfile, UpdateUserProfileSuccess, UploadAvatar, UploadAvatarFailure, UploadAvatarSuccess } from "@features/account/store/auth.actions";
import { LoginSuccessInterface } from "@features/account/store/auth.actions.interfaces";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { TranslateService } from "@ngx-translate/core";
import { UserProfileInterface } from "@core/interfaces/user-profile.interface";
import { UserSubscriptionInterface } from "@core/interfaces/user-subscription.interface";
import { UserInterface } from "@core/interfaces/user.interface";
import { CommonApiService } from "@core/services/api/classic/common/common-api.service";
import { AuthService } from "@core/services/auth.service";
import { LoadingService } from "@core/services/loading.service";
import { CookieService } from "ngx-cookie";
import { TimeagoIntl } from "ngx-timeago";
import { EMPTY, Observable, of } from "rxjs";
import { catchError, concatMap, map, mergeMap, switchMap, tap } from "rxjs/operators";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { selectUser, selectUserByUsername, selectUserProfile } from "@features/account/store/auth.selectors";
import { PopNotificationsService } from "@core/services/pop-notifications.service";

@Injectable()
export class AuthEffects {
  LoginSuccess: Observable<LoginSuccess> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActionTypes.LOGIN_SUCCESS),
        tap((action: LoginSuccess) => {
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

  Logout: Observable<LogoutSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActionTypes.LOGOUT),
      switchMap(() => this.authService.logout()),
      map(() => new LogoutSuccess())
    )
  );

  UpdateUserProfile: Observable<UpdateUserProfileSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActionTypes.UPDATE_USER_PROFILE),
      map((action: UpdateUserProfile) => action.payload),
      switchMap(payload =>
        this.commonApiService
          .updateUserProfile(payload.id, payload)
          .pipe(map(result => new UpdateUserProfileSuccess(result)))
      )
    )
  );

  LoadUser: Observable<LoadUserSuccess | LoadUserFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActionTypes.LOAD_USER),
      map((action: LoadUser) => action.payload),
      mergeMap(payload => {
        let selector;
        let selectorArgument;

        if (payload.id) {
          selector = selectUser;
          selectorArgument = payload.id;
        } else if (payload.username) {
          selector = selectUserByUsername;
          selectorArgument = payload.username;
        }

        if (!selector || !selectorArgument) {
          return EMPTY;
        }

        return this.store$.select(selector, selectorArgument).pipe(
          switchMap(userFromStore =>
            userFromStore !== null
              ? of(userFromStore).pipe(map(() => new LoadUserSuccess({ user: userFromStore })))
              : this.commonApiService.getUser(payload.id, payload.username).pipe(
                map(
                  user => !!user
                    ? new LoadUserSuccess({ user })
                    : new LoadUserFailure(payload),
                ),
                catchError(error => of(new LoadUserFailure(payload)))
              )
          )
        );
      })
    )
  );

  LoadUserProfile: Observable<LoadUserProfileSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActionTypes.LOAD_USER_PROFILE),
      map((action: LoadUserProfile) => action.payload),
      mergeMap(payload =>
        this.store$.select(selectUserProfile, payload.id).pipe(
          switchMap(userProfileFromStore =>
            userProfileFromStore !== null
              ? of(userProfileFromStore).pipe(
                map(() => new LoadUserProfileSuccess({ userProfile: userProfileFromStore }))
              )
              : this.commonApiService.getUserProfile(payload.id).pipe(
                map(userProfile => new LoadUserProfileSuccess({ userProfile }),
                  catchError(error => of(new LoadUserProfileFailure({ id: payload.id, error })))
                )
              )
          )
        )
      )
    )
  );

  ChangeUserProfileGalleryHeaderImage: Observable<ChangeUserProfileGalleryHeaderImageSuccess | ChangeUserProfileGalleryHeaderImageFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActionTypes.CHANGE_USER_PROFILE_GALLERY_HEADER_IMAGE),
      map((action: ChangeUserProfileGalleryHeaderImage) => action.payload),
      switchMap(payload =>
        this.commonApiService.changeUserProfileGalleryHeaderImage(payload.id, payload.imageId).pipe(
          tap(() => this.loadingService.setLoading(true)),
          map(userProfile =>
            new ChangeUserProfileGalleryHeaderImageSuccess({ userProfile, imageId: payload.imageId })),
          catchError(error => of(new ChangeUserProfileGalleryHeaderImageFailure({
            id: payload.id, imageId: payload.imageId, error
          })))
        )
      )
    )
  );

  ChangeUserProfileGalleryHeaderImageSuccess: Observable<void> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActionTypes.CHANGE_USER_PROFILE_GALLERY_HEADER_IMAGE_SUCCESS),
        tap(() => {
          this.loadingService.setLoading(false);
        })
      ),
    { dispatch: false }
  );

  ChangeUserProfileGalleryHeaderImageFailure: Observable<void> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActionTypes.CHANGE_USER_PROFILE_GALLERY_HEADER_IMAGE_FAILURE),
        tap(() => {
          this.loadingService.setLoading(false);
        })
      ),
    { dispatch: false }
  );

  ShadowBanUserProfile: Observable<ShadowBanUserProfileSuccess | ShadowBanUserProfileFailure> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActionTypes.SHADOW_BAN_USER_PROFILE),
        map((action: ShadowBanUserProfile) => action.payload),
        switchMap(payload =>
          this.commonApiService.shadowBanUserProfile(payload.id).pipe(
            map(response => new ShadowBanUserProfileSuccess({
              id: payload.id,
              message: response.message
            })),
            catchError(error => of(new ShadowBanUserProfileFailure({ id: payload.id, error })))
          )
        )
      )
  );

  ShadowBanUserProfileSuccess: Observable<string> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActionTypes.SHADOW_BAN_USER_PROFILE_SUCCESS),
        map((action: ShadowBanUserProfileSuccess) => action.payload.message),
        tap(message => {
          this.popNotificationsService.success(message);
          this.loadingService.setLoading(false);
        })
      ),
    { dispatch: false }
  );

  ShadowBanUserProfileFailure: Observable<void> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActionTypes.SHADOW_BAN_USER_PROFILE_FAILURE),
        tap(() => {
          this.popNotificationsService.error("Failed to shadow ban user.");
          this.loadingService.setLoading(false);
        })
      ),
    { dispatch: false }
  );

  RemoveShadowBanUserProfile: Observable<RemoveShadowBanUserProfileSuccess | RemoveShadowBanUserProfileFailure> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActionTypes.REMOVE_SHADOW_BAN_USER_PROFILE),
        map((action: RemoveShadowBanUserProfile) => action.payload),
        switchMap(payload =>
          this.commonApiService.removeShadowBanUserProfile(payload.id).pipe(
            map(response => new RemoveShadowBanUserProfileSuccess({
              id: payload.id,
              message: response.message
            })),
            catchError(error => of(new RemoveShadowBanUserProfileFailure({ id: payload.id, error })))
          )
        )
      )
  );

  RemoveShadowBanUserProfileSuccess: Observable<string> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActionTypes.REMOVE_SHADOW_BAN_USER_PROFILE_SUCCESS),
        map((action: RemoveShadowBanUserProfileSuccess) => action.payload.message),
        tap(message => {
          this.popNotificationsService.success(message);
          this.loadingService.setLoading(false);
        })
      ),
    { dispatch: false }
  );

  RemoveShadowBanUserProfileFailure: Observable<void> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActionTypes.REMOVE_SHADOW_BAN_USER_PROFILE_FAILURE),
        tap(() => {
          this.popNotificationsService.error("Failed to remove shadow ban from user.");
          this.loadingService.setLoading(false);
        })
      ),
    { dispatch: false }
  );

  private _getCurrentUser$: Observable<{
    user: UserInterface;
    userProfile: UserProfileInterface;
  }> = this.commonApiService.getCurrentUserProfile().pipe(
    switchMap(userProfile => {
      if (userProfile !== null) {
        return this.commonApiService.getUser(userProfile.user).pipe(
          map(user => ({
            user,
            userProfile
          }))
        );
      }

      return of(null);
    })
  );

  private _getData$: Observable<{
    user: UserInterface;
    userProfile: UserProfileInterface;
    userSubscriptions: UserSubscriptionInterface[];
  }> = this._getCurrentUser$.pipe(
    concatMap(userData => {
      if (userData === null) {
        return of(null);
      }
      return this.commonApiService.getUserSubscriptions(userData.user).pipe(
        map(userSubscriptions => {
          return {
            user: userData.user,
            userProfile: userData.userProfile,
            userSubscriptions
          };
        })
      );
    })
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
            this.cookieService.put(AuthService.CLASSIC_AUTH_TOKEN_COOKIE, token, {
              path: "/",
              expires: new Date(new Date().getTime() + 180 * 24 * 60 * 60 * 1000)
            });
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
          switchMap(data => {
            if (data && data.userProfile && data.userProfile.language) {
              return this._setLanguage(data.userProfile.language).pipe(map(() => data));
            } else {
              return of(data);
            }
          }),
          map(payload => new LoginSuccess(payload)),
          catchError(error => of(new LoginFailure({ error })))
        )
      )
    )
  );

  Initialize: Observable<InitializeAuthSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActionTypes.INITIALIZE),
      switchMap(() =>
        new Observable<LoginSuccessInterface>(observer => {
          const token = this.cookieService.get(AuthService.CLASSIC_AUTH_TOKEN_COOKIE);
          if (!!token) {
            this._getData$.subscribe(data => {
              if (!data || !data.user || !data.userProfile || !data.userSubscriptions) {
                observer.next({ user: null, userProfile: null, userSubscriptions: [] });
                observer.complete();
                return;
              }

              this._setLanguage(data.userProfile.language).subscribe(() => {
                const successPayload: LoginSuccessInterface = {
                  user: data.user,
                  userProfile: data.userProfile,
                  userSubscriptions: data.userSubscriptions
                };

                observer.next(successPayload);
                observer.complete();
              });
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
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly authService: AuthService,
    public readonly router: Router,
    public readonly cookieService: CookieService,
    public readonly loadingService: LoadingService,
    public readonly commonApiService: CommonApiService,
    public readonly translateService: TranslateService,
    public readonly timeagoIntl: TimeagoIntl,
    public readonly popNotificationsService: PopNotificationsService
  ) {
  }

  private _setLanguage(language: string): Observable<any> {
    this.translateService.setDefaultLang(language);
    return this.translateService.use(language).pipe(
      map(() => {
        setTimeagoIntl(this.timeagoIntl, language);
      })
    );
  }

  UploadAvatar: Observable<UploadAvatarSuccess | UploadAvatarFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActionTypes.UPLOAD_AVATAR),
      tap(() => {
        this.loadingService.setLoading(true);
      }),
      switchMap((action: UploadAvatar) =>
        this.commonApiService.uploadAvatar(action.payload.avatarFile).pipe(
          map(response => {
            if (response.success) {
              return new UploadAvatarSuccess({ avatarUrl: response.avatar_url });
            } else {
              // Handle different error formats
              let errorMessage = "Error uploading avatar";
              if (response.errors?.file && response.errors.file.length) {
                errorMessage = response.errors.file.join(", ");
              } else if (response.errors?.avatar && response.errors.avatar.length) {
                errorMessage = response.errors.avatar.join(", ");
              }

              this.popNotificationsService.error(
                this.translateService.instant(errorMessage)
              );
              return new UploadAvatarFailure({ error: response.errors });
            }
          }),
          catchError(error => {
            this.popNotificationsService.error(
              this.translateService.instant("Error uploading avatar")
            );
            this.loadingService.setLoading(false);
            return of(new UploadAvatarFailure({ error }));
          }),
          tap(() => {
            this.loadingService.setLoading(false);
          })
        )
      )
    )
  );

  DeleteAvatar: Observable<DeleteAvatarSuccess | DeleteAvatarFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActionTypes.DELETE_AVATAR),
      tap(() => {
        this.loadingService.setLoading(true);
      }),
      switchMap(() =>
        this.commonApiService.deleteAvatar().pipe(
          map(response => {
            if (response.success) {
              return new DeleteAvatarSuccess({ avatarUrl: "/assets/images/default-avatar.jpeg?v=2" });
            } else {
              // Handle error message properly for translation
              const errorMessage = response.detail ? response.detail : "Error deleting avatar";
              this.popNotificationsService.error(
                this.translateService.instant(errorMessage)
              );
              return new DeleteAvatarFailure({ error: response.detail });
            }
          }),
          catchError(error => {
            this.popNotificationsService.error(
              this.translateService.instant("Error deleting avatar")
            );
            this.loadingService.setLoading(false);
            return of(new DeleteAvatarFailure({ error }));
          }),
          tap(() => {
            this.loadingService.setLoading(false);
          })
        )
      )
    )
  );
}
