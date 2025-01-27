import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { notificationRoutes } from "@features/notifications/notifications.routing";
import { NormalizeNotificationLinkPipe } from "@features/notifications/pipes/normalize-notification-link.pipe";
import { SharedModule } from "@shared/shared.module";
import { NotificationsPageComponent } from "./pages/notifications-page/notifications-page.component";
import { SettingsPageComponent } from "./pages/settings-page/settings-page.component";
import { NotificationsListComponent } from "@features/notifications/components/notifications-list/notifications-list.component";

@NgModule({
  declarations: [
    NormalizeNotificationLinkPipe,
    NotificationsListComponent,
    NotificationsPageComponent,
    SettingsPageComponent
  ],
  imports: [RouterModule.forChild(notificationRoutes), SharedModule],
  exports: [
    NotificationsListComponent
  ]
})
export class NotificationsModule {
}
