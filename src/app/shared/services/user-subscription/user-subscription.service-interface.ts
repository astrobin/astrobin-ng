import { UserInterface } from "@shared/interfaces/user.interface";

export interface UserSubscriptionServiceInterface {
  isUltimateSubscriber(user: UserInterface): boolean;
}
