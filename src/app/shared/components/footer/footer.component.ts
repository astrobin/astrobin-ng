import { Component } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { environment } from "@env/environment";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { NotificationsService } from "@features/notifications/services/notifications.service";
import { Logout } from "@features/account/store/auth.actions";

@Component({
  selector: "astrobin-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.scss"]
})
export class FooterComponent extends BaseComponentDirective {
  constructor(
    public readonly store$: Store<State>,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly notificationsService: NotificationsService
  ) {
    super(store$);
  }

  get currentYear(): number {
    return new Date().getFullYear();
  }

  get version(): string {
    return environment.buildVersion;
  }

  logout($event) {
    $event.preventDefault();
    this.store$.dispatch(new Logout());
  }
}
