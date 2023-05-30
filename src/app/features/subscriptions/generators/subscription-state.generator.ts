import { SubscriptionsState } from "@features/subscriptions/store/subscriptions.reducers";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import { RecurringUnit } from "@features/subscriptions/types/recurring.unit";

export class SubscriptionsStateGenerator {
  static default(): SubscriptionsState {
    return {
      availableSubscriptions: {
        nonAutorenewingSupported: false,
        subscriptions: [
          {
            name: "lite",
            displayName: "Lite"
          },
          {
            name: "premium",
            displayName: "Premium"
          },
          {
            name: "ultimate",
            displayName: "Ultimate"
          }
        ]
      },
      pricing: {
        [PayableProductInterface.LITE]: { [RecurringUnit.MONTHLY]: null, [RecurringUnit.YEARLY]: null },
        [PayableProductInterface.PREMIUM]: { [RecurringUnit.MONTHLY]: null, [RecurringUnit.YEARLY]: null },
        [PayableProductInterface.ULTIMATE]: { [RecurringUnit.MONTHLY]: null, [RecurringUnit.YEARLY]: null }
      }
    };
  }
}
