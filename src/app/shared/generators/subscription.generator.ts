import { SubscriptionInterface } from "@core/interfaces/subscription.interface";
import { AuthGroupGenerator } from "@shared/generators/auth-group.generator";

export class SubscriptionGenerator {
  static subscription(id?: number, name?: string): SubscriptionInterface {
    return {
      id: id || 1,
      name: name || "Test subscription",
      description: "Description of test subscription",
      price: 99,
      currency: "CHF",
      trial_period: 0,
      trial_unit: null,
      recurrence_period: 0,
      recurrence_unit: null,
      category: "premium",
      group: AuthGroupGenerator.group()
    };
  }
}
