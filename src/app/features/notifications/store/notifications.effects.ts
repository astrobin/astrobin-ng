import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { NotificationsApiService } from "@features/notifications/services/notifications-api.service";
import { EMPTY, Observable, of } from "rxjs";
import { GetUnreadCountFailure, GetUnreadCountSuccess, LoadNotifications, LoadNotificationSettingsSuccess, LoadNotificationsFailure, LoadNotificationsSuccess, LoadNotificationTypesSuccess, MarkAllAsReadFailure, MarkAllAsReadSuccess, MarkAsRead, MarkAsReadFailure, MarkAsReadSuccess, NotificationsActionTypes, SetNotificationSetting, SetNotificationSettingSuccess } from "@features/notifications/store/notifications.actions";
import { catchError, map, mergeMap, tap } from "rxjs/operators";
import { selectNotificationSettings, selectNotificationTypes } from "@features/notifications/store/notifications.selectors";
import { LoadingService } from "@core/services/loading.service";

@Injectable()
export class NotificationsEffects {
  LoadTypes: Observable<LoadNotificationTypesSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActionTypes.LOAD_TYPES),
      mergeMap(action =>
        this.store$.select(selectNotificationTypes).pipe(
          mergeMap(typesFromStore =>
            typesFromStore !== null
              ? of(typesFromStore).pipe(map(types => new LoadNotificationTypesSuccess({ types })))
              : this.notificationsApiService.getTypes().pipe(
                map(types => new LoadNotificationTypesSuccess({ types })),
                catchError(() => EMPTY)
              )
          )
        )
      )
    )
  );

  LoadSettings: Observable<LoadNotificationSettingsSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActionTypes.LOAD_SETTINGS),
      mergeMap(action =>
        this.store$.select(selectNotificationSettings).pipe(
          mergeMap(settingsFromStore =>
            settingsFromStore !== null
              ? of(settingsFromStore).pipe(map(settings => new LoadNotificationSettingsSuccess({ settings })))
              : this.notificationsApiService.getSettings().pipe(
                map(settings => new LoadNotificationSettingsSuccess({ settings })),
                catchError(() => EMPTY)
              )
          )
        )
      )
    )
  );

  SetSetting: Observable<SetNotificationSettingSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActionTypes.SET_SETTING),
      map((action: SetNotificationSetting) => action.payload),
      mergeMap(payload =>
        this.notificationsApiService.setSetting(payload.setting).pipe(
          map(setting => new SetNotificationSettingSuccess({ setting })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  LoadNotifications: Observable<LoadNotificationsSuccess | LoadNotificationsFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActionTypes.LOAD_NOTIFICATIONS),
      mergeMap((action: LoadNotifications) => {
        this.loadingService.setLoading(true);
        return this.notificationsApiService.getAll(action.payload.page, action.payload.read).pipe(
          map(response => new LoadNotificationsSuccess({
            notifications: response.results,
            total: response.count
          })),
          catchError(error => of(new LoadNotificationsFailure({ error: error.statusText })))
        );
      })
    )
  );

  LoadNotificationsSuccess: Observable<void> = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActionTypes.LOAD_NOTIFICATIONS_SUCCESS),
      tap(() => this.loadingService.setLoading(false))
    ), { dispatch: false }
  );

  LoadNotificationsFailure: Observable<void> = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActionTypes.LOAD_NOTIFICATIONS_FAILURE),
      tap(() => this.loadingService.setLoading(false))
    ), { dispatch: false }
  );

  GetUnreadCount: Observable<GetUnreadCountSuccess | GetUnreadCountFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActionTypes.GET_UNREAD_COUNT),
      mergeMap(() => {
        this.loadingService.setLoading(true);
        return this.notificationsApiService.getUnreadCount().pipe(
          map(count => new GetUnreadCountSuccess({ count })),
          catchError(error => of(new GetUnreadCountFailure({ error: error.statusText })))
        );
      })
    )
  );

  GetUnreadCountSuccess: Observable<void> = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActionTypes.GET_UNREAD_COUNT_SUCCESS),
      tap(() => this.loadingService.setLoading(false))
    ), { dispatch: false }
  );

  GetUnreadCountFailure: Observable<void> = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActionTypes.GET_UNREAD_COUNT_FAILURE),
      tap(() => this.loadingService.setLoading(false))
    ), { dispatch: false }
  );

  MarkAllAsRead: Observable<MarkAllAsReadSuccess | MarkAllAsReadFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActionTypes.MARK_ALL_AS_READ),
      mergeMap(() => {
        this.loadingService.setLoading(true);
        return this.notificationsApiService.markAllAsRead().pipe(
          map(() => new MarkAllAsReadSuccess()),
          catchError(error => of(new MarkAllAsReadFailure({ error: error.statusText })))
        );
      })
    )
  );

  MarkAllAsReadSuccess: Observable<void> = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActionTypes.MARK_ALL_AS_READ_SUCCESS),
      tap(() => this.loadingService.setLoading(false))
    ), { dispatch: false }
  );

  MarkAllAsReadFailure: Observable<void> = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActionTypes.MARK_ALL_AS_READ_FAILURE),
      tap(() => this.loadingService.setLoading(false))
    ), { dispatch: false }
  );

  MarkAsRead: Observable<MarkAsReadSuccess | MarkAsReadFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActionTypes.MARK_AS_READ),
      map((action: MarkAsRead) => action.payload),
      mergeMap(payload => {
        this.loadingService.setLoading(true);
        return this.notificationsApiService.markAsRead(payload.notificationId, payload.read).pipe(
          map(() => new MarkAsReadSuccess({ notificationId: payload.notificationId, read: payload.read })),
          catchError(error => of(new MarkAsReadFailure({
            notificationId: payload.notificationId,
            error: error.statusText
          })))
        );
      })
    )
  );

  MarkAsReadSuccess: Observable<void> = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActionTypes.MARK_AS_READ_SUCCESS),
      tap(() => this.loadingService.setLoading(false))
    ), { dispatch: false }
  );

  MarkAsReadFailure: Observable<void> = createEffect(() =>
    this.actions$.pipe(
      ofType(NotificationsActionTypes.MARK_AS_READ_FAILURE),
      tap(() => this.loadingService.setLoading(false))
    ), { dispatch: false }
  );

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly notificationsApiService: NotificationsApiService,
    public readonly loadingService: LoadingService
  ) {
  }
}
