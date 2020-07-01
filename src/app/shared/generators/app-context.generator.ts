import { SubscriptionGenerator } from "@shared/generators/subscription.generator";
import { UserProfileGenerator } from "@shared/generators/user-profile.generator";
import { UserSubscriptionGenerator } from "@shared/generators/user-subscription.generator";
import { UserGenerator } from "@shared/generators/user.generator";
import { AppContextInterface } from "@shared/services/app-context.service";

export class AppContextGenerator {
  static appContext(): AppContextInterface {
    return {
      languageCode: "en",
      currentUserProfile: UserProfileGenerator.userProfile(),
      currentUser: UserGenerator.user(),
      currentUserSubscriptions: [UserSubscriptionGenerator.userSubscription()],
      subscriptions: [SubscriptionGenerator.subscription()]
    };
  }
}
