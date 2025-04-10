import type { OnInit } from "@angular/core";
import { Component } from "@angular/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import type { MainState } from "@app/store/state";
import type { TitleService } from "@core/services/title/title.service";
import type { Store } from "@ngrx/store";
import type { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-subscriptions-cancelled-page",
  templateUrl: "./subscriptions-cancelled-page.component.html",
  styleUrls: ["./subscriptions-cancelled-page.component.scss"]
})
export class SubscriptionsCancelledPageComponent extends BaseComponentDirective implements OnInit {
  constructor(
    public store$: Store<MainState>,
    public readonly titleService: TitleService,
    public readonly translate: TranslateService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    const title = this.translate.instant("Subscription process cancelled");
    this.titleService.setTitle(title);
    this.store$.dispatch(new SetBreadcrumb({ breadcrumb: [{ label: "Subscriptions" }, { label: title }] }));
  }
}
