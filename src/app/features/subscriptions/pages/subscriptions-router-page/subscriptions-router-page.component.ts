import { Component, OnInit } from "@angular/core";
import { AuthService } from "@shared/services/auth.service";
import { Location } from "@angular/common";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { Observable } from "rxjs";
import { AvailableSubscriptionsInterface } from "@features/subscriptions/interfaces/available-subscriptions.interface";
import { selectAvailableSubscriptions } from "@features/subscriptions/store/subscriptions.selectors";
import { GetAvailableSubscriptions } from "@features/subscriptions/store/subscriptions.actions";
import { SubscriptionsService } from "@features/subscriptions/services/subscriptions.service";
import { NavigationEnd, Router } from "@angular/router";
import { InitializeAuth } from "@features/account/store/auth.actions";

@Component({
  selector: "astrobin-subscriptions-router-page",
  templateUrl: "./subscriptions-router-page.component.html",
  styleUrls: ["./subscriptions-router-page.component.scss"]
})
export class SubscriptionsRouterPageComponent extends BaseComponentDirective implements OnInit {
  active: string;
  availableSubscriptions$: Observable<AvailableSubscriptionsInterface> =
    this.store$.select(selectAvailableSubscriptions);

  constructor(
    public readonly store$: Store<State>,
    public readonly authService: AuthService,
    public readonly location: Location,
    public readonly subscriptionService: SubscriptionsService,
    public readonly router: Router
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.store$.dispatch(new GetAvailableSubscriptions());

    this.router.events?.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const path = this.location.path();

        if (path === "/subscriptions/options") {
          this.active = "options";
        } else if (path === "/subscriptions/view") {
          this.active = "view";
        } else if (path === "/subscriptions/payments") {
          this.active = "payments";
        } else if (path === "/subscriptions/lite") {
          this.active = "lite";
        } else if (path === "/subscriptions/premium") {
          this.active = "premium";
        } else if (path === "/subscriptions/ultimate") {
          this.active = "ultimate";
        }

        this.store$.dispatch(new InitializeAuth());
      }
    });
  }
}
