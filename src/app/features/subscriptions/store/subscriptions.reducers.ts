import { All, SubscriptionsActionTypes } from "@features/subscriptions/store/subscriptions.actions";
import { AvailableSubscriptionsInterface } from "@features/subscriptions/interfaces/available-subscriptions.interface";
import { PricingInterface } from "@features/subscriptions/interfaces/pricing.interface";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import { RecurringUnit } from "@features/subscriptions/types/recurring.unit";

export interface SubscriptionsState {
  availableSubscriptions: AvailableSubscriptionsInterface;
  pricing: { [product: string]: { [recurringUnit: string]: PricingInterface } };
}

export const initialSubscriptionsState: SubscriptionsState = {
  availableSubscriptions: null,
  pricing: {
    [PayableProductInterface.LITE]: { [RecurringUnit.MONTHLY]: null, [RecurringUnit.YEARLY]: null },
    [PayableProductInterface.PREMIUM]: {
      [RecurringUnit.MONTHLY]: null,
      [RecurringUnit.YEARLY]: null
    },
    [PayableProductInterface.ULTIMATE]: {
      [RecurringUnit.MONTHLY]: null,
      [RecurringUnit.YEARLY]: null
    }
  }
};

export function reducer(state = initialSubscriptionsState, action: All): SubscriptionsState {
  switch (action.type) {
    case SubscriptionsActionTypes.GET_AVAILABLE_SUBSCRIPTIONS_SUCCESS:
      return {
        ...state,
        availableSubscriptions: action.payload.availableSubscriptions
      };

    case SubscriptionsActionTypes.GET_PRICING_SUCCESS:
      return {
        ...state,
        pricing: {
          ...state.pricing,
          [action.payload.product]: {
            ...state.pricing[action.payload.product],
            [action.payload.recurringUnit]: action.payload.pricing
          }
        }
      };

    default:
      return state;
  }
}
