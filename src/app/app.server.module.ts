import { NgModule } from "@angular/core";
import { ServerModule, ServerTransferStateModule } from "@angular/platform-server";
import { AppModule } from "./app.module";
import { AppComponent } from "./app.component";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { translateServerLoaderFactory } from "@app/translate-server-loader";
import { HttpClient } from "@angular/common/http";
import { CookieBackendModule } from "ngx-cookie-backend";
import { CLIENT_IP } from "@app/client-ip.injector";

@NgModule({
  imports: [
    AppModule,
    ServerModule,
    ServerTransferStateModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: translateServerLoaderFactory,
        deps: [HttpClient]
      }
    }),
    CookieBackendModule.forRoot()
  ],
  providers: [
    {
      provide: CLIENT_IP,
      useFactory: () => {
        return global["clientIp"];
      }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppServerModule {
}
