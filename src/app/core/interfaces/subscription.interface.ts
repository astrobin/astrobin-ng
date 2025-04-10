import type { AuthGroupInterface } from "@core/interfaces/auth-group.interface";

export interface SubscriptionInterface {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  trial_period: number;
  trial_unit: string;
  recurrence_period: number;
  recurrence_unit: string;
  category: string;
  group: AuthGroupInterface;
}
