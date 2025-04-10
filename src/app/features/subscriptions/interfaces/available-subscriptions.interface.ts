import { StripeSubscriptionInterface } from "@features/subscriptions/interfaces/stripe-subscription.interface";

export interface AvailableSubscriptionsInterface {
  nonAutorenewingSupported: boolean;
  subscriptions: StripeSubscriptionInterface[];
}
