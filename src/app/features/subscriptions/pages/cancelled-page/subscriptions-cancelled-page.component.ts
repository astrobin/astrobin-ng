import { Component, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { TitleService } from "@shared/services/title/title.service";

@Component({
  selector: "astrobin-subscriptions-cancelled-page",
  templateUrl: "./subscriptions-cancelled-page.component.html",
  styleUrls: ["./subscriptions-cancelled-page.component.scss"]
})
export class SubscriptionsCancelledPageComponent implements OnInit {
  constructor(public readonly titleService: TitleService, public readonly translate: TranslateService) {}

  ngOnInit(): void {
    this.titleService.setTitle(this.translate.instant("Subscription process cancelled"));
  }
}
