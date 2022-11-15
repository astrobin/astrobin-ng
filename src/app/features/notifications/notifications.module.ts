import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { routes } from "@features/notifications/notifications.routing";
import { NormalizeNotificationLinkPipe } from "@features/notifications/pipes/normalize-notification-link.pipe";
import { SharedModule } from "@shared/shared.module";
import { NotificationsPageComponent } from "./pages/notifications-page/notifications-page.component";
import { SettingsPageComponent } from "./pages/settings-page/settings-page.component";

@NgModule({
  declarations: [NormalizeNotificationLinkPipe, NotificationsPageComponent, SettingsPageComponent],
  imports: [RouterModule.forChild(routes), SharedModule]
})
export class NotificationsModule {
}
