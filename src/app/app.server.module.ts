import { HttpClient } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { ServerModule } from "@angular/platform-server";
import { CLIENT_IP } from "@app/client-ip.injector";
import { translateServerLoaderFactory } from "@app/translate-server-loader";
import type { StoreTransferService } from "@core/services/store-transfer.service";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { CookieBackendModule } from "ngx-cookie-backend";

import { AppComponent } from "./app.component";
import { AppModule } from "./app.module";

@NgModule({
  imports: [
    AppModule,
    ServerModule,
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
  constructor(storeTransferService: StoreTransferService) {
    storeTransferService.init();
  }
}
