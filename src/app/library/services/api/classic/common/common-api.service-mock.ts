import { Injectable } from "@angular/core";
import { UserProfileGenerator } from "@lib/generators/user-profile.generator";
import { UserGenerator } from "@lib/generators/user.generator";
import { SubscriptionInterface } from "@lib/interfaces/subscription.interface";
import { UserProfileInterface } from "@lib/interfaces/user-profile.interface";
import { UserSubscriptionInterface } from "@lib/interfaces/user-subscription.interface";
import { UserInterface } from "@lib/interfaces/user.interface";
import { Observable, of } from "rxjs";
import { CommonApiService } from "./common-api.service";

@Injectable({
  providedIn: "root"
})
export class CommonClassicApiServiceMock extends CommonApiService {
  getUser(id: number): Observable<UserInterface> {
    return of(UserGenerator.user());
  }

  getCurrentUserProfile(): Observable<UserProfileInterface> {
    return of(UserProfileGenerator.userProfile());
  }

  isAuthenticated(): Observable<boolean> {
    return of(false);
  }

  getSubscriptions(): Observable<SubscriptionInterface[]> {
    return of(null);
  }

  getUserSubscriptions(
    user?: UserInterface
  ): Observable<UserSubscriptionInterface[]> {
    return of([]);
  }
}
