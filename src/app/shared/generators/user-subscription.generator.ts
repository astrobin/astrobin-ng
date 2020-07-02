import { UserSubscriptionInterface } from "@shared/interfaces/user-subscription.interface";

export class UserSubscriptionGenerator {
  static userSubscription(): UserSubscriptionInterface {
    return {
      id: 1,
      valid: true,
      expires: null,
      active: true,
      cancelled: false,
      user: 1,
      subscription: 1
    };
  }
}
