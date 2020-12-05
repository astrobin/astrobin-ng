import { Component, OnInit } from "@angular/core";
import { SubscriptionsService } from "@features/subscriptions/services/subscriptions.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";

@Component({
  selector: "astrobin-subscriptions-options-page",
  templateUrl: "./subscriptions-options-page.component.html",
  styleUrls: ["./subscriptions-options-page.component.scss"]
})
export class SubscriptionsOptionsPageComponent implements OnInit {
  constructor(
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly subscriptionsService: SubscriptionsService
  ) {}

  ngOnInit(): void {}
}
