import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { CommonLegacyApiService } from "./legacy/common-legacy-api.service";
import { AuthLegacyApiService } from "./legacy/auth-legacy-api.service";
import { AuthInterceptor } from "../auth.interceptor";

@NgModule({
  imports: [
    HttpClientModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    AuthLegacyApiService,
    CommonLegacyApiService,
  ],
})
export class ApiModule {
}
