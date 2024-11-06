import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { PaymentInterface } from "@shared/interfaces/payment.interface";
import { SubscriptionInterface } from "@shared/interfaces/subscription.interface";
import { UserProfileInterface, UserProfileStatsInterface } from "@shared/interfaces/user-profile.interface";
import { UserSubscriptionInterface } from "@shared/interfaces/user-subscription.interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BackendTogglePropertyInterface, BackendUserInterface, BackendUserProfileInterface, CommonApiAdaptorService } from "@shared/services/api/classic/common/common-api-adaptor.service";
import { CommonApiServiceInterface } from "@shared/services/api/classic/common/common-api.service-interface";
import { LoadingService } from "@shared/services/loading.service";
import { Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { BaseClassicApiService } from "../base-classic-api.service";
import { TogglePropertyInterface } from "@shared/interfaces/toggle-property.interface";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { ImageInterface } from "@shared/interfaces/image.interface";

export interface FollowersInterface {
  followers: [
    UserInterface["id"],
    UserInterface["username"],
    UserProfileInterface["realName"]
  ][];
}

export interface FollowingInterface {
  following: [
    UserInterface["id"],
    UserInterface["username"],
    UserProfileInterface["realName"]
  ][];
}

export interface MutualFollowersInterface {
  "mutual-followers": [
    UserInterface["id"],
    UserInterface["username"],
    UserProfileInterface["realName"]
  ][];
}

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

  getUser(id?: UserInterface["id"], username?: UserInterface["username"]): Observable<UserInterface> {
    if (id) {
      return this.http.get<BackendUserInterface>(`${this.configUrl}/users/${id}/`).pipe(
        map((user: BackendUserInterface) => this.commonApiAdaptorService.userFromBackend(user))
      );
    }

    if (username) {
      const encodedUsername = encodeURIComponent(username);
      return this.http.get<BackendUserInterface[]>(`${this.configUrl}/users/?username=${encodedUsername}`).pipe(
        map((users: BackendUserInterface[]) =>
          users.map(user => this.commonApiAdaptorService.userFromBackend(user))
        ),
        map(users => (!!users && users.length > 0 ? users[0] : null))
      );
    }
  }

  emptyTrash(userId: UserInterface["id"]): Observable<void> {
    return this.http.post<void>(`${this.configUrl}/users/${userId}/empty-trash/`, {});
  }

  getUserProfile(id: UserProfileInterface["id"]): Observable<UserProfileInterface> {
    return this.http
      .get<BackendUserProfileInterface>(`${this.configUrl}/userprofiles/${id}/`)
      .pipe(map((user: BackendUserProfileInterface) => this.commonApiAdaptorService.userProfileFromBackend(user)));
  }

  getUserProfileStats(id: UserProfileInterface["id"]): Observable<UserProfileStatsInterface> {
    return this.http
      .get<UserProfileStatsInterface>(`${this.configUrl}/userprofiles/${id}/stats/`);
  }

  getUserProfileFollowers(id: UserProfileInterface["id"], q?: string): Observable<FollowersInterface> {
    let url = `${this.configUrl}/userprofiles/${id}/followers/`;

    if (q) {
      url += `?q=${q}`;
    }

    return this.http.get<FollowersInterface>(url);
  }

  getUserProfileFollowing(id: UserProfileInterface["id"], q?: string): Observable<FollowingInterface> {
    let url = `${this.configUrl}/userprofiles/${id}/following/`;

    if (q) {
      url += `?q=${q}`;
    }

    return this.http.get<FollowingInterface>(url);
  }

  getUserProfileMutualFollowers(id: UserProfileInterface["id"], q?: string): Observable<MutualFollowersInterface> {
    let url = `${this.configUrl}/userprofiles/${id}/mutual-followers/`;

    if (q) {
      url += `?q=${q}`;
    }

    return this.http.get<MutualFollowersInterface>(url);
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

  changeUserProfileGalleryHeaderImage(
    userProfileId: UserProfileInterface["id"],
    imageId: ImageInterface["hash"] | ImageInterface["pk"]
  ): Observable<UserProfileInterface> {
    return this.http.put<BackendUserProfileInterface>(
      this.configUrl + `/userprofiles/${userProfileId}/change-gallery-header-image/${imageId}/`,
      {}
    ).pipe(
      map(response => this.commonApiAdaptorService.userProfileFromBackend(response))
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

  getPayments(): Observable<PaymentInterface[]> {
    return this.http.get<PaymentInterface[]>(`${this.configUrl}/payments/`);
  }

  getToggleProperty(params: Partial<TogglePropertyInterface>): Observable<TogglePropertyInterface | null> {
    return this.http
      .get<PaginatedApiResultInterface<BackendTogglePropertyInterface>>(
        `${this.configUrl}/toggleproperties/?` +
        `property_type=${params.propertyType}&user_id=${params.user}&` +
        `content_type=${params.contentType}&object_id=${params.objectId}`
      )
      .pipe(
        map(response => {
          if (response.results.length > 0) {
            return this.commonApiAdaptorService.togglePropertyFromBackend(response.results[0]);
          }

          return null;
        })
      );
  }

  createToggleProperty(params: Partial<TogglePropertyInterface>): Observable<TogglePropertyInterface> {
    return this.http.post<BackendTogglePropertyInterface>(
      `${this.configUrl}/toggleproperties/`, this.commonApiAdaptorService.togglePropertyToBackend(params)
    ).pipe(
      map(response => this.commonApiAdaptorService.togglePropertyFromBackend(response))
    );
  }

  deleteToggleProperty(id: TogglePropertyInterface["id"]): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/toggleproperties/${id}/`);
  }
}
