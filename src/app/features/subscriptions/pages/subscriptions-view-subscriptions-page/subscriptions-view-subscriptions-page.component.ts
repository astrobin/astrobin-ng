import { Component, OnInit } from "@angular/core";
import { UserSubscriptionInterface } from "@shared/interfaces/user-subscription.interface";
import { AppContextService } from "@shared/services/app-context/app-context.service";
import { UserSubscriptionService } from "@shared/services/user-subscription/user-subscription.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "astrobin-subscriptions-view-subscriptions-page",
  templateUrl: "./subscriptions-view-subscriptions-page.component.html",
  styleUrls: ["./subscriptions-view-subscriptions-page.component.scss"]
})
export class SubscriptionsViewSubscriptionsPageComponent implements OnInit {
  userSubscriptions$: Observable<UserSubscriptionInterface[]> = this.appContextService.context$.pipe(
    map(context => context.currentUserSubscriptions.sort((a, b) => a.expires.localeCompare(b.expires)).reverse())
  );

  constructor(
    public readonly appContextService: AppContextService,
    public readonly userSubscriptionService: UserSubscriptionService
  ) {}

  ngOnInit(): void {}
}
