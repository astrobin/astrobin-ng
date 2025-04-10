import { OnInit, Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { selectApp } from "@app/store/selectors/app/app.selectors";
import { MainState } from "@app/store/state";
import { TitleService } from "@core/services/title/title.service";
import { SubscriptionsService } from "@features/subscriptions/services/subscriptions.service";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

declare const gtag: any;

@Component({
  selector: "astrobin-subscriptions-success-page",
  templateUrl: "./subscriptions-success-page.component.html",
  styleUrls: ["./subscriptions-success-page.component.scss"]
})
export class SubscriptionsSuccessPageComponent extends BaseComponentDirective implements OnInit {
  constructor(
    public readonly store$: Store<MainState>,
    public readonly titleService: TitleService,
    public readonly translate: TranslateService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly subscriptionsService: SubscriptionsService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.titleService.setTitle(this.translate.instant("Subscription confirmed"));

    const product = this.activatedRoute.snapshot?.queryParams["product"];

    if (!!product) {
      this.store$.select(selectApp).subscribe(state => {
        const googleAdsId = state.backendConfig.GOOGLE_ADS_ID;
        const conversionId = this.subscriptionsService.getConversionId(product);

        if (googleAdsId && typeof gtag !== "undefined" && conversionId) {
          gtag("event", "conversion", {
            send_to: `${googleAdsId}/${conversionId}`
          });
        }
      });
    }
  }
}
