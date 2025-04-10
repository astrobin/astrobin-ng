import { OnInit, Component } from "@angular/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { MainState } from "@app/store/state";
import { UserSubscriptionInterface } from "@core/interfaces/user-subscription.interface";
import { TitleService } from "@core/services/title/title.service";
import { UserSubscriptionService } from "@core/services/user-subscription/user-subscription.service";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Observable } from "rxjs";
import { map, take } from "rxjs/operators";

@Component({
  selector: "astrobin-subscriptions-view-subscriptions-page",
  templateUrl: "./subscriptions-view-subscriptions-page.component.html",
  styleUrls: ["./subscriptions-view-subscriptions-page.component.scss"]
})
export class SubscriptionsViewSubscriptionsPageComponent extends BaseComponentDirective implements OnInit {
  userSubscriptions$: Observable<UserSubscriptionInterface[]> = this.store$.pipe(
    take(1),
    map(state =>
      state.auth.userSubscriptions
        .slice()
        .sort((a, b) => a.expires.localeCompare(b.expires))
        .reverse()
    )
  );

  constructor(
    public readonly store$: Store<MainState>,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly translate: TranslateService,
    public readonly titleService: TitleService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    const title = this.translate.instant("Your subscriptions");
    this.titleService.setTitle(title);
    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [{ label: "Subscriptions" }, { label: title }]
      })
    );
  }
}
