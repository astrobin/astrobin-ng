export interface StripeSubscriptionInterface {
  name: string;
  displayName: string;
  productId: string;
  yearlyPriceId: string;
  monthlyPriceId: string | null;
}

