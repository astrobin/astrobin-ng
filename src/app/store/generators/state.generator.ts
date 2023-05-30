import { State } from "@app/store/state";
import { AppStateGenerator } from "@app/store/generators/app-state.generator";
import { AuthStateGenerator } from "@features/account/generators/auth-state.generator";
import { NotificationStateGenerator } from "@features/notifications/generators/notification-state.generator";
import { EquipmentStateGenerator } from "@features/equipment/generators/equipment-state.generator";
import { SubscriptionsStateGenerator } from "@features/subscriptions/generators/subscription-state.generator";

export class StateGenerator {
  static default(): State {
    return {
      app: AppStateGenerator.default(),
      auth: AuthStateGenerator.default(),
      notifications: NotificationStateGenerator.default(),
      equipment: EquipmentStateGenerator.default(),
      subscriptions: SubscriptionsStateGenerator.default()
    };
  }
}
