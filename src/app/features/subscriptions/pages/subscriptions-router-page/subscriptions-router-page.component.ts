import type { Location } from "@angular/common";
import type { OnInit } from "@angular/core";
import { Component } from "@angular/core";
import type { Router } from "@angular/router";
import { NavigationEnd } from "@angular/router";
import type { MainState } from "@app/store/state";
import type { AuthService } from "@core/services/auth.service";
import { InitializeAuth } from "@features/account/store/auth.actions";
import type { AvailableSubscriptionsInterface } from "@features/subscriptions/interfaces/available-subscriptions.interface";
import type { SubscriptionsService } from "@features/subscriptions/services/subscriptions.service";
import { GetAvailableSubscriptions } from "@features/subscriptions/store/subscriptions.actions";
import { selectAvailableSubscriptions } from "@features/subscriptions/store/subscriptions.selectors";
import type { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import type { Observable } from "rxjs";

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
    public readonly store$: Store<MainState>,
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
