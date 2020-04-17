import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { AuthService } from "@lib/services/auth.service";
import { LoadingService } from "@lib/services/loading.service";
import { PopNotificationsService } from "@lib/services/pop-notifications.service";
import { UserService } from "@lib/services/user.service";
import { ApiModule } from "./api/api.module";
import { AppContextService } from "./app-context.service";
import { ClassicRoutesService } from "./classic-routes.service";

@NgModule({
  imports: [CommonModule, ApiModule],
  exports: [ApiModule],
  providers: [
    AppContextService,
    AuthService,
    ClassicRoutesService,
    LoadingService,
    PopNotificationsService,
    UserService
  ]
})
export class ServicesModule {}
