import { Component, OnInit } from "@angular/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { TitleService } from "@shared/services/title/title.service";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "@shared/services/auth.service";

@Component({
  selector: "astrobin-logging-out-page",
  templateUrl: "./logging-in-page.component.html"
})
export class LoggingInPageComponent extends BaseComponentDirective implements OnInit {
  title: string;

  constructor(
    public readonly store$: Store<State>,
    public readonly titleService: TitleService,
    public readonly translate: TranslateService,
    public readonly route: ActivatedRoute,
    public readonly authService: AuthService
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();

    this.title = this.translate.instant("Logging you in securely...");
    this.titleService.setTitle(this.title);
    this.store$.dispatch(new SetBreadcrumb({ breadcrumb: [{ label: "Account" }, { label: this.title }] }));
    this.authService.redirectToBackendLogin(this.route.snapshot.queryParamMap.get("redirectUrl"));
  }
}
