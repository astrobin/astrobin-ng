import { Constants } from "@shared/constants";
import { SubscriptionGenerator } from "@shared/generators/subscription.generator";
import { UserProfileGenerator } from "@shared/generators/user-profile.generator";
import { UserSubscriptionGenerator } from "@shared/generators/user-subscription.generator";
import { UserGenerator } from "@shared/generators/user.generator";
import { AppContextInterface } from "@shared/services/app-context.service";
import { TestConstants } from "@shared/test-constants";

export class AppContextGenerator {
  static appContext(): AppContextInterface {
    return {
      languageCode: "en",
      currentUserProfile: UserProfileGenerator.userProfile(),
      currentUser: UserGenerator.user(),
      currentUserSubscriptions: [UserSubscriptionGenerator.userSubscription()],
      subscriptions: [
        SubscriptionGenerator.subscription(TestConstants.ASTROBIN_PREMIUM_ID, Constants.ASTROBIN_PREMIUM),
        SubscriptionGenerator.subscription(
          TestConstants.ASTROBIN_PREMIUM_AUTORENEW_ID,
          Constants.ASTROBIN_PREMIUM_AUTORENEW
        ),
        SubscriptionGenerator.subscription(TestConstants.ASTROBIN_PREMIUM_2020_ID, Constants.ASTROBIN_PREMIUM_2020),
        SubscriptionGenerator.subscription(TestConstants.ASTROBIN_ULTIMATE_2020_ID, Constants.ASTROBIN_ULTIMATE_2020)
      ]
    };
  }
}
