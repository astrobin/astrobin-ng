import { initialState, State } from "@features/account/store/auth.reducers";
import { UserProfileGenerator } from "@shared/generators/user-profile.generator";
import { UserSubscriptionGenerator } from "@shared/generators/user-subscription.generator";
import { UserGenerator } from "@shared/generators/user.generator";

export class AuthGenerator {
  static default(): State {
    return {
      initialized: true,
      user: UserGenerator.user(),
      userProfile: UserProfileGenerator.userProfile(),
      userSubscriptions: [UserSubscriptionGenerator.userSubscription()]
    };
  }

  static anonymous(): State {
    return initialState;
  }
}
