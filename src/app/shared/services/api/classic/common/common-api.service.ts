import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
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
import { UserStoreService } from "@shared/services/user-store.service";
import { Observable, of } from "rxjs";
import { map, mergeMap, tap, withLatestFrom } from "rxjs/operators";
import { BaseClassicApiService } from "../base-classic-api.service";

@Injectable({
  providedIn: "root"
})
export class CommonApiService extends BaseClassicApiService implements CommonApiServiceInterface {
  configUrl = this.baseUrl + "/common";

  constructor(
    public loadingService: LoadingService,
    public http: HttpClient,
    public commonApiAdaptorService: CommonApiAdaptorService,
    public userStore: UserStoreService
  ) {
    super(loadingService);
  }

  getUser(id: number): Observable<UserInterface> {
    if (this.userStore.getUser(id)) {
      return of(this.userStore.getUser(id));
    }

    return this.http.get<BackendUserInterface>(`${this.configUrl}/users/${id}/`).pipe(
      map(user => this.commonApiAdaptorService.userFromBackend(user)),
      tap(user => this.userStore.addUser(user))
    );
  }

  getUserProfile(id: number): Observable<UserProfileInterface> {
    if (this.userStore.getUserProfile(id)) {
      return of(this.userStore.getUserProfile(id));
    }

    return this.http.get<BackendUserProfileInterface>(`${this.configUrl}/userprofiles/${id}/`).pipe(
      map(userProfile => this.commonApiAdaptorService.userProfileFromBackend(userProfile)),
      tap(userProfile => this.userStore.addUserProfile(userProfile))
    );
  }

  resolveUser(id: number): Observable<{ user: UserInterface; userProfile: UserProfileInterface }> {
    const user$ = this.getUser(id);
    return user$.pipe(
      mergeMap(user => this.getUserProfile(user.userProfile)),
      withLatestFrom(user$),
      map(([userProfile, user]) => ({
        user,
        userProfile
      }))
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
      tap(userProfile => this.userStore.addUserProfile(userProfile))
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
