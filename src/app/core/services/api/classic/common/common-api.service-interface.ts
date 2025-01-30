import { PaymentInterface } from "@core/interfaces/payment.interface";
import { SubscriptionInterface } from "@core/interfaces/subscription.interface";
import { UserProfileInterface } from "@core/interfaces/user-profile.interface";
import { UserSubscriptionInterface } from "@core/interfaces/user-subscription.interface";
import { UserInterface } from "@core/interfaces/user.interface";
import { Observable } from "rxjs";

export interface CommonApiServiceInterface {
  getUser(id: number): Observable<UserInterface>;

  getCurrentUserProfile(): Observable<UserProfileInterface>;

  getSubscriptions(): Observable<SubscriptionInterface[]>;

  getUserSubscriptions(user?: UserInterface): Observable<UserSubscriptionInterface[]>;

  getPayments(): Observable<PaymentInterface[]>;
}
