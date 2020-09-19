import { SubscriptionGenerator } from "@shared/generators/subscription.generator";
import { UserProfileGenerator } from "@shared/generators/user-profile.generator";
import { UserSubscriptionGenerator } from "@shared/generators/user-subscription.generator";
import { UserGenerator } from "@shared/generators/user.generator";
import { AppContextInterface } from "@shared/services/app-context/app-context.service";
import { TestConstants } from "@shared/test-constants";
import { SubscriptionName } from "@shared/types/subscription-name.type";

export class AppContextGenerator {
  static default(): AppContextInterface {
    return {
      languageCode: "en",
      currentUserProfile: UserProfileGenerator.userProfile(),
      currentUser: UserGenerator.user(),
      currentUserSubscriptions: [UserSubscriptionGenerator.userSubscription()],
      subscriptions: [
        SubscriptionGenerator.subscription(
          TestConstants.ASTROBIN_ULTIMATE_2020_ID,
          SubscriptionName.ASTROBIN_ULTIMATE_2020
        ),
        SubscriptionGenerator.subscription(
          TestConstants.ASTROBIN_PREMIUM_2020_ID,
          SubscriptionName.ASTROBIN_PREMIUM_2020
        ),
        SubscriptionGenerator.subscription(TestConstants.ASTROBIN_PREMIUM_ID, SubscriptionName.ASTROBIN_PREMIUM),
        SubscriptionGenerator.subscription(
          TestConstants.ASTROBIN_PREMIUM_AUTORENEW_ID,
          SubscriptionName.ASTROBIN_PREMIUM_AUTORENEW
        ),
        SubscriptionGenerator.subscription(TestConstants.ASTROBIN_LITE_2020_ID, SubscriptionName.ASTROBIN_LITE_2020),
        SubscriptionGenerator.subscription(TestConstants.ASTROBIN_LITE_ID, SubscriptionName.ASTROBIN_LITE),
        SubscriptionGenerator.subscription(
          TestConstants.ASTROBIN_LITE_AUTORENEW_ID,
          SubscriptionName.ASTROBIN_LITE_AUTORENEW
        )
      ]
    };
  }

  static anonymous(): AppContextInterface {
    const context = this.default();
    context.currentUserSubscriptions = [];
    context.currentUserProfile = undefined;
    context.currentUser = undefined;

    return context;
  }
}
