import { PipeTransform, Pipe } from "@angular/core";
import { UserProfileInterface } from "@core/interfaces/user-profile.interface";
import { UserSubscriptionService } from "@core/services/user-subscription/user-subscription.service";
import { SubscriptionName } from "@core/types/subscription-name.type";
import { Observable } from "rxjs";

@Pipe({
  name: "hasValidUserSubscription"
})
export class HasValidUserSubscriptionPipe implements PipeTransform {
  constructor(public userSubscriptionService: UserSubscriptionService) {}

  transform(userProfile: UserProfileInterface, subscriptionNames: SubscriptionName[]): Observable<boolean> {
    return this.userSubscriptionService.hasValidSubscription$(userProfile, subscriptionNames);
  }
}
