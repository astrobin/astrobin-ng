import { Injectable } from "@angular/core";
import { SubscriptionInterface } from "@lib/interfaces/subscription.interface";
import { UserProfileInterface } from "@lib/interfaces/user-profile.interface";
import { UserSubscriptionInterface } from "@lib/interfaces/user-subscription.interface";
import { UserInterface } from "@lib/interfaces/user.interface";
import { BehaviorSubject, forkJoin, Observable, of } from "rxjs";
import { flatMap, share } from "rxjs/operators";
import { CommonApiService } from "./api/classic/common/common-api.service";

export interface AppContextInterface {
  currentUserProfile: UserProfileInterface;
  currentUser: UserInterface;
  currentUserSubscriptions: UserSubscriptionInterface[];
  subscriptions: SubscriptionInterface[];
}

@Injectable({
  providedIn: "root"
})
export class AppContextService {
  private _subject = new BehaviorSubject<AppContextInterface>(undefined);

  private _appContext = {} as AppContextInterface;

  private _getCurrentUserProfile$ = this.commonApi
    .getCurrentUserProfile()
    .pipe(share());

  private _getCurrentUser$ = this._getCurrentUserProfile$.pipe(
    flatMap(userProfile => {
      if (userProfile !== null) {
        return this.commonApi.getUser(userProfile.user);
      }

      return of(null);
    }),
    share()
  );

  private _getUserSubscriptions$ = this._getCurrentUser$.pipe(
    flatMap(user => {
      if (user !== null) {
        return this.commonApi.getUserSubscriptions(user);
      }

      return of(null);
    }),
    share()
  );

  private _getSubscriptions$ = this.commonApi.getSubscriptions().pipe(share());

  constructor(public commonApi: CommonApiService) {}

  load(): Promise<any> {
    return new Promise<any>(resolve => {
      forkJoin([
        this._getCurrentUserProfile$,
        this._getCurrentUser$,
        this._getUserSubscriptions$,
        this._getSubscriptions$
      ]).subscribe(results => {
        this._appContext = {
          currentUserProfile: results[0],
          currentUser: results[1],
          currentUserSubscriptions: results[2],
          subscriptions: results[3]
        };

        this._subject.next(this._appContext);

        resolve(this);
      });
    });
  }

  get(): Observable<AppContextInterface> {
    return this._subject.asObservable();
  }
}
