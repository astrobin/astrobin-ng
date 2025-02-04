import { Pipe, PipeTransform } from "@angular/core";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { NotificationContext, NotificationInterface } from "@features/notifications/interfaces/notification.interface";

@Pipe({
  name: "notificationContextIcon",
  pure: true
})
export class NotificationContextIconPipe implements PipeTransform {
  transform(notification: NotificationInterface): IconProp | null {
    let iconMap: Record<NotificationContext, IconProp>;

    if (!notification || !notification.extraTags) {
      return "bell";
    }

    const extraTags = JSON.parse(notification.extraTags);
    const context = extraTags.context as NotificationContext;

    iconMap = {
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
