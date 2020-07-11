import { UserSubscriptionInterface } from "@shared/interfaces/user-subscription.interface";
import { TestConstants } from "@shared/test-constants";

export class UserSubscriptionGenerator {
  static userSubscription(): UserSubscriptionInterface {
    return {
      id: TestConstants.ASTROBIN_ULTIMATE_2020_ID,
      valid: true,
      expires: null,
      active: true,
      cancelled: false,
      user: 1,
      subscription: 1
    };
  }
}
