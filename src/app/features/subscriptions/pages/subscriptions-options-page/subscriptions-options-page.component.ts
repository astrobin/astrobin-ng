import { Component, OnInit } from "@angular/core";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import { SubscriptionsService } from "@features/subscriptions/services/subscriptions.service";
import { TranslateService } from "@ngx-translate/core";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { Observable } from "rxjs";

@Component({
  selector: "astrobin-subscriptions-options-page",
  templateUrl: "./subscriptions-options-page.component.html",
  styleUrls: ["./subscriptions-options-page.component.scss"]
})
export class SubscriptionsOptionsPageComponent implements OnInit {
  litePrice$: Observable<number>;
  premiumPrice$: Observable<number>;
  ultimatePrice$: Observable<number>;

  constructor(
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly subscriptionsService: SubscriptionsService,
    public readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.litePrice$ = this.subscriptionsService.getPrice(PayableProductInterface.LITE);
    this.premiumPrice$ = this.subscriptionsService.getPrice(PayableProductInterface.PREMIUM);
    this.ultimatePrice$ = this.subscriptionsService.getPrice(PayableProductInterface.ULTIMATE);
  }
}
