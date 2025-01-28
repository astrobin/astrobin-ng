import { NgModule } from "@angular/core";
import { ServerModule } from "@angular/platform-server";
import { AppModule } from "./app.module";
import { AppComponent } from "./app.component";
import { CookieBackendModule } from "ngx-cookie-backend";
import { CLIENT_IP } from "@app/client-ip.injector";
import { StoreTransferService } from "@core/services/store-transfer.service";

@NgModule({
  imports: [
    AppModule,
    ServerModule,
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
