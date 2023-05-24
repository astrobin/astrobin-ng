import { Component, OnInit } from "@angular/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { CommonApiService } from "@shared/services/api/classic/common/common-api.service";
import { TitleService } from "@shared/services/title/title.service";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-subscriptions-view-payments-page",
  templateUrl: "./subscriptions-view-payments-page.component.html",
  styleUrls: ["./subscriptions-view-payments-page.component.scss"]
})
export class SubscriptionsViewPaymentsPageComponent extends BaseComponentDirective implements OnInit {
  payments$ = this.commonApiService.getPayments();

  constructor(
    public readonly store$: Store<State>,
    public readonly commonApiService: CommonApiService,
    public readonly translate: TranslateService,
    public readonly titleService: TitleService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    const title = this.translate.instant("Your payments");
    this.titleService.setTitle(title);
    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [{ label: "Subscriptions" }, { label: title }]
      })
    );
  }
}
