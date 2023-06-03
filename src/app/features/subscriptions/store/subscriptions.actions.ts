/* eslint-disable max-classes-per-file */

import { PayloadActionInterface } from "@app/store/actions/payload-action.interface";
import { Action } from "@ngrx/store";
import { AvailableSubscriptionsInterface } from "@features/subscriptions/interfaces/available-subscriptions.interface";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import { RecurringUnit } from "@features/subscriptions/types/recurring.unit";
import { PricingInterface } from "@features/subscriptions/interfaces/pricing.interface";

export enum SubscriptionsActionTypes {
  GET_AVAILABLE_SUBSCRIPTIONS = "[Subscriptions] Get available subscriptions",
  GET_AVAILABLE_SUBSCRIPTIONS_SUCCESS = "[Subscriptions] Get available subscriptions success",

  GET_PRICING = "[Subscriptions] Get pricing",
  GET_PRICING_SUCCESS = "[Subscriptions] Get pricing success",
}

export class GetAvailableSubscriptions implements Action {
  readonly type = SubscriptionsActionTypes.GET_AVAILABLE_SUBSCRIPTIONS;
}

export class GetAvailableSubscriptionsSuccess implements PayloadActionInterface {
  readonly type = SubscriptionsActionTypes.GET_AVAILABLE_SUBSCRIPTIONS_SUCCESS;

  constructor(public payload: { availableSubscriptions: AvailableSubscriptionsInterface }) {
  }
}

export class GetPricing implements Action {
  readonly type = SubscriptionsActionTypes.GET_PRICING;

  constructor(public payload: { product: PayableProductInterface; recurringUnit: RecurringUnit }) {
  }
}

export class GetPricingSuccess implements PayloadActionInterface {
  readonly type = SubscriptionsActionTypes.GET_PRICING_SUCCESS;

  constructor(
    public payload: {
      product: PayableProductInterface;
      recurringUnit: RecurringUnit;
      pricing: PricingInterface;
    }
  ) {
  }
}

export type All = GetAvailableSubscriptions | GetAvailableSubscriptionsSuccess | GetPricing | GetPricingSuccess;
