import { UserSubscriptionInterface } from "@shared/interfaces/user-subscription.interface";
import { TestConstants } from "@shared/test-constants";

export class UserSubscriptionGenerator {
  static userSubscription(): UserSubscriptionInterface {
    return {
      id: 1,
      valid: true,
      expires: null,
      active: true,
      cancelled: false,
      user: 1,
      subscription: TestConstants.ASTROBIN_ULTIMATE_2020_ID
    };
  }
}
