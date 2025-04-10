import type { OnInit } from "@angular/core";
import { Component } from "@angular/core";
import type { ActivatedRoute } from "@angular/router";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import type { MainState } from "@app/store/state";
import type { AuthService } from "@core/services/auth.service";
import type { TitleService } from "@core/services/title/title.service";
import type { Store } from "@ngrx/store";
import type { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-logging-out-page",
  templateUrl: "./logging-in-page.component.html"
})
export class LoggingInPageComponent extends BaseComponentDirective implements OnInit {
  title: string;

  constructor(
    public readonly store$: Store<MainState>,
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
