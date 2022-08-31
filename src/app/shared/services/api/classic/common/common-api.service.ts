import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { PaymentInterface } from "@shared/interfaces/payment.interface";
import { SubscriptionInterface } from "@shared/interfaces/subscription.interface";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { UserSubscriptionInterface } from "@shared/interfaces/user-subscription.interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import {
  BackendUserInterface,
  BackendUserProfileInterface,
  CommonApiAdaptorService
} from "@shared/services/api/classic/common/common-api-adaptor.service";
import { CommonApiServiceInterface } from "@shared/services/api/classic/common/common-api.service-interface";
import { LoadingService } from "@shared/services/loading.service";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { BaseClassicApiService } from "../base-classic-api.service";

@Injectable({
  providedIn: "root"
})
export class CommonApiService extends BaseClassicApiService implements CommonApiServiceInterface {
  configUrl = this.baseUrl + "/common";

  constructor(
    public loadingService: LoadingService,
    private http: HttpClient,
    public commonApiAdaptorService: CommonApiAdaptorService
  ) {
    super(loadingService);
  }

  getContentTypeById(id: ContentTypeInterface["id"]): Observable<ContentTypeInterface> {
    return this.http.get<ContentTypeInterface>(`${this.configUrl}/contenttypes/${id}/`);
  }

  getContentType(
    appLabel: ContentTypeInterface["appLabel"],
    model: ContentTypeInterface["model"]
  ): Observable<ContentTypeInterface | null> {
    return this.http
      .get<ContentTypeInterface[]>(`${this.configUrl}/contenttypes/?app_label=${appLabel}&model=${model}`)
      .pipe(
        map(response => {
          if (response.length === 0) {
            return null;
          }

          return response[0];
        })
      );
  }

  getUser(id: UserInterface["id"]): Observable<UserInterface> {
    return this.http
      .get<BackendUserInterface>(`${this.configUrl}/users/${id}/`)
      .pipe(map((user: BackendUserInterface) => this.commonApiAdaptorService.userFromBackend(user)));
  }

  getUserProfile(id: UserProfileInterface["id"]): Observable<UserProfileInterface> {
    return this.http
      .get<BackendUserProfileInterface>(`${this.configUrl}/userprofiles/${id}/`)
      .pipe(map((user: BackendUserProfileInterface) => this.commonApiAdaptorService.userProfileFromBackend(user)));
  }

  getUserProfileByUserId(userId: UserInterface["id"]): Observable<UserProfileInterface> {
    return this.http.get<BackendUserProfileInterface[]>(`${this.configUrl}/userprofiles/?user=${userId}`).pipe(
      map((userProfiles: BackendUserProfileInterface[]) =>
        userProfiles.map(userProfile => this.commonApiAdaptorService.userProfileFromBackend(userProfile))
      ),
      map(userProfiles => (!!userProfiles && userProfiles.length > 0 ? userProfiles[0] : null))
    );
  }

  findUserProfiles(q: string): Observable<UserProfileInterface[]> {
    return this.http
      .get<BackendUserProfileInterface[]>(`${this.configUrl}/userprofiles/?q=${q}`)
      .pipe(
        map((userProfiles: BackendUserProfileInterface[]) =>
          userProfiles.map(user => this.commonApiAdaptorService.userProfileFromBackend(user))
        )
      );
  }

  getCurrentUserProfile(): Observable<UserProfileInterface> {
    return this.http.get<BackendUserProfileInterface[]>(this.configUrl + "/userprofiles/current/").pipe(
      map(response => {
        if (response.length > 0) {
          return this.commonApiAdaptorService.userProfileFromBackend(response[0]);
        }

        return null;
      }),
      catchError(() => {
        return of(null);
      })
    );
  }

  updateUserProfile(
    userProfileId: UserProfileInterface["id"],
    data: Partial<UserProfileInterface>
  ): Observable<UserProfileInterface> {
    return this.http.put<UserProfileInterface>(this.configUrl + `/userprofiles/${userProfileId}/partial/`, data);
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

  getPayments(): Observable<PaymentInterface[]> {
    return this.http.get<PaymentInterface[]>(`${this.configUrl}/payments/`);
  }
}
