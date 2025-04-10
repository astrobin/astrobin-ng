import type { PipeTransform } from "@angular/core";
import { Pipe } from "@angular/core";
import type { UserProfileInterface } from "@core/interfaces/user-profile.interface";
import { UserSubscriptionService } from "@core/services/user-subscription/user-subscription.service";
import type { SubscriptionName } from "@core/types/subscription-name.type";
import type { Observable } from "rxjs";

@Pipe({
  name: "hasValidUserSubscription"
})
export class HasValidUserSubscriptionPipe implements PipeTransform {
  constructor(public userSubscriptionService: UserSubscriptionService) {}

  transform(userProfile: UserProfileInterface, subscriptionNames: SubscriptionName[]): Observable<boolean> {
    return this.userSubscriptionService.hasValidSubscription$(userProfile, subscriptionNames);
  }
}
