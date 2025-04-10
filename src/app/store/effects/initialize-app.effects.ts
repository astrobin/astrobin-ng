import { Injectable } from "@angular/core";
import type { All } from "@app/store/actions/app.actions";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { InitializeAppSuccess } from "@app/store/actions/initialize-app.actions";
import { setTimeagoIntl } from "@app/translate-loader";
import type { CommonApiService } from "@core/services/api/classic/common/common-api.service";
import type { JsonApiService } from "@core/services/api/classic/json/json-api.service";
import type { WindowRefService } from "@core/services/window-ref.service";
import { createEffect, ofType } from "@ngrx/effects";
import type { Actions } from "@ngrx/effects";
import type { TranslateService } from "@ngx-translate/core";
import type { TimeagoIntl } from "ngx-timeago";
import type { Observable } from "rxjs";
import { forkJoin, of } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";

@Injectable()
export class InitializeAppEffects {
  InitializeApp: Observable<InitializeAppSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.INITIALIZE),
      switchMap(() => {
        // @ts-ignore
        let language = this.windowRef.nativeWindow.navigator.language || "en";
        if (language.indexOf("-") > -1) {
          language = language.split("-")[0];
        }

        const subscriptions$ = this.commonApiService.getSubscriptions().pipe(catchError(() => of([])));
        const language$ = of(language);
        const backendConfig$ = this.jsonApiService.getBackendConfig();
        const requestCountry$ = this.jsonApiService.requestCountry();

        return forkJoin([
          language$,
          subscriptions$,
          backendConfig$,
          requestCountry$,
          this.translate.use(language)
        ]).pipe(
          map(results => {
            this.translate.setDefaultLang(language);
            setTimeagoIntl(this.timeagoIntl, language);
            return new InitializeAppSuccess({
              language: results[0],
              subscriptions: results[1],
              backendConfig: results[2],
              requestCountry: results[3]
            });
          })
        );
      })
    )
  );

  constructor(
    public readonly actions$: Actions<All>,
    public readonly commonApiService: CommonApiService,
    public readonly jsonApiService: JsonApiService,
    public readonly translate: TranslateService,
    public readonly timeagoIntl: TimeagoIntl,
    public readonly windowRef: WindowRefService
  ) {}
}
