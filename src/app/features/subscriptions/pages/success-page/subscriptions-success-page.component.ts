import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { SubscriptionsService } from "@features/subscriptions/services/subscriptions.service";
import { TranslateService } from "@ngx-translate/core";
import { JsonApiService } from "@shared/services/api/classic/json/json-api.service";
import { TitleService } from "@shared/services/title/title.service";

declare const gtag: any;

@Component({
  selector: "astrobin-subscriptions-success-page",
  templateUrl: "./subscriptions-success-page.component.html",
  styleUrls: ["./subscriptions-success-page.component.scss"]
})
export class SubscriptionsSuccessPageComponent implements OnInit {
  constructor(
    public readonly titleService: TitleService,
    public readonly translate: TranslateService,
    public activatedRoute: ActivatedRoute,
    public jsonApiService: JsonApiService,
    public subscriptionsService: SubscriptionsService
  ) {}

  ngOnInit(): void {
    this.titleService.setTitle(this.translate.instant("Subscription confirmed"));

    const product = this.activatedRoute.snapshot.queryParams["product"];

    if (!!product) {
      this.jsonApiService.getBackendConfig$().subscribe(config => {
        const googleAdsId = config.GOOGLE_ADS_ID;
        const conversionId = this.subscriptionsService.getConversionId(product);

        if (googleAdsId) {
          gtag("event", "conversion", {
            send_to: `${googleAdsId}/${conversionId}`
          });
        }
      });
    }
  }
}
