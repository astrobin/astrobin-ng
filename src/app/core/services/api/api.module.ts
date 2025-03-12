import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { AuthInterceptor } from "../auth.interceptor";
import { AuthClassicApiService } from "./classic/auth/auth-classic-api.service";
import { CommonApiService } from "./classic/common/common-api.service";
import { ServerErrorsInterceptor } from "@core/services/server-errors.interceptor";
import { TranslateService } from "@ngx-translate/core";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { LoadingService } from "@core/services/loading.service";
import { JsonApiService } from "@core/services/api/classic/json/json-api.service";
import { AuthService } from "@core/services/auth.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { TransferStateInterceptor } from "@core/services/transfer-state.interceptor";
import { DebugCountryInterceptor } from "@core/services/debug-country.interceptor";
import { ClientIpInterceptor } from "@core/services/client-ip.interceptor";
import { TransferState } from "@angular/platform-browser";
import { TimeoutRetryInterceptor } from "@core/services/timeout-retry.interceptor";
import { HttpRetryService } from "@core/services/http-retry.service";

@NgModule({
  imports: [HttpClientModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TimeoutRetryInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ServerErrorsInterceptor,
      deps: [
        WindowRefService,
        TranslateService,
        PopNotificationsService,
        LoadingService,
        AuthService,
        UtilsService,
        HttpRetryService
      ],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: DebugCountryInterceptor,
      deps: [WindowRefService],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ClientIpInterceptor,
      deps: [TransferState],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TransferStateInterceptor,
      multi: true
    },
    AuthClassicApiService,
    CommonApiService,
    JsonApiService
  ]
})
export class ApiModule {
}
