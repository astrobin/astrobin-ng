import { Component } from "@angular/core";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { UserSubscriptionInterface } from "@shared/interfaces/user-subscription.interface";
import { UserSubscriptionService } from "@shared/services/user-subscription/user-subscription.service";
import { Observable } from "rxjs";
import { map, take } from "rxjs/operators";

@Component({
  selector: "astrobin-subscriptions-view-subscriptions-page",
  templateUrl: "./subscriptions-view-subscriptions-page.component.html",
  styleUrls: ["./subscriptions-view-subscriptions-page.component.scss"]
})
export class SubscriptionsViewSubscriptionsPageComponent {
  userSubscriptions$: Observable<UserSubscriptionInterface[]> = this.store.pipe(
    take(1),
    map(state => state.auth.userSubscriptions.sort((a, b) => a.expires.localeCompare(b.expires)).reverse())
  );

  constructor(public readonly store: Store<State>, public readonly userSubscriptionService: UserSubscriptionService) {}
}
