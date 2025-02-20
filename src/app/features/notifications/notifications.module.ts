import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { notificationRoutes } from "@features/notifications/notifications.routing";
import { SharedModule } from "@shared/shared.module";
import { NotificationsPageComponent } from "./pages/notifications-page/notifications-page.component";
import { SettingsPageComponent } from "./pages/settings-page/settings-page.component";

@NgModule({
  declarations: [
    NotificationsPageComponent,
    SettingsPageComponent
  ],
  imports: [RouterModule.forChild(notificationRoutes), SharedModule]
})
export class NotificationsModule {
}
