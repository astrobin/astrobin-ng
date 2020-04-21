import { SubscriptionInterface } from "@lib/interfaces/subscription.interface";
import { UserProfileInterface } from "@lib/interfaces/user-profile.interface";
import { UserSubscriptionInterface } from "@lib/interfaces/user-subscription.interface";
import { UserInterface } from "@lib/interfaces/user.interface";
import { Observable } from "rxjs";

export interface CommonApiServiceInterface {
  getUser(id: number): Observable<UserInterface>;

  getCurrentUserProfile(): Observable<UserProfileInterface>;

  getSubscriptions(): Observable<SubscriptionInterface[]>;

  getUserSubscriptions(user?: UserInterface): Observable<UserSubscriptionInterface[]>;
}
