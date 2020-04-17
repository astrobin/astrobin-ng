import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { routes } from "@features/notifications/notifications.routing";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { ComponentsModule } from "@lib/components/components.module";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { TranslateModule } from "@ngx-translate/core";
import { TimeAgoPipe } from "time-ago-pipe";
import { NotificationsPageComponent } from "./pages/notifications-page/notifications-page.component";
import { NormalizeNotificationLinkPipe } from "./pipes/normalize-notification-link.pipe";

@NgModule({
  declarations: [NormalizeNotificationLinkPipe, NotificationsPageComponent, TimeAgoPipe],
  imports: [
    CommonModule,
    FontAwesomeModule,
    NgbModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
    ComponentsModule
  ]
})
export class NotificationsModule {}
