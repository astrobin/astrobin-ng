import { SubscriptionInterface } from "@shared/interfaces/subscription.interface";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { UserSubscriptionInterface } from "@shared/interfaces/user-subscription.interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import { Observable } from "rxjs";

export interface CommonApiServiceInterface {
  getUser(id: number): Observable<UserInterface>;

  getCurrentUserProfile(): Observable<UserProfileInterface>;

  getSubscriptions(): Observable<SubscriptionInterface[]>;

  getUserSubscriptions(user?: UserInterface): Observable<UserSubscriptionInterface[]>;
}
