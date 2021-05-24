import { State } from "@app/store/state";
import { AppStateGenerator } from "@app/store/generators/app-state.generator";
import { AuthStateGenerator } from "@features/account/generators/auth-state.generator";
import { NotificationStateGenerator } from "@features/notifications/generators/notification-state.generator";

export class StateGenerator {
  static default(): State {
    return {
      app: AppStateGenerator.default(),
      auth: AuthStateGenerator.default(),
      notifications: NotificationStateGenerator.default()
    };
  }
}
