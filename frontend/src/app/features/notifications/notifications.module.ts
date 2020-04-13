import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NotificationsPageComponent } from "./notifications-page/notifications-page.component";
import { RouterModule } from "@angular/router";
import { routes } from "@features/notifications/notifications.routing";


@NgModule({
  declarations: [
    NotificationsPageComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
})
export class NotificationsModule {
}
