import type { OnInit } from "@angular/core";
import { Component } from "@angular/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import type { MainState } from "@app/store/state";
import { CommonApiService } from "@core/services/api/classic/common/common-api.service";
import { TitleService } from "@core/services/title/title.service";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-subscriptions-view-payments-page",
  templateUrl: "./subscriptions-view-payments-page.component.html",
  styleUrls: ["./subscriptions-view-payments-page.component.scss"]
})
export class SubscriptionsViewPaymentsPageComponent extends BaseComponentDirective implements OnInit {
  payments$;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly commonApiService: CommonApiService,
    public readonly translate: TranslateService,
    public readonly titleService: TitleService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.payments$ = this.commonApiService.getPayments();

    const title = this.translate.instant("Your payments");
    this.titleService.setTitle(title);
    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [{ label: "Subscriptions" }, { label: title }]
      })
    );
  }
}
