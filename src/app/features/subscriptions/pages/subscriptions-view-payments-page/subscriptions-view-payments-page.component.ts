import { Component, OnInit } from "@angular/core";
import { CommonApiService } from "@shared/services/api/classic/common/common-api.service";

@Component({
  selector: "astrobin-subscriptions-view-payments-page",
  templateUrl: "./subscriptions-view-payments-page.component.html",
  styleUrls: ["./subscriptions-view-payments-page.component.scss"]
})
export class SubscriptionsViewPaymentsPageComponent implements OnInit {
  payments$ = this.commonApiService.getPayments();

  constructor(public readonly commonApiService: CommonApiService) {}

  ngOnInit(): void {}
}
