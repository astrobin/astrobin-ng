import type { PipeTransform } from "@angular/core";
import { Pipe } from "@angular/core";
import type { NotificationInterface } from "@features/notifications/interfaces/notification.interface";
import { NotificationContext } from "@features/notifications/interfaces/notification.interface";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";

@Pipe({
  name: "notificationContextIcon",
  pure: true
})
export class NotificationContextIconPipe implements PipeTransform {
  transform(notification: NotificationInterface): IconProp | null {
    if (!notification || !notification.extraTags) {
      return "bell";
    }

    const extraTags = JSON.parse(notification.extraTags);
    const context = extraTags.context as NotificationContext;

    const iconMap: Record<NotificationContext, IconProp> = {
      [NotificationContext.SUBSCRIPTIONS]: "dollar",
      [NotificationContext.API]: "code",
      [NotificationContext.AUTHENTICATION]: "key",
      [NotificationContext.USER]: "user",
      [NotificationContext.GROUPS]: "users",
      [NotificationContext.FORUM]: "comments",
      [NotificationContext.MARKETPLACE]: "shopping-cart",
      [NotificationContext.IOTD]: "trophy",
      [NotificationContext.EQUIPMENT]: "camera",
      [NotificationContext.IMAGE]: "image"
    };

    try {
      return iconMap[context];
    } catch (e) {
      return "bell";
    }
  }
}
