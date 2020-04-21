import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { SubscriptionInterface } from "@lib/interfaces/subscription.interface";
import { UserProfileInterface } from "@lib/interfaces/user-profile.interface";
import { UserSubscriptionInterface } from "@lib/interfaces/user-subscription.interface";
import { UserInterface } from "@lib/interfaces/user.interface";
import {
  BackendUserInterface,
  BackendUserProfileInterface,
  CommonApiAdaptorService
} from "@lib/services/api/classic/common/common-api-adaptor.service";
import { CommonApiServiceInterface } from "@lib/services/api/classic/common/common-api.service-interface";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { BaseClassicApiService } from "../base-classic-api.service";

@Injectable({
  providedIn: "root"
})
export class CommonApiService extends BaseClassicApiService implements CommonApiServiceInterface {
  configUrl = this.baseUrl + "/common";

  constructor(private http: HttpClient, public commonApiAdaptorService: CommonApiAdaptorService) {
    super();
  }

  getUser(id: number): Observable<UserInterface> {
    return this.http
      .get<BackendUserInterface>(`${this.configUrl}/users/${id}/`)
      .pipe(map((user: BackendUserInterface) => this.commonApiAdaptorService.userFromBackend(user)));
  }

  getCurrentUserProfile(): Observable<UserProfileInterface> {
    return this.http.get<BackendUserProfileInterface[]>(this.configUrl + "/userprofiles/current/").pipe(
      map(response => {
        if (response.length > 0) {
          return this.commonApiAdaptorService.userProfileFromBackend(response[0]);
        }

        return null;
      })
    );
  }

  getSubscriptions(): Observable<SubscriptionInterface[]> {
    return this.http.get<SubscriptionInterface[]>(`${this.configUrl}/subscriptions/`);
  }

  getUserSubscriptions(user?: UserInterface): Observable<UserSubscriptionInterface[]> {
    let url = `${this.configUrl}/usersubscriptions/`;
    if (user) {
      url += `?user=${user.id}`;
    }

    return this.http.get<UserSubscriptionInterface[]>(url);
  }
}
