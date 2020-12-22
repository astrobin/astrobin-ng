import { Injectable } from "@angular/core";
import {
  All,
  AppActionTypes,
  InitializeAppSuccess,
  LoadCameraSuccess,
  LoadTelescopeSuccess
} from "@app/store/actions/app.actions";
import { setTimeagoIntl } from "@app/translate-loader";
import { Actions, Effect, ofType } from "@ngrx/effects";
import { TranslateService } from "@ngx-translate/core";
import { CommonApiService } from "@shared/services/api/classic/common/common-api.service";
import { CameraApiService } from "@shared/services/api/classic/gear/camera/camera-api.service";
import { TelescopeApiService } from "@shared/services/api/classic/gear/telescope/telescope-api.service";
import { JsonApiService } from "@shared/services/api/classic/json/json-api.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { TimeagoIntl } from "ngx-timeago";
import { forkJoin, Observable, of } from "rxjs";
import { map, switchMap } from "rxjs/operators";

@Injectable()
export class AppEffects {
  @Effect()
  InitializeApp: Observable<InitializeAppSuccess> = this.actions$.pipe(
    ofType(AppActionTypes.INITIALIZE),
    switchMap(() => {
      // @ts-ignore
      let language = this.windowRef.nativeWindow.navigator.language || "en";
      if (language.indexOf("-") > -1) {
        language = language.split("-")[0];
      }

      const subscriptions$ = this.commonApiService.getSubscriptions();
      const language$ = of(language);
      const backendConfig$ = this.jsonApiService.getBackendConfig();

      return forkJoin([language$, subscriptions$, backendConfig$, this.translate.use(language)]).pipe(
        map(results => {
          this.translate.setDefaultLang(language);
          setTimeagoIntl(this.timeagoIntl, language);
          return new InitializeAppSuccess({
            language: results[0],
            subscriptions: results[1],
            backendConfig: results[2]
          });
        })
      );
    })
  );

  @Effect({ dispatch: false })
  InitializeAppSuccess: Observable<void> = this.actions$.pipe(ofType(AppActionTypes.INITIALIZE_SUCCESS));

  @Effect()
  LoadTelescope: Observable<LoadTelescopeSuccess> = this.actions$.pipe(
    ofType(AppActionTypes.LOAD_TELESCOPE),
    map(action => action.payload),
    switchMap(payload =>
      this.telescopeApiService.getTelescope(payload).pipe(map(telescope => new LoadTelescopeSuccess(telescope)))
    )
  );

  @Effect({ dispatch: false })
  LoadTelescopeSuccess: Observable<void> = this.actions$.pipe(ofType(AppActionTypes.LOAD_TELESCOPE_SUCCESS));

  @Effect()
  LoadCamera: Observable<LoadCameraSuccess> = this.actions$.pipe(
    ofType(AppActionTypes.LOAD_CAMERA),
    map(action => action.payload),
    switchMap(payload => this.cameraApiService.getCamera(payload).pipe(map(camera => new LoadCameraSuccess(camera))))
  );

  @Effect({ dispatch: false })
  LoadCameraSuccess: Observable<void> = this.actions$.pipe(ofType(AppActionTypes.LOAD_CAMERA_SUCCESS));

  constructor(
    public readonly actions$: Actions<All>,
    public readonly commonApiService: CommonApiService,
    public readonly jsonApiService: JsonApiService,
    public readonly telescopeApiService: TelescopeApiService,
    public readonly cameraApiService: CameraApiService,
    public readonly translate: TranslateService,
    public readonly timeagoIntl: TimeagoIntl,
    public readonly windowRef: WindowRefService
  ) {}
}
