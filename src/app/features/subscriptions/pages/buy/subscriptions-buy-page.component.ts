import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { PayableProductInterface } from "@features/subscriptions/interfaces/payable-product.interface";
import { PaymentsApiConfigInterface } from "@features/subscriptions/interfaces/payments-api-config.interface";
import { PaymentsApiService } from "@features/subscriptions/services/payments-api.service";
import { SubscriptionsService } from "@features/subscriptions/services/subscriptions.service";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { JsonApiService } from "@shared/services/api/classic/json/json-api.service";
import { AppContextService } from "@shared/services/app-context/app-context.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { LoadingService } from "@shared/services/loading.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { TitleService } from "@shared/services/title/title.service";
import { UserSubscriptionService } from "@shared/services/user-subscription/user-subscription.service";
import { Observable } from "rxjs";
import { switchMap, take, takeUntil, tap } from "rxjs/operators";

declare var Stripe: any;

@Component({
  selector: "astrobin-subscriptions-buy-page",
  templateUrl: "./subscriptions-buy-page.component.html",
  styleUrls: ["./subscriptions-buy-page.component.scss"]
})
export class SubscriptionsBuyPageComponent extends BaseComponentDirective implements OnInit {
  alreadySubscribed$: Observable<boolean>;
  price$: Observable<number>;
  product: PayableProductInterface;
  bankDetailsMessage$: Observable<string>;

  constructor(
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router,
    public readonly appContextService: AppContextService,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly paymentsApiService: PaymentsApiService,
    public readonly loadingService: LoadingService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translate: TranslateService,
    public readonly titleService: TitleService,
    public readonly subscriptionsService: SubscriptionsService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly jsonApiService: JsonApiService
  ) {
    super();
  }

  get moreInfoMessage() {
    const url = "https://welcome.astrobin.com/pricing";

    return this.translate.instant(
      "For more information about this and other subscription plans, please visit the {{0}}pricing{{1}} page.",
      {
        0: `<a href="${url}" target="_blank">`,
        1: `</a>`
      }
    );
  }

  get upgradeMessage() {
    return this.translate.instant(
      "AstroBin doesn't support subscription upgrades at the moment, but we're happy to make it happen manually. If " +
        "you're on a lower subscription tier and would like to upgrade to <strong>{{0}}</strong>, please just buy it " +
        "and then contact us at {{1}} to get a refund for the unused time on your old subscription. Thanks!",
      {
        0: this.subscriptionsService.getName(this.product),
        1: "<a href=\"mailto:support@astrobin.com\">support@astrobin.com</a>"
      }
    );
  }

  ngOnInit(): void {
    this.loadingService.setLoading(true);

    this.activatedRoute.params.pipe(takeUntil(this.destroyed$)).subscribe(params => {
      this.product = params["product"];

      if (
        [PayableProductInterface.LITE, PayableProductInterface.PREMIUM, PayableProductInterface.ULTIMATE].indexOf(
          this.product
        ) === -1
      ) {
        this.router.navigateByUrl("/page-not-found", { skipLocationChange: true });
        return;
      }

      this.titleService.setTitle(this.subscriptionsService.getName(this.product));

      this.alreadySubscribed$ = this.appContextService.context$.pipe(
        take(1),
        switchMap(context =>
          this.userSubscriptionService.hasValidSubscription(
            context.currentUserProfile,
            this.subscriptionsService.getSameTierOrAbove(this.product)
          )
        )
      );

      this.price$ = this.subscriptionsService
        .getPrice(this.product)
        .pipe(tap(() => this.loadingService.setLoading(false)));

      this.bankDetailsMessage$ = this.price$.pipe(
        switchMap(price =>
          this.translate.stream(
            "Please make a deposit of {{ currency }} {{ amount }} to the following bank details and then email " +
              "us at {{ email_prefix }}{{ email }}{{ email_postfix }} with your username so we may upgrade your " +
              "account manually.",
            {
              currency: this.subscriptionsService.currency,
              amount: price.toFixed(2),
              email_prefix: "<a href='mailto:support@astrobin.com'>",
              email: "support@astrobin.com",
              email_postfix: "</a>"
            }
          )
        )
      );
    });
  }

  buy(): void {
    let stripe: any;
    let config: PaymentsApiConfigInterface;
    let userId: number;

    this.loadingService.setLoading(true);

    this.appContextService.context$
      .pipe(
        tap(context => {
          userId = context.currentUser.id;
        }),
        switchMap(() => this.paymentsApiService.getConfig().pipe(tap(_config => (config = _config)))),
        switchMap(() => {
          stripe = Stripe(config.publicKey);
          return this.paymentsApiService.createCheckoutSession(
            userId,
            this.product,
            this.subscriptionsService.currency
          );
        })
      )
      .subscribe(response => {
        if (response.sessionId) {
          stripe.redirectToCheckout({ sessionId: response.sessionId });
        } else {
          this.popNotificationsService.error(response.error || this.translate.instant("Unknown error"));
          this.loadingService.setLoading(false);
        }
      });
  }
}
