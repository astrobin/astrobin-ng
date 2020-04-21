import { Injectable } from "@angular/core";
import { UserProfileGenerator } from "@lib/generators/user-profile.generator";
import { UserGenerator } from "@lib/generators/user.generator";
import { SubscriptionInterface } from "@lib/interfaces/subscription.interface";
import { UserProfileInterface } from "@lib/interfaces/user-profile.interface";
import { UserSubscriptionInterface } from "@lib/interfaces/user-subscription.interface";
import { UserInterface } from "@lib/interfaces/user.interface";
import { CommonApiServiceInterface } from "@lib/services/api/classic/common/common-api.service-interface";
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class CommonApiServiceMock implements CommonApiServiceInterface {
  getUser(id: number): Observable<UserInterface> {
    return of(UserGenerator.user());
  }

  getCurrentUserProfile(): Observable<UserProfileInterface> {
    return of(UserProfileGenerator.userProfile());
  }

  getSubscriptions(): Observable<SubscriptionInterface[]> {
    return of(null);
  }

  getUserSubscriptions(user?: UserInterface): Observable<UserSubscriptionInterface[]> {
    return of([]);
  }
}
