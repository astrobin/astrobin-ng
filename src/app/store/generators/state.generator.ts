import { AppStateGenerator } from "@app/store/generators/app-state.generator";
import { MainState } from "@app/store/state";
import { AuthStateGenerator } from "@features/account/generators/auth-state.generator";
import { EquipmentStateGenerator } from "@features/equipment/generators/equipment-state.generator";
import { NotificationStateGenerator } from "@features/notifications/generators/notification-state.generator";
import { SearchStateGenerator } from "@features/search/generators/search-state.generator";
import { SubscriptionsStateGenerator } from "@features/subscriptions/generators/subscription-state.generator";

export class StateGenerator {
  static default(): MainState {
    return {
      app: AppStateGenerator.default(),
      auth: AuthStateGenerator.default(),
      notifications: NotificationStateGenerator.default(),
      equipment: EquipmentStateGenerator.default(),
      search: SearchStateGenerator.default(),
      subscriptions: SubscriptionsStateGenerator.default()
    };
  }
}
