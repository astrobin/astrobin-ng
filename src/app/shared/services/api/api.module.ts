import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { AuthInterceptor } from "../auth.interceptor";
import { AuthClassicApiService } from "./classic/auth/auth-classic-api.service";
import { CommonApiService } from "./classic/common/common-api.service";
import { ServerErrorsInterceptor } from "@shared/services/server-errors.interceptor";
import { TranslateService } from "@ngx-translate/core";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { LoadingService } from "@shared/services/loading.service";
import { JsonApiService } from "@shared/services/api/classic/json/json-api.service";
import { AuthService } from "@shared/services/auth.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { UtilsService } from "@shared/services/utils/utils.service";

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
      useClass: ServerErrorsInterceptor,
      deps: [WindowRefService, TranslateService, PopNotificationsService, LoadingService, AuthService, UtilsService],
      multi: true
    },
    AuthClassicApiService,
    CommonApiService,
    JsonApiService
  ]
})
export class ApiModule {}
