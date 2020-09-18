import { Injectable } from "@angular/core";
import { SubscriptionInterface } from "@shared/interfaces/subscription.interface";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { AppContextService } from "@shared/services/app-context/app-context.service";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { UserSubscriptionServiceInterface } from "@shared/services/user-subscription/user-subscription.service-interface";
import { SubscriptionName } from "@shared/types/subscription-name.type";
import { Observable } from "rxjs";
import { map, take } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class UserSubscriptionService extends BaseService implements UserSubscriptionServiceInterface {
  constructor(public loadingService: LoadingService, public appContextService: AppContextService) {
    super(loadingService);
  }

  hasValidSubscription(user: UserProfileInterface, subscriptionNames: SubscriptionName[]): Observable<boolean> {
    return this.appContextService.context$.pipe(
      take(1),
      map(appContext => {
        for (const subscriptionName of subscriptionNames) {
          const subscription: SubscriptionInterface = appContext.subscriptions.filter(
            s => s.name === subscriptionName
          )[0];

          if (
            appContext.currentUserSubscriptions.filter(userSubscription => {
              return userSubscription.subscription === subscription.id && userSubscription.valid;
            }).length > 0
          ) {
            return true;
          }
        }

        return false;
      })
    );
  }
}
