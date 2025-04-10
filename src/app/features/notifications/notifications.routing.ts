import { Routes } from "@angular/router";
import { AuthGuardService } from "@core/services/guards/auth-guard.service";
import { NotificationsPageComponent } from "@features/notifications/pages/notifications-page/notifications-page.component";
import { SettingsPageComponent } from "@features/notifications/pages/settings-page/settings-page.component";

export const notificationRoutes: Routes = [
  {
    path: "",
    component: NotificationsPageComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: "settings",
    component: SettingsPageComponent,
    canActivate: [AuthGuardService]
  }
];
