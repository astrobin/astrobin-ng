import { Injectable } from "@angular/core";
import { BehaviorSubject, forkJoin, Observable, of } from "rxjs";
import { flatMap, share } from "rxjs/operators";
import { SubscriptionModel } from "../models/common/subscription.model";
import { UserProfileModel } from "../models/common/userprofile.model";
import { CommonLegacyApiService } from "./api/legacy/common-legacy-api.service";

export interface IAppContext {
  currentUserProfile: UserProfileModel;
  subscriptions: SubscriptionModel[];
}

@Injectable({
  providedIn: "root",
})
export class AppContextService {
  private _subject = new BehaviorSubject<IAppContext>(undefined);

  private _appContext = {} as IAppContext;

  private _getCurrentUserProfile$ = this.commonApi.getCurrentUserProfile().pipe(share());

  private _getCurrentUser$ = this._getCurrentUserProfile$.pipe(
    flatMap(userProfile => {
      if (userProfile !== null) {
        return this.commonApi.getUser(userProfile.user);
      }

      return of(null);
    }),
    share());

  private _getUserSubscriptions$ = this._getCurrentUser$.pipe(
    flatMap(user => {
      if (user !== null) {
        return this.commonApi.getUserSubscriptions(user);
      }

      return of(null);
    }),
    share());

  private _getSubscriptions$ = this.commonApi.getSubscriptions().pipe(share());

  constructor(public commonApi: CommonLegacyApiService) {
  }

  load(): Promise<any> {
    return new Promise<any>((resolve) => {
      forkJoin([
        this._getCurrentUserProfile$,
        this._getCurrentUser$,
        this._getUserSubscriptions$,
        this._getSubscriptions$,
      ]).subscribe((results) => {
        const userProfile: UserProfileModel = {
          ...results[0],
          ...{ userObject: results[1] },
          ...{ userSubscriptionObjects: results[2] },
        };

        this._appContext = {
          currentUserProfile: userProfile,
          subscriptions: results[3],
        };

        this._subject.next(this._appContext);

        resolve(this);
      });
    });
  }

  get(): Observable<IAppContext> {
    return this._subject.asObservable();
  }
}
