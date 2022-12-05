import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { NotificationsApiService } from "@features/notifications/services/notifications-api.service";
import { EMPTY, Observable, of } from "rxjs";
import {
  LoadNotificationSettingsSuccess,
  LoadNotificationTypesSuccess,
  NotificationsActionTypes,
  SetNotificationSetting,
  SetNotificationSettingSuccess
} from "@features/notifications/store/notifications.actions";
import { catchError, map, mergeMap } from "rxjs/operators";
import {
  selectNotificationSettings,
  selectNotificationTypes
} from "@features/notifications/store/notifications.selectors";

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

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly notificationsApiService: NotificationsApiService
  ) {
  }
}
