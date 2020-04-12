import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { CommonClassicApiService } from "./classic/common-classic-api.service";
import { AuthClassicApiService } from "./classic/auth-classic-api.service";
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
    AuthClassicApiService,
    CommonClassicApiService,
  ],
})
export class ApiModule {
}
