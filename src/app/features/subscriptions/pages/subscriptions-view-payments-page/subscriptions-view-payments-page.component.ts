import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { CommonApiService } from "@shared/services/api/classic/common/common-api.service";

@Component({
  selector: "astrobin-subscriptions-view-payments-page",
  templateUrl: "./subscriptions-view-payments-page.component.html",
  styleUrls: ["./subscriptions-view-payments-page.component.scss"]
})
export class SubscriptionsViewPaymentsPageComponent {
  payments$ = this.commonApiService.getPayments();

  constructor(public readonly commonApiService: CommonApiService, public readonly translate: TranslateService) {}

  get currencyHelpTooltipMessage(): string {
    return this.translate.instant(
      "The price is shown in Swiss Francs even though you might have paid the equivalent amount in your " +
        "country's currency."
    );
  }
}
