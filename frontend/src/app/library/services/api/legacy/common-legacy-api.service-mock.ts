import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { SubscriptionModel } from "@lib/models/common/subscription.model";
import { UserProfileModel } from "@lib/models/common/userprofile.model";
import { UserModel } from "@lib/models/common/user.model";
import { UserSubscriptionModel } from "@lib/models/common/usersubscription.model";
import { CommonLegacyApiService } from "./common-legacy-api.service";

@Injectable({
  providedIn: "root",
})
export class CommonLegacyApiServiceMock extends CommonLegacyApiService {
  getUser(id: number): Observable<UserModel> {
    return of(null);
  }

  getCurrentUserProfile(): Observable<UserProfileModel> {
    return of(null);
  }

  isAuthenticated(): Observable<boolean> {
    return of(false);
  }

  getSubscriptions(): Observable<SubscriptionModel[]> {
    return of(null);
  }

  getUserSubscriptions(user?: UserModel): Observable<UserSubscriptionModel[]> {
    return of([]);
  }
}
