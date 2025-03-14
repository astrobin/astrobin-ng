import { HttpClient, HttpHeaders, HttpRequest, HttpEvent, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ContentTypeInterface } from "@core/interfaces/content-type.interface";
import { PaymentInterface } from "@core/interfaces/payment.interface";
import { SubscriptionInterface } from "@core/interfaces/subscription.interface";
import { UserProfileInterface, UserProfileStatsInterface } from "@core/interfaces/user-profile.interface";
import { UserSubscriptionInterface } from "@core/interfaces/user-subscription.interface";
import { UserInterface } from "@core/interfaces/user.interface";
import { BackendTogglePropertyInterface, BackendUserInterface, BackendUserProfileInterface, CommonApiAdaptorService } from "@core/services/api/classic/common/common-api-adaptor.service";
import { CommonApiServiceInterface } from "@core/services/api/classic/common/common-api.service-interface";
import { LoadingService } from "@core/services/loading.service";
import { Observable, of } from "rxjs";
import { catchError, map, filter } from "rxjs/operators";
import { BaseClassicApiService } from "../base-classic-api.service";
import { TogglePropertyInterface } from "@core/interfaces/toggle-property.interface";
import { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import { ImageInterface } from "@core/interfaces/image.interface";
import { environment } from "@env/environment";

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
    return this.http.put<BackendUserProfileInterface>(
      this.configUrl + `/userprofiles/${userProfileId}/partial/`, data
    ).pipe(
      map(response => this.commonApiAdaptorService.userProfileFromBackend(response))
    );
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

  shadowBanUserProfile(userProfileId: UserProfileInterface["id"]): Observable<{ message?: string; detail?: string }> {
    return this.http.post<{ message?: string; detail?: string }>(
      this.configUrl + `/userprofiles/${userProfileId}/shadow-ban/`, {}
    );
  }

  removeShadowBanUserProfile(userProfileId: UserProfileInterface["id"]): Observable<{ message?: string; detail?: string }> {
    return this.http.post<{ message?: string; detail?: string }>(
      this.configUrl + `/userprofiles/${userProfileId}/remove-shadow-ban/`, {}
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

  getToggleProperties(params: Partial<TogglePropertyInterface>[]): Observable<TogglePropertyInterface[] | null> {
    if (!params.length) {
      return of(null);
    }

    // All params in a group will have the same content type and property type
    const contentType = params[0].contentType;
    const propertyType = params[0].propertyType;
    const userIds = Array.from(new Set(params.map(item => item.user))).join(',');
    const objectIds = params.map(item => item.objectId).join(',');

    return this.http
      .get<PaginatedApiResultInterface<BackendTogglePropertyInterface>>(
        `${this.configUrl}/toggleproperties/?` +
        `property_type=${propertyType}&` +
        `user_id__in=${userIds}&` +
        `content_type=${contentType}&` +
        `object_id__in=${objectIds}`
      )
      .pipe(
        map(response => {
          if (response.results.length > 0) {
            return response.results.map(result =>
              this.commonApiAdaptorService.togglePropertyFromBackend(result)
            );
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

  /**
   * Upload a new avatar for the current user
   * @param avatarFile The image file to upload as avatar
   * @returns Observable with the response containing success status and new avatar URL
   */
  uploadAvatar(avatarFile: File): Observable<{ success: boolean; avatar_url: string; errors?: any }> {
    const formData = new FormData();
    formData.append('file', avatarFile);

    const httpOptions = {
      headers: new HttpHeaders({
        // Unsetting the Content-Type is necessary, so it gets set to multipart/form-data with the correct boundary.
        "Content-Type": "__unset__",
        "Content-Disposition": `form-data; name="file"; filename=${encodeURIComponent(avatarFile.name)}`
      })
    };

    return this.http.post<{ success: boolean; avatar_url: string; errors?: any }>(
      `${this.configUrl}/users/avatar/add/`,
      formData,
      httpOptions
    );
  }

  /**
   * Delete all avatars for the current user
   * @returns Observable with the response containing success status
   */
  deleteAvatar(): Observable<{ success: boolean; detail?: string }> {
    return this.http.delete<{ success: boolean; detail?: string }>(
      `${environment.classicApiUrl}/api/v2/common/users/avatar/delete/`
    );
  }
}
