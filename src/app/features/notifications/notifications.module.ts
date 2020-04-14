import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { routes } from "@features/notifications/notifications.routing";
import { NotificationsPageComponent } from "./notifications-page/notifications-page.component";

@NgModule({
  declarations: [NotificationsPageComponent],
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class NotificationsModule {}
